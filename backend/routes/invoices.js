const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebase");
const verifyToken = require("../middleware/auth");

// ➕ CREATE
router.post("/invoices", verifyToken, async (req, res) => {
  try {
    const {
      invoiceNo,
      customerId,
      customerName,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      status,
    } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        error: "Missing invoice data",
      });
    }

    const doc = await db.collection("invoices").add({
      userId: req.user.uid,
      invoiceNo,
      customerId,
      customerName,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      status: status || "Pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      id: doc.id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// 📥 GET INVOICES
router.get("/invoices", verifyToken, async (req, res) => {
  try {
    const snapshot = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
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
      customerId: req.body.customerId,
      customerName: req.body.customerName,

      items: req.body.items,

      subtotal: req.body.subtotal,
      tax: req.body.tax,
      discount: req.body.discount,
      grandTotal: req.body.grandTotal,

      status: req.body.status,
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