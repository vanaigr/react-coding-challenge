import type { Metadata } from 'next'
import 'material-symbols'
import "./globals.css"

export const metadata: Metadata = { title: 'React coding challenge' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
            <body className='overflow-y-scroll'>
        {children}
      </body>
    </html>
  )
}
