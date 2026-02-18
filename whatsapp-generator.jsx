import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Papa from "papaparse";

// ── Geometric Islamic ornament SVG ──────────────────────────────────────────
const StarOrnament = ({ size = 40, color = "#b8975a" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={color} opacity="0.18" />
    <polygon points="50,18 58,40 82,40 63,54 71,76 50,62 29,76 37,54 18,40 42,40" fill={color} opacity="0.22" />
    <circle cx="50" cy="50" r="8" fill={color} opacity="0.3" />
  </svg>
);

const GeometricBorder = () => (
  <svg width="100%" height="6" viewBox="0 0 400 6" preserveAspectRatio="none">
    <pattern id="zigzag" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
      <path d="M0,6 L10,0 L20,6" fill="none" stroke="#b8975a" strokeWidth="1.2" opacity="0.5" />
    </pattern>
    <rect width="400" height="6" fill="url(#zigzag)" />
  </svg>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #faf8f3;
    --parchment: #f2ede0;
    --gold: #b8975a;
    --gold-light: #d4b87a;
    --gold-muted: #e8dfc8;
    --green: #3a6b4a;
    --green-light: #4d8c62;
    --green-muted: #d4e8da;
    --charcoal: #2c2c2c;
    --muted: #7a7060;
    --border: #ddd5be;
    --shadow: 0 2px 20px rgba(184,151,90,0.1);
    --shadow-hover: 0 6px 32px rgba(184,151,90,0.2);
  }

  body {
    font-family: 'Nunito', sans-serif;
    background: var(--cream);
    background-image:
      radial-gradient(circle at 20% 50%, rgba(184,151,90,0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(58,107,74,0.04) 0%, transparent 50%);
    color: var(--charcoal);
    min-height: 100vh;
  }

  .app-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
  }

  /* Header */
  .header {
    text-align: center;
    padding: 2.5rem 0 2rem;
    position: relative;
  }
  .header-ornament {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .header h1 {
    font-family: 'Amiri', serif;
    font-size: 2.4rem;
    color: var(--charcoal);
    letter-spacing: 0.02em;
    line-height: 1.2;
  }
  .header h1 span { color: var(--green); }
  .header .subtitle {
    font-size: 0.88rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 0.4rem;
  }
  .bismillah {
    font-family: 'Amiri', serif;
    font-size: 1.5rem;
    color: var(--gold);
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
  }

  /* Card */
  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.75rem;
    margin-bottom: 1.25rem;
    box-shadow: var(--shadow);
    transition: box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gold), var(--green), var(--gold));
    opacity: 0.6;
  }

  .card-title {
    font-family: 'Amiri', serif;
    font-size: 1.25rem;
    color: var(--green);
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .card-title-icon { color: var(--gold); font-size: 1rem; }

  /* Instructions */
  .instruction-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
  @media(max-width: 550px) { .instruction-grid { grid-template-columns: 1fr; } }

  .instruction-block {
    background: var(--parchment);
    border-radius: 10px;
    padding: 1rem 1.1rem;
    border-left: 3px solid var(--gold);
  }
  .instruction-block h4 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-bottom: 0.5rem;
  }
  .instruction-block code {
    font-size: 0.82rem;
    background: rgba(184,151,90,0.12);
    color: var(--green);
    padding: 0.1em 0.4em;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
  .col-list { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; }
  .col-list li::before { content: "◆ "; color: var(--gold); font-size: 0.7em; }
  .col-list li { font-size: 0.88rem; }

  /* CSV Uploader */
  .drop-zone {
    border: 2px dashed var(--border);
    border-radius: 12px;
    padding: 2.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--parchment);
    margin-top: 1rem;
    position: relative;
  }
  .drop-zone:hover, .drop-zone.active {
    border-color: var(--gold);
    background: #fdf9f0;
    transform: translateY(-1px);
  }
  .drop-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .drop-icon { font-size: 2rem; margin-bottom: 0.5rem; }
  .drop-zone p { color: var(--muted); font-size: 0.9rem; }
  .drop-zone strong { color: var(--green); }

  .file-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--green-muted);
    color: var(--green);
    border-radius: 20px;
    padding: 0.35rem 0.9rem;
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 0.75rem;
  }

  /* Template Editor */
  .template-textarea {
    width: 100%;
    min-height: 110px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 0.9rem 1rem;
    font-family: 'Nunito', sans-serif;
    font-size: 0.95rem;
    color: var(--charcoal);
    background: var(--parchment);
    resize: vertical;
    transition: border-color 0.2s;
    margin-top: 1rem;
    line-height: 1.6;
  }
  .template-textarea:focus {
    outline: none;
    border-color: var(--gold);
    background: #fdf9f0;
  }
  .helper-text {
    font-size: 0.78rem;
    color: var(--muted);
    margin-top: 0.45rem;
  }
  .placeholder-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.6rem;
  }
  .tag {
    font-size: 0.75rem;
    background: rgba(58,107,74,0.1);
    color: var(--green);
    border-radius: 4px;
    padding: 0.15em 0.5em;
    font-family: monospace;
    cursor: pointer;
    border: 1px solid rgba(58,107,74,0.2);
    transition: background 0.15s;
  }
  .tag:hover { background: rgba(58,107,74,0.2); }

  /* Generate Button */
  .generate-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, var(--green), var(--green-light));
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'Amiri', serif;
    font-size: 1.2rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(58,107,74,0.25);
  }
  .generate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(58,107,74,0.35);
    background: linear-gradient(135deg, var(--green-light), var(--green));
  }
  .generate-btn:active { transform: translateY(0); }

  /* Error */
  .error-box {
    background: #fff5f5;
    border: 1px solid #f5c6c6;
    border-left: 3px solid #e05555;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.87rem;
    color: #b33;
    margin-bottom: 1rem;
  }

  /* Message List */
  .results-header {
    font-family: 'Amiri', serif;
    font-size: 1.4rem;
    color: var(--charcoal);
    margin: 2rem 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .results-count {
    background: var(--green-muted);
    color: var(--green);
    font-family: 'Nunito', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.2em 0.7em;
    border-radius: 20px;
  }

  .message-item {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-shadow: 0 1px 8px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .message-item:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  .message-left { flex: 1; min-width: 0; }
  .message-name {
    font-weight: 600;
    font-size: 0.97rem;
    color: var(--charcoal);
    margin-bottom: 0.2rem;
  }
  .message-preview {
    font-size: 0.82rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }
  .message-phone {
    font-size: 0.75rem;
    color: var(--gold);
    margin-top: 0.15rem;
    font-family: monospace;
  }

  .wa-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: #25d366;
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    padding: 0.55rem 1rem;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
    transition: background 0.15s, transform 0.15s;
    flex-shrink: 0;
  }
  .wa-btn:hover {
    background: #1ebe5d;
    transform: scale(1.04);
  }
  .wa-btn svg { width: 16px; height: 16px; fill: #fff; }

  /* Tooltip */
  .tooltip-wrap { position: relative; }
  .tooltip-wrap:hover .tooltip { display: block; }
  .tooltip {
    display: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    background: var(--charcoal);
    color: #fff;
    font-size: 0.78rem;
    border-radius: 8px;
    padding: 0.6rem 0.8rem;
    width: 280px;
    white-space: pre-wrap;
    z-index: 10;
    line-height: 1.5;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    pointer-events: none;
  }
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 12px;
    border: 6px solid transparent;
    border-top-color: var(--charcoal);
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin: 1.5rem 0;
  }

  .footer {
    text-align: center;
    color: var(--muted);
    font-size: 0.78rem;
    padding-top: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPhone(phoneCode, phoneNumber) {
  let code = String(phoneCode || "").trim();
  let num = String(phoneNumber || "").trim();
  if (!code.startsWith("+")) code = "+" + code;
  if (num.startsWith("0")) num = num.slice(1);
  return code + num;
}

function fillTemplate(template, row) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(row, key) ? row[key] : ""
  );
}

function buildLink(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ── Components ────────────────────────────────────────────────────────────────
function Instructions() {
  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">✦</span>
        Panduan Penggunaan
      </div>
      <p style={{ fontSize: "0.87rem", color: "var(--muted)", marginTop: "0.4rem" }}>
        Ikuti langkah-langkah berikut untuk membuat pesan WhatsApp massal secara otomatis.
      </p>
      <div className="instruction-grid">
        <div className="instruction-block">
          <h4>Kolom CSV yang Diperlukan</h4>
          <ul className="col-list">
            <li><code>name</code> — Nama penerima</li>
            <li><code>phone_code</code> — Kode negara (mis. +62)</li>
            <li><code>phone_number</code> — Nomor HP</li>
            <li>+ kolom tambahan bebas</li>
          </ul>
        </div>
        <div className="instruction-block">
          <h4>Format Placeholder Template</h4>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
            Gunakan <code>{"{{nama_kolom}}"}</code> di template untuk menyisipkan nilai dari CSV.<br /><br />
            Contoh: <code>{"{{sapaan}} {{name}}"}</code>
          </p>
        </div>
        <div className="instruction-block" style={{ gridColumn: "1 / -1" }}>
          <h4>Aturan Format Nomor WhatsApp</h4>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
            Angka <code>0</code> di awal nomor akan otomatis dihapus. Kode negara akan ditambahkan <code>+</code> jika belum ada.
            Link yang dihasilkan: <code>{"https://wa.me/{kode}{nomor}?text={pesan}"}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function CsvUploader({ onData, columns }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef();

  const processFile = useCallback((file) => {
    if (!file || !file.name.endsWith(".csv")) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => onData(result.data, result.meta.fields || []),
    });
  }, [onData]);

  return (
    <div className="card">
      <div className="card-title"><span className="card-title-icon">◈</span>Upload File CSV</div>
      <div
        className={`drop-zone${dragging ? " active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv"
          onChange={(e) => processFile(e.target.files[0])} />
        <div className="drop-icon">📂</div>
        <p><strong>Drag & drop</strong> file CSV di sini</p>
        <p style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>atau klik untuk memilih file</p>
      </div>
      {fileName && (
        <div style={{ marginTop: "0.75rem" }}>
          <span className="file-badge">✓ {fileName}</span>
          {columns.length > 0 && (
            <div className="placeholder-tags" style={{ marginTop: "0.6rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Kolom terdeteksi:</span>
              {columns.map(c => <span key={c} className="tag">{"{{" + c + "}}"}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TemplateEditor({ value, onChange, columns }) {
  const insertPlaceholder = (col) => {
    onChange(value + `{{${col}}}`);
  };
  return (
    <div className="card">
      <div className="card-title"><span className="card-title-icon">◇</span>Template Pesan</div>
      {columns.length > 0 && (
        <div className="placeholder-tags" style={{ marginTop: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Klik untuk sisipkan:</span>
          {columns.map(c => (
            <span key={c} className="tag" onClick={() => insertPlaceholder(c)}>
              {"{{" + c + "}}"}
            </span>
          ))}
        </div>
      )}
      <textarea
        className="template-textarea"
        placeholder="Contoh: Assalamu'alaikum {{sapaan}} {{name}}, semoga {{sapaan}} dalam lindungan Allah SWT 🌙"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="helper-text">
        Gunakan <code style={{ background: "rgba(184,151,90,0.12)", color: "var(--green)", padding: "0.1em 0.4em", borderRadius: 4, fontFamily: "monospace" }}>{"{{nama_kolom}}"}</code> untuk menyisipkan data dari CSV secara otomatis.
      </p>
    </div>
  );
}

function MessageList({ messages }) {
  if (!messages.length) return null;
  return (
    <div>
      <div className="results-header">
        <span>Hasil Generate</span>
        <span className="results-count">{messages.length} pesan</span>
      </div>
      {messages.map((m, i) => (
        <div className="message-item" key={i}>
          <div className="message-left">
            <div className="message-name">{m.name || "(tanpa nama)"}</div>
            <div className="tooltip-wrap">
              <div className="message-preview">{m.message}</div>
              <div className="tooltip">{m.message}</div>
            </div>
            <div className="message-phone">{m.phone}</div>
          </div>
          <a href={m.link} target="_blank" rel="noopener noreferrer" className="wa-btn">
            <WaIcon /> Kirim Pesan
          </a>
        </div>
      ))}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [template, setTemplate] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const handleData = (data, cols) => {
    setCsvData(data);
    setColumns(cols);
    setMessages([]);
    setError("");
  };

  const generate = () => {
    setError("");
    if (!csvData.length) { setError("Harap upload file CSV terlebih dahulu."); return; }
    if (!template.trim()) { setError("Template pesan tidak boleh kosong."); return; }
    const required = ["name", "phone_code", "phone_number"];
    const missing = required.filter(r => !columns.includes(r));
    if (missing.length) { setError(`Kolom berikut tidak ditemukan di CSV: ${missing.join(", ")}`); return; }

    const result = csvData
      .filter(row => Object.values(row).some(v => v && v.trim()))
      .map(row => {
        const message = fillTemplate(template, row);
        const phone = formatPhone(row.phone_code, row.phone_number);
        return { name: row.name, message, phone, link: buildLink(phone, message) };
      });
    setMessages(result);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">
        {/* Header */}
        <div className="header">
          <div className="bismillah">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
          <div className="header-ornament">
            <StarOrnament />
            <h1>WA <span>Blast</span> Generator</h1>
            <StarOrnament />
          </div>
          <p className="subtitle">Pesan WhatsApp Massal Berbasis Template CSV</p>
          <GeometricBorder />
        </div>

        <Instructions />
        <CsvUploader onData={handleData} columns={columns} />
        <TemplateEditor value={template} onChange={setTemplate} columns={columns} />

        {error && <div className="error-box">⚠ {error}</div>}

        <button className="generate-btn" onClick={generate}>
          <span>✦</span> Generate Pesan <span>✦</span>
        </button>

        <MessageList messages={messages} />

        <div className="footer">
          <StarOrnament size={16} /> Semoga bermanfaat dan berkah <StarOrnament size={16} />
        </div>
      </div>
    </>
  );
}
