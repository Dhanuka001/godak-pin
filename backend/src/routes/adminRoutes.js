const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Item = require('../models/Item');
const Report = require('../models/Report');

const router = express.Router();

router.use(auth, admin);

router.get('/stats', async (_req, res, next) => {
  try {
    const [users, items, reports, openReports, byStatus] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'open' }),
      Item.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    const statusMap = byStatus.reduce((acc, cur) => ({ ...acc, [cur._id || 'unknown']: cur.count }), {});
    return res.json({
      totalUsers: users,
      totalItems: items,
      totalReports: reports,
      openReports,
      itemsByStatus: statusMap,
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/reports', async (req, res, next) => {
  try {
    const status = req.query.status;
    const query = status ? { status } : {};
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('item', 'title slug status')
      .populate('reporter', 'name email');
    return res.json(reports);
  } catch (err) {
    return next(err);
  }
});

router.put('/reports/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['open', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    report.status = status;
    await report.save();
    return res.json({ status: report.status });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
