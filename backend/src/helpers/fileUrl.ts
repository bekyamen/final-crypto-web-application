// helpers/fileUrl.ts
import { Request } from "express";

export const getFileUrl = (req: Request, filePath: string | null): string | null => {
  if (!filePath) return null; // handle null file path
  const host = req.headers.host ?? "api.bitorynfx.com/"; // fallback host
  const protocol = req.protocol || "http";           // fallback protocol
  return `${protocol}://${host}/${filePath}`;        // full URL
};