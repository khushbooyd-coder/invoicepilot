const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 5001;

// 🔐 Firebase init (SAFE for Render)
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

// ✅ Add license
app.post("/add-license", async (req, res) => {
  try {
    const { price, startDate, renewalDate, customer } = req.body;

    if (!price || !startDate || !renewalDate) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const diffDays = Math.ceil(
      (new Date(renewalDate) - new Date(startDate)) /
      (1000 * 60 * 60 * 24)
    );

    const amount = (price / 30) * diffDays;

    const invoice = {
      amount: Number(amount.toFixed(2)),
      days: diffDays,
      status: "Pending",
      startDate,
      renewalDate,
      customer: customer || "Client",
      createdAt: new Date(),
    };

    const docRef = await db.collection("invoices").add(invoice);

    res.json({ id: docRef.id, ...invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get invoices
app.get("/invoices", async (req, res) => {
  try {
    const snapshot = await db.collection("invoices").get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Check renewals
app.get("/check-renewals", async (req, res) => {
  try {
    const snapshot = await db.collection("invoices").get();
    const today = new Date();

    const due = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (inv) =>
          new Date(inv.renewalDate) <= today &&
          inv.status !== "Paid"
      );

    res.json({ due });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Mark as paid
app.put("/pay-invoice/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await db.collection("invoices").doc(id).update({
      status: "Paid",
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});