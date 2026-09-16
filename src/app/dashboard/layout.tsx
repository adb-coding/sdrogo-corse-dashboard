import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Classifica | Melagoodo Dashboard',
  description: 'Classifiche e statistiche dei campionati Melagoodo',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
