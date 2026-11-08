import type { ReactNode } from 'react';
export const Page = ({ children }: { children: ReactNode }) => <main className="page">{children}</main>;
export const CtaBar = ({ children }: { children: ReactNode }) => <div className="cta-bar">{children}</div>;
export const Loading = () => <Page><div className="center"><p className="sub">불러오는 중…</p></div></Page>;
export const Notice = ({ title, desc }: { title: string; desc?: string }) => (
  <Page><div className="center"><h1>{title}</h1>{desc && <p className="sub">{desc}</p>}</div></Page>
);
