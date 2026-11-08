import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { API_BASE } from '../api/client';

interface R { restaurant_id: number; name: string; zone?: string; category?: string }
type Mode = 'bridge' | 'web';

const BRIDGE = (import.meta.env.VITE_BRIDGE_BASE as string) || 'https://cgc-knu.github.io/wouldulike_deeplink/';

export function qrUrl(mode: Mode, id: number, webBase: string, src: string) {
  if (mode === 'web') return `${webBase.replace(/\/$/, '')}/s/${id}?src=${src}`;
  return `${BRIDGE}?type=restaurant&id=${id}&src=${src}`;
}

function Qr({ url, name, id }: { url: string; name: string; id: number }) {
  const [png, setPng] = useState('');
  useEffect(() => { QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#312E81' } }).then(setPng); }, [url]);
  const svg = async () => {
    const s = await QRCode.toString(url, { type: 'svg', margin: 2, errorCorrectionLevel: 'H' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }));
    a.download = `qr_${id}_${name}.svg`; a.click();
  };
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <b>{name}</b> <span className="note">#{id}</span>
      {png && <img src={png} alt={`${name} QR`} style={{ width: '100%', maxWidth: 220, display: 'block', margin: '8px auto' }} />}
      <p className="note" style={{ wordBreak: 'break-all', userSelect: 'all' }}>{url}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <a className="btn light" style={{ minHeight: 44, fontSize: 14 }} href={png} download={`qr_${id}_${name}.png`}>PNG</a>
        <button className="btn light" style={{ minHeight: 44, fontSize: 14 }} onClick={svg}>SVG(인쇄용)</button>
        <a className="btn light" style={{ minHeight: 44, fontSize: 14 }} href={url} target="_blank" rel="noreferrer">테스트</a>
      </div>
    </div>
  );
}

export default function QrAdmin() {
  const [list, setList] = useState<R[]>([]);
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('bridge');
  const [webBase, setWebBase] = useState((import.meta.env.VITE_WEB_BASE as string) || location.origin);
  const [src, setSrc] = useState('sticker');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/restaurants/tab-restaurants/`).then(r => r.json())
      .then(d => setList(d.affiliate_restaurants ?? [])).catch(() => setErr('매장 목록을 불러오지 못했어요.'));
  }, []);

  const shown = useMemo(() => list.filter(r => r.name.includes(q) || String(r.restaurant_id) === q), [list, q]);

  return (
    <main className="page" style={{ maxWidth: 520 }}>
      <h1>QR 스티커 주소</h1>
      <p className="sub">제휴 매장 {list.length}곳. 스티커에는 QR 이미지 아래 주소가 그대로 인코딩돼요.</p>
      <div className="card">
        <label><input type="radio" checked={mode === 'bridge'} onChange={() => setMode('bridge')} /> <b>브릿지 경유 (권장)</b><br />
          <span className="note">앱 있으면 앱, 없으면 웹 스탬프로. 브릿지의 "앱 없음" 분기를 웹 주소로 바꾸는 작업 후 사용</span></label>
        <br /><br />
        <label><input type="radio" checked={mode === 'web'} onChange={() => setMode('web')} /> <b>웹 직접 연결</b><br />
          <span className="note">앱 설치 여부와 무관하게 항상 웹으로 열림</span></label>
        {mode === 'web' && <input style={{ width: '100%', marginTop: 8, padding: 10 }} value={webBase} onChange={e => setWebBase(e.target.value)} placeholder="https://웹도메인" />}
        <input style={{ width: '100%', marginTop: 8, padding: 10 }} value={src} onChange={e => setSrc(e.target.value)} placeholder="src 값 (sticker)" />
      </div>
      <input style={{ width: '100%', padding: 12, marginBottom: 12 }} value={q} onChange={e => setQ(e.target.value)} placeholder="매장명 또는 ID 검색" />
      {err && <p className="err">{err}</p>}
      {shown.map(r => <Qr key={r.restaurant_id} id={r.restaurant_id} name={r.name} url={qrUrl(mode, r.restaurant_id, webBase, src)} />)}
    </main>
  );
}
