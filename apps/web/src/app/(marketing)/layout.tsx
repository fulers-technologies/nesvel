import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nesvel - Marketing',
  description: 'Marketing pages layout',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4">
          {/* Marketing navigation */}
        </nav>
      </header>
      <main className="min-h-screen">{children}</main>
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          {/* Marketing footer */}
        </div>
      </footer>
    </div>
  );
}
