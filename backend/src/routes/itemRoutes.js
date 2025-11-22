const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Item = require('../models/Item');

const router = express.Router();

// Get items with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { q, district, category, city } = req.query;
    const query = {};

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

    const items = await Item.find(query).sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    return next(err);
  }
});

const findItemByParam = (param, lean = false) => {
  const query = mongoose.Types.ObjectId.isValid(param) ? { _id: param } : { slug: param };
  return lean ? Item.findOne(query).lean() : Item.findOne(query);
};

// Get single item (by slug or id)
router.get('/:slugOrId', async (req, res, next) => {
  try {
    const item = await findItemByParam(req.params.slugOrId, true);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.json(item);
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
    const item = await findItemByParam(req.params.slugOrId, false);
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

module.exports = router;
