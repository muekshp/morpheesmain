import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'MORPH AI — Autonomous Simulation Engine',
  description: 'Turn reports and real-world data into multi-agent simulations to explore scenarios, predict outcomes, and find the best strategies.',
  openGraph: {
    title: 'MORPH AI — Autonomous Simulation Engine',
    description: 'Turn reports and real-world data into multi-agent simulations to explore scenarios, predict outcomes, and find the best strategies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MORPH AI — Autonomous Simulation Engine',
    description: 'Turn reports and real-world data into multi-agent simulations to explore scenarios, predict outcomes, and find the best strategies.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Intercept and prevent extension errors trying to override read-only window.fetch
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.indexOf('fetch') !== -1 || (e.filename && e.filename.indexOf('chrome-extension:') !== -1))) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return true;
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && typeof e.reason.message === 'string' && e.reason.message.indexOf('fetch') !== -1) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return true;
                }
              }, true);
              // Clean up any lingering service workers from previous localhost projects
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                  }
                }).catch(function() {});
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen antialiased overflow-x-hidden">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
