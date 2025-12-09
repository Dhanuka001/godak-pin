const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Item = require('../models/Item');
const Report = require('../models/Report');
const BOOSTING_ENABLED = process.env.ENABLE_BOOSTING === 'true';

const router = express.Router();

const findItemByParam = (param) => {
  const query = mongoose.Types.ObjectId.isValid(param) ? { _id: param } : { slug: param };
  return Item.findOne(query);
};

// Get items with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { q, district, category, city, limit } = req.query;
    const query = { status: { $ne: 'deleted' } };

    if (q) {
      query.$text = { $search: q };
    }
    if (district) {
      query.district = district;
    }
    if (category) {
      query.category = category;
    }
    if (city) {
      query.city = city;
    }

    const now = new Date();
    const findQuery = Item.find(query).sort({ boostedUntil: -1, createdAt: -1 });
    if (limit) {
      findQuery.limit(Math.min(parseInt(limit, 10) || 0, 50));
    }
    const items = await findQuery.lean();
    const mapped = items.map((item) => ({
      ...item,
      isBoosted: item.boostedUntil ? new Date(item.boostedUntil) > now : false,
    }));
    return res.json(mapped);
  } catch (err) {
    return next(err);
  }
});

// Get single item (by slug or id)
router.get('/:slugOrId', async (req, res, next) => {
  try {
    const match = mongoose.Types.ObjectId.isValid(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId };
    const item = await Item.findOne({ ...match, status: { $ne: 'deleted' } })
      .populate('owner', 'name email mobile district city contactNote')
      .lean();
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const now = new Date();
    return res.json({ ...item, isBoosted: item.boostedUntil ? new Date(item.boostedUntil) > now : false });
  } catch (err) {
    return next(err);
  }
});

// Create item (protected)
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description, category, district, city, condition, imageUrl, images, primaryImageIndex } = req.body;

    if (!title || !description || !category || !district || !city || !condition) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedImages =
      Array.isArray(images) && images.length
        ? images.map((url, idx) => ({ url, isPrimary: primaryImageIndex === idx }))
        : [];

    const primaryImage =
      normalizedImages.find((img) => img.isPrimary)?.url ||
      normalizedImages[0]?.url ||
      imageUrl ||
      '/images/placeholder.jpg';

    const item = await Item.create({
      title,
      description,
      category,
      district,
      city,
      condition,
      status: 'available',
      imageUrl: primaryImage,
      images: normalizedImages.length ? normalizedImages : undefined,
      owner: req.user._id,
      ownerName: req.user.name,
      ownerDistrict: req.user.district,
    });

    return res.status(201).json(item);
  } catch (err) {
    return next(err);
  }
});

// Request item
router.post('/:slugOrId/request', auth, async (req, res, next) => {
  try {
    const item = await findItemByParam(req.params.slugOrId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const alreadyRequested = item.requests?.some((r) => r.user?.toString() === req.user._id.toString());
    if (alreadyRequested) {
      return res.status(400).json({ message: 'Already requested' });
    }

    item.requests.push({
      user: req.user._id,
      email: req.user.email,
      name: req.user.name,
    });
    await item.save();

    return res.json({ message: 'Request recorded' });
  } catch (err) {
    return next(err);
  }
});

// Update status (owner only)
router.put('/:slugOrId/status', auth, async (req, res, next) => {
  try {
    const item = await findItemByParam(req.params.slugOrId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.owner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    const allowed = ['available', 'reserved', 'given'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    item.status = status;
    await item.save();
    return res.json({ status: item.status });
  } catch (err) {
    return next(err);
  }
});

// Boost item (owner only)
router.post('/:slugOrId/boost', auth, async (req, res, next) => {
  try {
    if (!BOOSTING_ENABLED) {
      return res.status(403).json({ message: 'Boosting is temporarily disabled.' });
    }
    const item = await findItemByParam(req.params.slugOrId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const hours = 24;
    const now = new Date();
    const currentBoost = item.boostedUntil && new Date(item.boostedUntil) > now ? new Date(item.boostedUntil) : now;
    const boostedUntil = new Date(currentBoost.getTime() + hours * 60 * 60 * 1000);

    item.boostedUntil = boostedUntil;
    await item.save();

    // TODO: verify PayHere payment server-side using their API / IPN callback.

    return res.json({
      message: 'Item boosted for 24 hours',
      boostedUntil,
      isBoosted: true,
    });
  } catch (err) {
    return next(err);
  }
});

// Report item
router.post('/:slugOrId/report', auth, async (req, res, next) => {
  try {
    const item = await findItemByParam(req.params.slugOrId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const { reason, message } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    await Report.create({
      item: item._id,
      reporter: req.user._id,
      reporterName: req.user.name,
      reporterEmail: req.user.email,
      reason,
      message,
    });

    return res.status(201).json({ message: 'Report submitted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
