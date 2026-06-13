import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());

app.use(
  express.json({
    verify: (req, res, buffer) => {
      if (req.originalUrl === "/api/payments/paymongo/webhook") {
        req.rawBody = buffer.toString("utf8");
      }
    },
  })
);

app.use("/api/ai", aiRoutes);

app.use(clerkMiddleware());

/* Routes */ 
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/announcements", announcementRoutes);

app.get("/", (req, res) => {
  res.send("PUPay backend is running");
});

export default app;