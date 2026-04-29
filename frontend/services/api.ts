export const API_URL = "https://invoicepilot-6g3a.onrender.com";

export const fetchInvoices = async (token: string) => {
  const res = await fetch(`${API_URL}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const createInvoice = async (token: string, data: any) => {
  return fetch(`${API_URL}/add-license`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};