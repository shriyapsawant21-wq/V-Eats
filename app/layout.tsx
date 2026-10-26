import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'V-Eats | Your campus. Your cravings.', description: 'Discover your next favourite bite around campus.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
