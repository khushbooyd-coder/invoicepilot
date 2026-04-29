const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebase");
const verifyToken = require("../middleware/auth");

// ➕ CREATE
router.post("/add-license", verifyToken, async (req, res) => {
  try {
    const { customer, amount, startDate, renewalDate } = req.body;

    if (!customer || !amount || !startDate || !renewalDate) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const start = new Date(startDate);
    const end = new Date(renewalDate);

    if (end <= start) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const doc = await db.collection("invoices").add({
      userId: req.user.uid,
      customer,
      amount: Number(amount),
      status: "Pending",
      startDate,
      renewalDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: doc.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 GET INVOICES
router.get("/invoices", verifyToken, async (req, res) => {
  try {
    const snapshot = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .get();

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// ✏️ UPDATE
router.put("/update-invoice/:id", verifyToken, async (req, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const doc = await docRef.get();

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

      await docRef.update({
      customer: req.body.customer,
      price: Number(req.body.price), // ✅ ADD
      amount: Number(req.body.amount),
      startDate: req.body.startDate,
      renewalDate: req.body.renewalDate,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 💰 MARK AS PAID
router.put("/pay-invoice/:id", verifyToken, async (req, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const doc = await docRef.get();

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await docRef.update({ status: "Paid" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark paid" });
  }
});

// 🗑 DELETE
router.delete("/delete-invoice/:id", verifyToken, async (req, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const doc = await docRef.get();

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await docRef.delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ✅ ALWAYS LAST
module.exports = router;