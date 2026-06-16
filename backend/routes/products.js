const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");
const verifyToken = require("../middleware/auth");

//
// CREATE PRODUCT
//
router.post("/products", verifyToken, async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        error: "Name and Price are required",
      });
    }

    const doc = await db.collection("products").add({
      userId: req.user.uid,

      name,
      description: description || "",
      price,

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
// GET PRODUCTS
//
router.get("/products", verifyToken, async (req, res) => {
  try {

    const snapshot = await db
      .collection("products")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(products);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

//
// UPDATE PRODUCT
//
router.put("/products/:id", verifyToken, async (req, res) => {
  try {

    const docRef = db.collection("products").doc(req.params.id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    await docRef.update({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
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
// DELETE PRODUCT
//
router.delete("/products/:id", verifyToken, async (req, res) => {

  try {

    const docRef = db.collection("products").doc(req.params.id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Product not found",
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