import * as Papa from 'papaparse';
import * as React from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { CsvRow, GeneratedMessage, InputMode, SavedTemplate } from '@/types/blast';
import { buildWhatsAppLink, fillTemplate, formatPhone } from '@/utils/whatsapp';
import { readJson, writeJson } from '@/utils/storage';

const STORAGE_KEYS = {
  savedTemplates: 'whatsapp-blast:saved-templates:v1',
  currentTemplate: 'whatsapp-blast:current-template:v1',
} as const;

function createId() {
  const cryptoAny = globalThis.crypto as unknown as { randomUUID?: () => string } | undefined;
  if (cryptoAny?.randomUUID) return cryptoAny.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type BlastState = {
  inputMode: InputMode;
  csvRows: CsvRow[];
  columns: string[];
  template: string;
  savedTemplates: SavedTemplate[];
  generated: GeneratedMessage[];
  clickedLinks: Record<string, true>;
  isParsing: boolean;
  error: string;
};

type BlastActions = {
  setInputMode: (mode: InputMode) => void;
  setTemplate: (template: string) => void;
  parseCsvFile: (file: File | null | undefined) => void;
  parseCsvText: (text: string) => void;
  generate: () => void;
  saveTemplate: (templateText?: string) => void;
  deleteSavedTemplate: (id: string) => void;
  markClicked: (link: string) => void;
  clearResults: () => void;
  resetAll: () => void;
  setError: (msg: string) => void;
};

type BlastContextValue = BlastState & BlastActions;

const BlastContext = createContext<BlastContextValue | null>(null);

function normalizeRows(rows: unknown[], fields: string[]) {
  const normalized: CsvRow[] = [];
  for (const r of rows) {
    const row = (r ?? {}) as Record<string, unknown>;
    const out: CsvRow = {};
    for (const f of fields) out[f] = String(row[f] ?? '').trim();
    normalized.push(out);
  }
  return normalized;
}

function ensureRequiredColumns(columns: string[]) {
  const required = ['name', 'phone_code', 'phone_number'];
  const missing = required.filter((r) => !columns.includes(r));
  return { required, missing };
}

export function BlastProvider({ children }: { children: React.ReactNode }) {
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [template, setTemplate] = useState<string>(() => readJson<string>(STORAGE_KEYS.currentTemplate, ''));
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() =>
    readJson<SavedTemplate[]>(STORAGE_KEYS.savedTemplates, [])
  );
  const [generated, setGenerated] = useState<GeneratedMessage[]>([]);
  const [clickedLinks, setClickedLinks] = useState<Record<string, true>>({});
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    writeJson(STORAGE_KEYS.currentTemplate, template);
  }, [template]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.savedTemplates, savedTemplates);
  }, [savedTemplates]);

  const clearResults = useCallback(() => {
    setGenerated([]);
    setClickedLinks({});
  }, []);
  const resetAll = useCallback(() => {
    setInputMode('upload');
    setCsvRows([]);
    setColumns([]);
    setTemplate('');
    setSavedTemplates([]);
    setGenerated([]);
    setClickedLinks({});
    setError('');
    setIsParsing(false);
  }, []);

  const saveTemplate = useCallback(
    (templateText?: string) => {
      setError('');
      const text = String(templateText ?? template).trim();
      if (!text) {
        setError('Template pesan tidak boleh kosong.');
        return;
      }

      setSavedTemplates((prev) => {
        const exists = prev.some((t) => t.text.trim() === text);
        if (exists) return prev;
        const next: SavedTemplate = { id: createId(), text, createdAt: Date.now() };
        return [next, ...prev].slice(0, 30);
      });
    },
    [template]
  );

  const deleteSavedTemplate = useCallback((id: string) => {
    setSavedTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markClicked = useCallback((link: string) => {
    const key = String(link || '').trim();
    if (!key) return;
    setClickedLinks((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const parseCsvFile = useCallback((file: File | null | undefined) => {
    setError('');
    clearResults();

    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('File harus berformat .csv.');
      return;
    }

    setIsParsing(true);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const fields = (result.meta.fields ?? []).map((f) => String(f).trim()).filter(Boolean);
        const normalized = normalizeRows(result.data as unknown[], fields);
        setCsvRows(normalized);
        setColumns(fields);
        setIsParsing(false);
      },
      error: (err) => {
        setError(err.message || 'Gagal membaca CSV.');
        setIsParsing(false);
      },
    });
  }, [clearResults]);

  const parseCsvText = useCallback((text: string) => {
    setError('');
    clearResults();

    const trimmed = text.trim();
    if (!trimmed) {
      setCsvRows([]);
      setColumns([]);
      return;
    }

    setIsParsing(true);
    Papa.parse<CsvRow>(trimmed, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const fields = (result.meta.fields ?? []).map((f) => String(f).trim()).filter(Boolean);
        const normalized = normalizeRows(result.data as unknown[], fields);
        setCsvRows(normalized);
        setColumns(fields);
        setIsParsing(false);
      },
      error: (err) => {
        setError(err.message || 'Gagal membaca CSV.');
        setIsParsing(false);
      },
    });
  }, [clearResults]);

  const generate = useCallback(() => {
    setError('');

    if (!csvRows.length) {
      setError('Harap upload file CSV terlebih dahulu.');
      return;
    }
    if (!template.trim()) {
      setError('Template pesan tidak boleh kosong.');
      return;
    }

    const { missing } = ensureRequiredColumns(columns);
    if (missing.length) {
      setError(`Kolom berikut tidak ditemukan di CSV: ${missing.join(', ')}`);
      return;
    }

    const result: GeneratedMessage[] = csvRows
      .filter((row) => Object.values(row).some((v) => String(v ?? '').trim().length > 0))
      .map((row) => {
        const message = fillTemplate(template, row);
        const phone = formatPhone(row.phone_code, row.phone_number);
        return {
          name: row.name || '',
          phone,
          message,
          link: buildWhatsAppLink(phone, message),
        };
      });

    setGenerated(result);
    setClickedLinks({});
  }, [columns, csvRows, template]);

  const value = useMemo<BlastContextValue>(
    () => ({
      inputMode,
      csvRows,
      columns,
      template,
      savedTemplates,
      generated,
      clickedLinks,
      isParsing,
      error,
      setInputMode,
      setTemplate,
      parseCsvFile,
      parseCsvText,
      generate,
      saveTemplate,
      deleteSavedTemplate,
      markClicked,
      clearResults,
      resetAll,
      setError,
    }),
    [
      inputMode,
      csvRows,
      columns,
      template,
      savedTemplates,
      generated,
      clickedLinks,
      isParsing,
      error,
      parseCsvFile,
      parseCsvText,
      generate,
      saveTemplate,
      deleteSavedTemplate,
      markClicked,
      clearResults,
      resetAll,
    ]
  );

  return <BlastContext.Provider value={value}>{children}</BlastContext.Provider>;
}

export function useBlast() {
  const ctx = React.useContext(BlastContext);
  if (!ctx) throw new Error('useBlast must be used within BlastProvider');
  return ctx;
}
