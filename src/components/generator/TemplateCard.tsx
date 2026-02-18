import { useMemo, useState } from 'react';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useBlast } from '@/context/BlastContext';

export function TemplateCard() {
  const { template, setTemplate, columns, savedTemplates, saveTemplate, deleteSavedTemplate } = useBlast();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const insertPlaceholder = (col: string) => {
    setTemplate(template + `{{${col}}}`);
  };

  const confirmingTemplate = useMemo(() => {
    if (!confirmingId) return null;
    return savedTemplates.find((t) => t.id === confirmingId) ?? null;
  }, [confirmingId, savedTemplates]);

  const confirmDelete = () => {
    if (!confirmingId) return;
    deleteSavedTemplate(confirmingId);
    setConfirmingId(null);
  };

  const formatChipLabel = (text: string) => {
    const single = text.replace(/\s+/g, ' ').trim();
    if (single.length <= 26) return single;
    return `${single.slice(0, 26)}…`;
  };

  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">◇</span>
        Template Pesan
      </div>
      {columns.length ? (
        <div className="placeholder-tags" style={{ marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Klik untuk sisipkan:</span>
          {columns.map((c) => (
            <span key={c} className="tag" onClick={() => insertPlaceholder(c)}>
              {`{{${c}}}`}
            </span>
          ))}
        </div>
      ) : null}
      <textarea
        className="template-textarea"
        placeholder="Contoh: Assalamu'alaikum {{sapaan}} {{name}}, semoga {{sapaan}} dalam lindungan Allah SWT 🌙"
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
      />
      <p className="helper-text">
        Gunakan{' '}
        <code
          style={{
            background: 'rgba(184,151,90,0.12)',
            color: 'var(--green)',
            padding: '0.1em 0.4em',
            borderRadius: 4,
            fontFamily: 'monospace',
          }}
        >
          {'{{nama_kolom}}'}
        </code>{' '}
        untuk menyisipkan data dari CSV secara otomatis.
      </p>

      <div className="placeholder-tags" style={{ marginTop: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Aksi:</span>
        <button type="button" className="tag" onClick={() => saveTemplate()}>
          Simpan Template
        </button>
      </div>

      {savedTemplates.length ? (
        <div style={{ marginTop: '0.75rem' }}>
          <div className="helper-text" style={{ marginTop: 0 }}>
            Template tersimpan:
          </div>
          <div className="chips-row" style={{ marginTop: '0.5rem' }}>
            {savedTemplates.map((t) => (
              <div key={t.id} className="tooltip-wrap template-chip" title="">
                <button type="button" className="chip-label" onClick={() => setTemplate(t.text)}>
                  {formatChipLabel(t.text)}
                </button>
                <button
                  type="button"
                  className="chip-x"
                  aria-label="Hapus template"
                  onClick={() => setConfirmingId(t.id)}
                >
                  ×
                </button>
                <div className="tooltip">{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(confirmingTemplate)}
        title="Hapus template?"
        message="Template ini akan dihapus dari daftar template tersimpan."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onCancel={() => setConfirmingId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
