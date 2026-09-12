import { Router } from 'express';
import { SupportTicket } from '../models/SupportTicket.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my-tickets', async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      organizationId: req.organizationId || req.user.organizationId
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { subject, message, priority, category } = req.body;
    const orgId = req.organizationId || req.user.organizationId;

    const ticket = await SupportTicket.create({
      organizationId: orgId,
      userId: req.user._id,
      subject,
      message,
      priority: priority || 'medium',
      category: category || 'other',
      status: 'open'
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      organizationId: req.organizationId || req.user.organizationId
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    ticket.responses.push({
      senderType: 'customer',
      senderName: req.user.name,
      message,
      createdAt: new Date()
    });
    ticket.status = 'open'; // Re-open for admin review
    await ticket.save();

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
