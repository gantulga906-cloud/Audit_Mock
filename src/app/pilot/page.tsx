import type { Metadata } from 'next';
import PilotWorkspace from '@/components/pilot-workspace';

export const metadata: Metadata = { title: 'Veritech Audit — Аудитын ажлын орчин' };

export default function PilotPage() {
  return <PilotWorkspace />;
}
