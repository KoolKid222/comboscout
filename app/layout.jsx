import './globals.css'

export const metadata = {
  title: 'ComboScout - CS2 Skin Combo Finder',
  description: 'Find the perfect CS2 knife and glove combinations within your budget',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}

