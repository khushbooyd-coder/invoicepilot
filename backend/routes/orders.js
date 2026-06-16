const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");
const verifyToken = require("../middleware/auth");

//
// CREATE ORDER
//
router.post("/orders", verifyToken, async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      productId,
      productName,
      quantity,
      total,
      status,
    } = req.body;

    if (!customerId || !productId || !quantity) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const doc = await db.collection("orders").add({
      userId: req.user.uid,

      customerId,
      customerName,

      productId,
      productName,

      quantity,
      total,

      status: status || "Pending",

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      id: doc.id,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

//
// GET ORDERS
//
router.get("/orders", verifyToken, async (req, res) => {
  try {

    const snapshot = await db
      .collection("orders")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(orders);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

//
// UPDATE ORDER
//
router.put("/orders/:id", verifyToken, async (req, res) => {
  try {

    const docRef = db.collection("orders").doc(req.params.id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    await docRef.update({
      customerId: req.body.customerId,
      customerName: req.body.customerName,

      productId: req.body.productId,
      productName: req.body.productName,

      quantity: req.body.quantity,
      total: req.body.total,
      status: req.body.status,
    });

    res.json({
      success: true,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

//
// DELETE ORDER
//
router.delete("/orders/:id", verifyToken, async (req, res) => {

  try {

    const docRef = db.collection("orders").doc(req.params.id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    await docRef.delete();

    res.json({
      success: true,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }

});

module.exports = router;