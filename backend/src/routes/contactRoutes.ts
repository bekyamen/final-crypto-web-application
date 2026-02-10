import { Router } from 'express';
import { adminService } from '../services/adminService';

const router = Router();

/**
 * @route GET /api/contacts
 * @desc Public route: get current WhatsApp & Telegram contacts
 */
router.get('/', async (_req, res) => {
  try {
    const contacts = await adminService.getContacts();
    res.status(200).json({
      success: true,
      message: 'Contacts retrieved successfully',
      data: contacts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch contacts', error: err instanceof Error ? err.message : err });
  }
});

export default router;
