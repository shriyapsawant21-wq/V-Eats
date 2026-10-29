import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'V-Eats | VIT Vellore', description: 'VIT Vellore food discovery and Oracle database project.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
