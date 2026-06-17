"use client";

import { useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth, provider } from "@/firebase";
import Layout from "@/components/Layout";

import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import GoogleWorkspaceCard from "@/components/dashboard/GoogleWorkspaceCard";
import ZohoCard from "@/components/dashboard/ZohoCard";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import RecentOrders from "@/components/dashboard/RecentOrders";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";
import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
  revenue: 0,
  customers: 0,
  products: 0,
  orders: 0,
  recentOrders: [],
  recentInvoices: [],
  upcomingRenewals: [],
});

const loadDashboard = async (currentUser: User) => {
  try {
    const token = await currentUser.getIdToken();

    const res = await fetch(
      "https://invoicepilot-6g3a.onrender.com/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setDashboard(data);

  } catch (err) {
    console.error(err);
  }
};

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
    if (u) {
      setUser(u);
      await loadDashboard(u);
    }

    setLoading(false);
  });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Stats */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard
            title="Revenue"
            value={`₹${dashboard.revenue}`}
          />

          <StatCard
            title="Customers"
            value={dashboard.customers}
            color="text-blue-400"
          />

          <StatCard
            title="Orders"
            value={dashboard.orders}
            color="text-yellow-400"
          />

          <StatCard
            title="Products"
            value={dashboard.products}
            color="text-purple-400"
          />

        </div>

        {/* Revenue Chart */}

        <RevenueChart />

        {/* Workspace + Zoho */}

        <div className="grid lg:grid-cols-2 gap-6">

          <GoogleWorkspaceCard />

          <ZohoCard />

        </div>

        {/* Recent Activity */}

        <div className="grid lg:grid-cols-2 gap-6">

          <RecentOrders
            orders={dashboard.recentOrders}
          />

          <RecentInvoices
            invoices={dashboard.recentInvoices}
          />

        </div>

        {/* Bottom Section */}

        <div className="grid lg:grid-cols-2 gap-6">

          <UpcomingRenewals
            renewals={dashboard.upcomingRenewals}
          />

          <QuickActions />

        </div>

      </div>
    </Layout>
  );
}