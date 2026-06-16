const express = require("express");
const cors = require("cors");
require("dotenv").config();

const invoiceRoutes = require("./routes/invoices");
const customerRoutes = require("./routes/customers");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();

// 1. DYNAMIC CORS (Fixed)
// Vercel creates unique URLs for every push. This logic allows any 
// Vercel deployment from your account to access the backend.
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://invoicepilot-xi.vercel.app"
    ];
    
    // Check if origin is in the list OR is a Vercel preview URL
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 2. ROUTES
app.use(invoiceRoutes);
app.use(customerRoutes);
app.use(productRoutes);
app.use(orderRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// 3. DYNAMIC PORT (Fixed)
// Render.com uses a dynamic port. This line ensures the app 
// listens on the port assigned by the environment.
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});