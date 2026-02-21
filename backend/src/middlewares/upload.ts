import multer from "multer";
import path from "path";
import fs from "fs";

// Use project root
const uploadPath = path.join(process.cwd(), "uploads/qr");

if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});