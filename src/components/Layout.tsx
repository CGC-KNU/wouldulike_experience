import type { ReactNode } from 'react';
export const Page = ({ children }: { children: ReactNode }) => <main className="page">{children}</main>;
export const CtaBar = ({ children }: { children: ReactNode }) => <div className="cta-bar">{children}</div>;
export const Loading = () => <Page><div className="center"><p className="sub">불러오는 중…</p></div></Page>;
export const Notice = ({ title, desc }: { title: string; desc?: string | string[] }) => (
  <Page><div className="center"><h1>{title}</h1>{desc && <p className="sub"><Lines lines={desc} /></p>}</div></Page>
);

/** 문장을 직접 끊어서 줄마다 한 덩어리로 보여 준다(긴 문장이 어색한 곳에서 꺾이지 않게). 문자열이면 한 줄. */
export function Lines({ lines }: { lines: string | string[] }) {
  const list = Array.isArray(lines) ? lines : [lines];
  return <>{list.map((l, i) => <span className="ln" key={i}>{l}</span>)}</>;
}

/** 안내 배너: 굵은 제목 한 줄 + 짧게 끊은 설명 */
export function Banner({ icon, title, sub, tone = 'info' }: {
  icon: string; title: string; sub?: string | string[]; tone?: 'info' | 'ok';
}) {
  return (
    <div className={`banner ${tone}`} role="status">
      <span className="bn-ic" aria-hidden="true">{icon}</span>
      <div className="bn-tx">
        <b>{title}</b>
        {sub && <p><Lines lines={sub} /></p>}
      </div>
    </div>
  );
}
