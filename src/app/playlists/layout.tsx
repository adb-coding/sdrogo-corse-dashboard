import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Elenchi | Sdrogo Corse Dashboard',
  description: 'Tutti gli elenchi delle Sdrogo Corse',
}

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}