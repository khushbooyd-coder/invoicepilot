"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  Boxes,
  ShoppingCart,
  KeyRound,
  Mail,
  BarChart3,
  Settings,
  Bot,
} from "lucide-react";

const menu = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Products",
    href: "/products",
    icon: Boxes,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Licenses",
    href: "/licenses",
    icon: KeyRound,
  },
  {
    name: "Workspace",
    href: "/workspace",
    icon: Mail,
  },
  {
    name: "Automation",
    href: "/automation",
    icon: Bot,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-64 bg-black border-r border-zinc-800 flex flex-col">
      <div className="p-8">

        <h1 className="text-2xl font-bold text-white">
          DOTSOL
        </h1>

        <p className="text-zinc-500 text-sm mt-1">
          ONE Platform
        </p>

      </div>

      <nav className="px-4">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl mb-2 transition-all

                ${
                  pathname === item.href
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }
              `}
            >

              <Icon size={20} />

              <span>{item.name}</span>

            </Link>
          );

        })}

      </nav>
      <div className="border-t border-zinc-800 p-4 text-xs text-zinc-500">
          DOTSOL Platform
          <br />
          Version 1.0.0
      </div>

    </aside>
    
  );
  
}
