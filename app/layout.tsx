// This file is required by Next.js to avoid startup errors,
// even though the main application code resides in /src/app.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
