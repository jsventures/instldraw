
// See https://nextjs.org/docs/pages/building-your-application/upgrading/app-router-migration
import type { Metadata } from 'next'
import "./globals.css"

export const metadata: Metadata = {
	title: 'instlDraw',
	description: 'Team oriented tldraw built with InstantDB',
  }

export default function RootLayout({
	// Layouts must accept a children prop.
	// This will be populated with nested layouts or pages
	children,
  }: {
	children: React.ReactNode
  }) {
	return (
	  <html lang="en">
		<body>{children}</body>
	  </html>
	)
  }