import { Contact } from '../models/Contact.js';
import { Lead } from '../models/Lead.js';
import { Activity } from '../models/Activity.js';
import { AppError } from '../utils/errors.js';

export const contactController = {
  async list(req, res) {
    const { search, source, tags, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.organizationId };

    if (source) query.source = source;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { company: regex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Contact.countDocuments(query),
    ]);

    // Get lead count for each contact
    const contactIds = contacts.map((c) => c._id);
    const leadCounts = await Lead.aggregate([
      { $match: { organizationId: req.organizationId, contactId: { $in: contactIds } } },
      { $group: { _id: '$contactId', count: { $sum: 1 }, lastStatus: { $last: '$status' } } },
    ]);
    const leadCountMap = {};
    leadCounts.forEach((l) => { leadCountMap[l._id.toString()] = l; });

    const enriched = contacts.map((c) => ({
      ...c,
      leadCount: leadCountMap[c._id.toString()]?.count || 0,
      lastLeadStatus: leadCountMap[c._id.toString()]?.lastStatus || null,
    }));

    res.json({
      success: true,
      data: { contacts: enriched, total, page: parseInt(page), limit: parseInt(limit) },
    });
  },

  async get(req, res) {
    const contact = await Contact.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });
    if (!contact) throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');

    const [leads, activities] = await Promise.all([
      Lead.find({ organizationId: req.organizationId, contactId: contact._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Activity.find({ organizationId: req.organizationId, contactId: contact._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    res.json({ success: true, data: { contact, leads, activities } });
  },

  async create(req, res) {
    const contact = await Contact.create({
      ...req.body,
      organizationId: req.organizationId,
    });

    await Activity.create({
      organizationId: req.organizationId,
      contactId: contact._id,
      userId: req.user._id,
      type: 'contact_created',
      title: `Contact created: ${contact.fullName}`,
    });

    res.status(201).json({ success: true, data: { contact } });
  },

  async update(req, res) {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');

    res.json({ success: true, data: { contact } });
  },

  async delete(req, res) {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId,
    });
    if (!contact) throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    res.json({ success: true, message: 'Contact deleted' });
  },
};

export default contactController;
