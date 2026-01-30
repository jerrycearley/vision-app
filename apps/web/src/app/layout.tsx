import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'Vision App',
  description: 'Your personalized learning and career development platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
