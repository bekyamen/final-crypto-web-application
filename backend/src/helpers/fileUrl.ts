import { Request } from "express";

export const getFileUrl = (req: Request, filePath: string | null): string | null => {
  if (!filePath) return null;

  // Use X-Forwarded-Proto if behind proxy (HTTPS)
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";

  // Use host header, fallback to default
  const host = req.headers.host ?? "api.bitorynfx.com";

  // Remove leading slash if present
  const cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;

  return `${protocol}://${host}/${cleanPath}`;
};