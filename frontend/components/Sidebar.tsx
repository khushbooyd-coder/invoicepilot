'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Boxes, ShoppingCart,
  KeyRound, Mail, BarChart3, Settings, Bot, LogOut,
} from 'lucide-react';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

const menu = [
  { name: 'Overview',   href: '/dashboard',   icon: LayoutDashboard },
  { name: 'Customers',  href: '/customers',   icon: Users           },
  { name: 'Products',   href: '/products',    icon: Boxes           },
  { name: 'Orders',     href: '/orders',      icon: ShoppingCart    },
  { name: 'Licenses',   href: '/licenses',    icon: KeyRound        },
  { name: 'Workspace',  href: '/workspace',   icon: Mail            },
  { name: 'Automation', href: '/automation',  icon: Bot             },
  { name: 'Analytics',  href: '/analytics',   icon: BarChart3       },
  { name: 'Settings',   href: '/settings',    icon: Settings        },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/login'); // redirect if not logged in
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.push('/login');
  }

  return (
    <aside className="sticky top-0 h-screen w-64 bg-black border-r border-zinc-800 flex flex-col">

      {/* Logo */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white">DOTSOL</h1>
        <p className="text-zinc-500 text-sm mt-1">ONE Platform</p>
      </div>

      {/* Nav */}
      <nav className="px-4 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl mb-2 transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-zinc-800 p-4">
        {user && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
              )}
              <div>
                <p className="text-white text-xs font-medium leading-tight">
                  {user.displayName || 'User'}
                </p>
                <p className="text-zinc-500 text-xs leading-tight truncate w-32">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
        <p className="text-zinc-600 text-xs">DOTSOL Platform · v1.0.0</p>
      </div>

    </aside>
  );
}