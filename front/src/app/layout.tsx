import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { StarknetProvider } from '@/components/starknet-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sybil Detection dApp',
  description: 'Detect Sybil attacks on Starknet using ML',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <StarknetProvider> 
          <header className="border-b border-gray-800">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold">Sybil Detector</span>
              </Link>
              <div className="space-x-4">
                <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
                <Link href="/about" className="hover:text-blue-500 transition-colors">About</Link>
                <Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link>
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-800 mt-8">
            <div className="container mx-auto px-4 py-4 text-center text-gray-500">
              Starknet Sybil attack detection dApp *in development*
            </div>
          </footer>
        </StarknetProvider> {/* Close the StarknetProvider */}
      </body>
    </html>
  );
}
