import { GeometricBorder, StarOrnament } from './Ornaments';

export function AppHeader() {
  return (
    <div className="header">
      <div className="bismillah">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
      <div className="header-ornament">
        <StarOrnament />
        <h1>
          WA <span>Blast</span> Generator
        </h1>
        <StarOrnament />
      </div>
      <p className="subtitle">Pesan WhatsApp Massal Berbasis Template CSV</p>
      <GeometricBorder />
    </div>
  );
}
