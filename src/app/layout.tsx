export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="stylesheet" href="/css/base.css" />
        <link rel="stylesheet" href="/css/layout.css" />
        <link rel="stylesheet" href="/css/sidebar.css" />
        <link rel="stylesheet" href="/css/cards.css" />
        <link rel="stylesheet" href="/css/buttons.css" />
        <link rel="stylesheet" href="/css/code.css" />
        <link rel="stylesheet" href="/css/terms.css" />
        <link rel="stylesheet" href="/css/progress.css" />
        <link rel="stylesheet" href="/css/terminal.css" />
        <link rel="stylesheet" href="/css/toast.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
