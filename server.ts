import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as OTPAuth from "otpauth";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route to fetch credentials and current 2FA code securely
  app.get("/api/credentials", (req, res) => {
    const userEmail = process.env.USER_EMAIL || "Chưa cấu hình Email";
    const userPass = process.env.USER_PASS || "Chưa cấu hình Mật khẩu";
    const secretKey = process.env.SECRET_KEY || "";

    const epoch = Math.floor(Date.now() / 1000);
    const secondsRemaining = 30 - (epoch % 30);
    let totpCode = "------";

    try {
      if (secretKey) {
        const cleanSecret = secretKey.replace(/\s+/g, "").toUpperCase();
        const totp = new OTPAuth.TOTP({
          secret: cleanSecret,
        });
        totpCode = totp.generate();
      } else {
        totpCode = "THIẾU KHÓA";
      }
    } catch (e) {
      totpCode = "LỖI KHÓA";
    }

    res.json({
      email: userEmail,
      pass: userPass,
      code: totpCode,
      timer: secondsRemaining,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
