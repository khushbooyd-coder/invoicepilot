const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");
const verifyToken = require("../middleware/auth");

//
// CREATE CUSTOMER
//
router.post("/customers", verifyToken, async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      country,
      status,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and Email are required",
      });
    }

    const doc = await db.collection("customers").add({
      userId: req.user.uid,

      name,
      company: company || "",
      email,
      phone: phone || "",
      country: country || "",

      status: status || "Active",

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
// GET CUSTOMERS
//
router.get("/customers", verifyToken, async (req, res) => {
  try {

    const snapshot = await db
      .collection("customers")
      .where("userId", "==", req.user.uid)
      .get();

    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(customers);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

//
// UPDATE CUSTOMER
//
router.put("/customers/:id", verifyToken, async (req, res) => {
  try {

    const docRef = db.collection("customers").doc(req.params.id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    await docRef.update({
      name: req.body.name,
      company: req.body.company,
      email: req.body.email,
      phone: req.body.phone,
      country: req.body.country,
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
// DELETE CUSTOMER
//
router.delete("/customers/:id", verifyToken, async (req, res) => {

  try {

    const docRef = db.collection("customers").doc(req.params.id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Customer not found",
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