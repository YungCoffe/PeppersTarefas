export const metadata = {
  title: 'Peppers - Sala do Futuro',
  description: 'Gerenciador de atividades da Sala do Futuro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
