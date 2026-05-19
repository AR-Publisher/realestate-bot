import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600']
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700']
})

export const metadata = {
  title: 'PropMatch AI — Find Your Perfect Property',
  description: 'AI-powered property qualification and matching for real estate',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  )
}
