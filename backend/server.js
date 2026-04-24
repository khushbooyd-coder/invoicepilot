const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

let invoices = [];

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

// Add license
app.post("/add-license", (req, res) => {
  const { price, startDate, renewalDate } = req.body;

  if (!price || !startDate || !renewalDate) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const diffDays = Math.ceil(
    (new Date(renewalDate) - new Date(startDate)) /
    (1000 * 60 * 60 * 24)
  );

  const amount = (price / 30) * diffDays;

  const invoice = {
    id: Date.now(),
    amount: Number(amount.toFixed(2)),
    days: diffDays,
    status: "Pending",
    startDate,
    renewalDate,
  };

  invoices.push(invoice);

  res.json(invoice);
});

// Get invoices
app.get("/invoices", (req, res) => {
  res.json(invoices);
});

// ✅ ONLY ONE LISTEN (VERY IMPORTANT)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});