import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Learning Notebook',
  description: 'Official baseline note-taking application for mastering database relationships, schema migrations, and Server Actions in Next.js.',
  openGraph: {
    title: 'Learning Notebook',
    description: 'A simple notebook for collecting study notes and ideas.',
    siteName: 'Learning Notebook',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-neo-bg text-black selection:bg-neo-yellow selection:text-black">
        <main className="min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}
