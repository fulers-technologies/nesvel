/**
 * Private component - not routable
 * Shared UI component used across app routes
 */
export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <h1 className="text-xl font-bold">Nesvel</h1>
      </div>
    </header>
  );
}
