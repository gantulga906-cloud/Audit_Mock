import type { Metadata } from 'next';
import './globals.css';
import './workspace-v2.css';
export const metadata: Metadata = { title: 'Veritech Audit — Багийн ажлын орчин', description: 'Ажлын төлөвлөгөө, хуанли, нотлох баримт, хяналт ба тайлагналын холбоотой интерактив загвар.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="mn"><body>{children}</body></html>; }
