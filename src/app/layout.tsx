import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Veritech Audit — Ажлын орчин', description: 'Аудитын багийн холбоотой ажлын орчин. Интерактив эхний загвар.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="mn"><body>{children}</body></html>; }
