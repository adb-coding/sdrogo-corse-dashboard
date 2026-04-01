import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Piloti | Sdrogo Corse Dashboard',
  description: 'Statistiche dettagliate di tutti i piloti',
}

export default function DriversLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}