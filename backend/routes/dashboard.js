const express = require("express");
const router = express.Router();

const { db } = require("../firebase");
const verifyToken = require("../middleware/auth");

router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const [
        customersSnap,
        productsSnap,
        ordersSnap,
        invoicesSnap,
        ] = await Promise.all([
        db.collection("customers").where("userId","==",userId).get(),
        db.collection("products").where("userId","==",userId).get(),
        db.collection("orders").where("userId","==",userId).get(),
        db.collection("invoices").where("userId","==",userId).get(),
        ]);

    // ==========================
    // Revenue
    // ==========================

    let revenue = 0;

    invoicesSnap.forEach((doc) => {
      const invoice = doc.data();

      revenue += Number(
        invoice.grandTotal ??
          invoice.total ??
          invoice.amount ??
          0
      );
    });

    // ==========================
    // Counts
    // ==========================

    const customers = customersSnap.size;
    const products = productsSnap.size;
    const orders = ordersSnap.size;

    // ==========================
    // Recent Orders
    // ==========================

    const recentOrders = ordersSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;

        return tb - ta;
      })
      .slice(0, 5);

    // ==========================
    // Recent Invoices
    // ==========================

    const recentInvoices = invoicesSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;

        return tb - ta;
      })
      .slice(0, 5);

    // ==========================
    // Upcoming Renewals
    // ==========================

   const upcomingRenewals = [];

      console.log("===============");
        console.log("USER:", userId);

        console.log("Customers:", customersSnap.size);
        console.log("Products:", productsSnap.size);
        console.log("Orders:", ordersSnap.size);
        console.log("Invoices:", invoicesSnap.size);
        console.log("===============");

    res.json({
      revenue,
      customers,
      products,
      orders,
      recentOrders,
      recentInvoices,
      upcomingRenewals,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;