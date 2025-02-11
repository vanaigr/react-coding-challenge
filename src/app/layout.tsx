import type { Metadata } from 'next'
import 'material-symbols'
import "./globals.css"

export const metadata: Metadata = { title: 'React coding challenge' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body>
        {children}
      </body>
    </html>
  )
}
