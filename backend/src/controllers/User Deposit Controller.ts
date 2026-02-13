import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Get deposit wallet info for user
 * GET /api/user/deposit/wallet/:coin
 */
export const getDepositWallet = async (
  req: Request,
  res: Response
) => {
  try {
    const { coin } = req.params

    if (!coin) {
      return res.status(400).json({
        success: false,
        message: "Coin is required"
      })
    }

    const wallet = await prisma.depositWallet.findUnique({
      where: { coin }
    })

    if (!wallet || !wallet.isActive) {
      return res.status(404).json({
        success: false,
        message: `${coin} deposit wallet not found`
      })
    }

    // Build full URL for QR image
    const qrImageUrl = `${req.protocol}://${req.get("host")}/${wallet.qrImage}`

    return res.status(200).json({
      success: true,
      data: {
        coin: wallet.coin,
        address: wallet.address,
        qrImage: qrImageUrl
      }
    })
  } catch (error) {
    console.error("Get Deposit Wallet Error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}
