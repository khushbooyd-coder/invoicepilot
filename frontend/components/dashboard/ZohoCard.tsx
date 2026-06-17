"use client";

export default function ZohoCard() {
  const zoho = {
    books: 214,
    leads: 47,
    tickets: 5,
    mailboxes: 28,
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-xl font-semibold mb-6">
        Zoho
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span className="text-zinc-400">📚 Books Invoices</span>
          <span className="font-bold">{zoho.books}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">🎯 CRM Leads</span>
          <span className="font-bold">{zoho.leads}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">🎫 Open Tickets</span>
          <span className="font-bold">{zoho.tickets}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">📧 Mailboxes</span>
          <span className="font-bold">{zoho.mailboxes}</span>
        </div>

      </div>

    </div>
  );
}