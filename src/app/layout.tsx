import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LogPulse | The 2-Minute Product Changelog & Feature Roadmap Widget',
  description: 'Keep your users engaged, reduce churn, and turn product updates into a growth engine with an embeddable in-app widget.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
