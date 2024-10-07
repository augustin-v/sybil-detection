import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Brain } from 'lucide-react'
import { StarknetProvider } from '@/components/starknet-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Starknet Sybil Detection dApp',
  description: 'Detect Sybil attacks on Starknet using ML',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-900 text-gray-100`}>
        <StarknetProvider>
          <header className="border-b border-gray-800">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Brain className="w-8 h-8 text-purple-500" />
                <span className="text-xl font-bold">Mini Starknet Sybil Detector</span>
              </Link>
              <div className="space-x-4">
                <NavLink href="/">Home</NavLink>
                <NavLink href="https://github.com/augustin-v/sybil-detection">Project folder</NavLink>
              </div>
            </nav>
          </header>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-800 mt-auto">
            <div className="container mx-auto px-4 py-4 text-center text-gray-500">
              Mini Starknet Sybil attack detection dApp in development
            </div>
          </footer>
        </StarknetProvider>
      </body>
    </html>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-blue-500 transition-colors">
      {children}
    </Link>
  )
} 