import './globals.css';

export const metadata = {
  title: 'GodakPin Frontend',
  description: 'Next.js frontend placeholder',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
