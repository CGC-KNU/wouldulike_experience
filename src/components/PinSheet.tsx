import { useState } from 'react';

export function PinSheet({ pinLen, maxCount, error, shake, busy, onSubmit, onClose }: {
  pinLen: number; maxCount: number; error: string; shake: boolean; busy: boolean;
  onSubmit: (pin: string, count: number) => void; onClose: () => void;
}) {
  const [pin, setPin] = useState('');
  const [count, setCount] = useState(1);
  const press = (k: string) => {
    if (busy) return;
    if (k === '⌫') setPin(p => p.slice(0, -1));
    else setPin(p => (p.length < pinLen ? p + k : p));
  };
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="스탬프 적립" style={{ maxHeight: '92dvh', overflowY: 'auto' }}>
        <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>스탬프 적립</h1>
        <p className="sub" style={{ margin: '0 0 12px' }}>직원에게 매장 PIN {pinLen}자리를 입력해 달라고 해주세요.</p>
        <div className="chips" role="radiogroup" aria-label="적립 개수">
          {Array.from({ length: maxCount }, (_, i) => i + 1).map(n => (
            <button key={n} role="radio" aria-checked={count === n} className={count === n ? 'on' : ''} onClick={() => setCount(n)}>{n}개</button>
          ))}
        </div>
        <div className={`pin${shake ? ' shake' : ''}`} aria-live="polite" style={{ margin: '14px 0 8px' }}>
          {Array.from({ length: pinLen }, (_, i) => <i key={i} className={pin[i] ? 'f' : ''}>{pin[i] ? '●' : ''}</i>)}
        </div>
        <p className="err" role="alert">{error}</p>
        <div className="pad">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) =>
            k ? <button key={i} onClick={() => press(k)} aria-label={k === '⌫' ? '지우기' : k}>{k}</button> : <span key={i} />)}
        </div>
        <button className="btn" style={{ marginTop: 12 }} disabled={busy || pin.length !== pinLen} onClick={() => onSubmit(pin, count)}>
          {busy ? '적립 중…' : `스탬프 ${count}개 적립하기`}
        </button>
      </div>
    </>
  );
}
