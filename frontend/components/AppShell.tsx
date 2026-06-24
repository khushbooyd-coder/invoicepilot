'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const PUBLIC_ROUTES = ['/login', '/register'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>
    </>
  );
}