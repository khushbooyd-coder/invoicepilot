"use client";

import { User } from "firebase/auth";

interface HeaderProps {
  user: User | null;
  logout: () => void;
}

export default function Header({ user, logout }: HeaderProps) {
  return (
    <div className="flex justify-between items-center bg-gray-900 border-b border-gray-700 p-5">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-gray-400">
          Welcome back 👋
        </p>
      </div>

      <div className="flex items-center gap-4">

        <div className="bg-gray-800 px-4 py-2 rounded-lg text-white">
          {user?.displayName}
        </div>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

    </div>
  );
}