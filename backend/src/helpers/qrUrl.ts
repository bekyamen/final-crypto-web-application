import { Request } from "express";
import { getFileUrl } from "./fileUrl";

export const getQrUrl = (req: Request, qrPath: string | null): string => {
  return getFileUrl(req, qrPath) || "";
};