import { useCallback, useRef, useState } from 'react';
import { useBlast } from '@/context/BlastContext';

export function CsvInputCard() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { parseCsvFile, columns } = useBlast();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const processFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv')) return;
      setFileName(file.name);
      parseCsvFile(file);
    },
    [parseCsvFile]
  );

  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">◈</span>
        Upload File CSV
      </div>
      <div
        className={`drop-zone${dragging ? ' active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          aria-label="Upload CSV"
          onChange={(e) => processFile(e.target.files?.[0])}
        />
        <div className="drop-icon">📂</div>
        <p>
          <strong>Drag & drop</strong> file CSV di sini
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>atau klik untuk memilih file</p>
      </div>
      {fileName ? (
        <div style={{ marginTop: '0.75rem' }}>
          <span className="file-badge">✓ {fileName}</span>
          {columns.length ? (
            <div className="placeholder-tags" style={{ marginTop: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Kolom terdeteksi:</span>
              {columns.map((c) => (
                <span key={c} className="tag">{`{{${c}}}`}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
