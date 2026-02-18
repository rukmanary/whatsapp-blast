import * as Papa from 'papaparse';
import { useBlast } from '@/context/BlastContext';
import { useClipboard } from '@/hooks/useClipboard';
import { downloadTextFile } from '@/utils/download';
import { WaIcon } from './Ornaments';

export function ResultsCard() {
  const { generated, setError, clickedLinks, markClicked } = useBlast();
  const { copyText, lastError } = useClipboard();

  if (!generated.length) return null;

  const exportCsv = () => {
    const csv = Papa.unparse(
      generated.map((g) => ({ name: g.name, phone: g.phone, message: g.message, link: g.link }))
    );
    downloadTextFile('whatsapp-blast-messages.csv', csv, 'text/csv;charset=utf-8');
  };

  const copyAllMessages = async () => {
    const text = generated.map((g) => g.message).join('\n\n');
    const ok = await copyText(text);
    if (!ok) setError(lastError || 'Copy failed.');
  };

  const copyAllLinks = async () => {
    const text = generated.map((g) => g.link).join('\n');
    const ok = await copyText(text);
    if (!ok) setError(lastError || 'Copy failed.');
  };

  return (
    <div>
      <div className="results-header">
        <span>Hasil Generate</span>
        <span className="results-count">{generated.length} pesan</span>
      </div>

      <div className="placeholder-tags" style={{ marginTop: '0.1rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Aksi:</span>
        <button type="button" className="tag" onClick={copyAllMessages}>
          Copy Pesan
        </button>
        <button type="button" className="tag" onClick={copyAllLinks}>
          Copy Link
        </button>
        <button type="button" className="tag" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      {generated.map((g, idx) => (
        <div
          key={`${g.phone}-${idx}`}
          className={`message-item${clickedLinks[g.link] ? ' clicked' : ''}`}
          data-clicked={clickedLinks[g.link] ? 'true' : 'false'}
        >
          <div className="message-left">
            <div className="message-name">{g.name || '(tanpa nama)'}</div>
            <div className="tooltip-wrap">
              <div className="message-preview">{g.message}</div>
              <div className="tooltip">{g.message}</div>
            </div>
            <div className="message-phone">{g.phone}</div>
          </div>
          <a
            href={g.link}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-btn"
            onClick={() => markClicked(g.link)}
          >
            <WaIcon /> Kirim Pesan
          </a>
        </div>
      ))}
    </div>
  );
}
