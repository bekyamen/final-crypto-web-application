// helpers/qrUrl.ts
import { Request } from "express";

export const getQrUrl = (req: Request, qrPath: string | null): string => {
  if (!qrPath) return ""; // handle null QR path
  const host = req.headers.host ?? "api.bitorynfx.com/"; // fallback if host is undefined
  const protocol = req.protocol || "http";           // fallback protocol
  return `${protocol}://${host}/${qrPath}`;          // full URL
};