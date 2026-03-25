import Link from "next/link";

export const Header = () => (
  <header className="border-b bg-white">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <Link href="/" className="font-bold">Test Ride Booking</Link>
      <nav className="flex gap-4 text-sm">
        <Link href="/wagens">Wagens</Link>
        <Link href="/admin">Admin</Link>
      </nav>
    </div>
  </header>
);
