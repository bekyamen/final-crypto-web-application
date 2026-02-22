import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const qrPath = path.join(process.cwd(), "uploads/qr");
const proofsPath = path.join(process.cwd(), "uploads/proofs");

if (!fs.existsSync(qrPath)) fs.mkdirSync(qrPath, { recursive: true });
if (!fs.existsSync(proofsPath)) fs.mkdirSync(proofsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "qrImage") cb(null, qrPath);
    else if (file.fieldname === "proofImage") cb(null, proofsPath);
    else cb(new Error("Invalid file field"), "");
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${timestamp}-${name}${ext}`);
  },
});

// Only allow image files
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});