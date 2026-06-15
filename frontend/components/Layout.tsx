"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import { User } from "firebase/auth";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  logout: () => void;
}

export default function Layout({
  children,
  user,
  logout,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-black">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header
          user={user}
          logout={logout}
        />

        <main className="p-6 flex-1 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}