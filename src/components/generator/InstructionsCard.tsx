export function InstructionsCard() {
  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">✦</span>
        Panduan Penggunaan
      </div>
      <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
        Ikuti langkah-langkah berikut untuk membuat pesan WhatsApp massal secara otomatis.
      </p>
      <div className="instruction-grid">
        <div className="instruction-block">
          <h4>Kolom CSV yang Diperlukan</h4>
          <ul className="col-list">
            <li>
              <code>name</code> — Nama penerima
            </li>
            <li>
              <code>phone_code</code> — Kode negara (mis. +62)
            </li>
            <li>
              <code>phone_number</code> — Nomor HP
            </li>
            <li>+ kolom tambahan bebas</li>
          </ul>
        </div>
        <div className="instruction-block">
          <h4>Format Placeholder Template</h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            Gunakan <code>{'{{nama_kolom}}'}</code> di template untuk menyisipkan nilai dari CSV.
            <br />
            <br />
            Contoh: <code>{'{{sapaan}} {{name}}'}</code>
          </p>
        </div>
        <div className="instruction-block" style={{ gridColumn: '1 / -1' }}>
          <h4>Aturan Format Nomor WhatsApp</h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            Angka <code>0</code> di awal nomor akan otomatis dihapus. Kode negara akan ditambahkan <code>+</code> jika
            belum ada. Link yang dihasilkan: <code>{'https://wa.me/{kode}{nomor}?text={pesan}'}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
