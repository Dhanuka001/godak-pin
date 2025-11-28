const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Item = require('../models/Item');
const { registerClient, sendEvent } = require('../utils/chatStream');

const router = express.Router();

const buildConversationId = (a, b) => {
  if (!a || !b) return null;
  const ids = [a.toString(), b.toString()].sort();
  return ids.join(':');
};

const formatMessage = (doc) => ({
  message_id: doc.message_id,
  sender_id: doc.sender_id.toString(),
  receiver_id: doc.receiver_id.toString(),
  listing_id: doc.listing_id ? doc.listing_id.toString() : null,
  content: doc.content,
  timestamp: doc.timestamp?.toISOString() || new Date().toISOString(),
  read_status: Boolean(doc.read_status),
});

const sanitizePartner = (user) => ({
  _id: user?._id?.toString() || '',
  name: user?.name || '',
  email: user?.email || '',
});

const buildListingSummary = (listing) => {
  if (!listing) return null;
  return {
    id: listing._id.toString(),
    title: listing.title,
    imageUrl: listing.imageUrl,
    slug: listing.slug,
  };
};

const sendConversationUpdate = async (targetId, partnerId, conversationId, lastMessage, listing) => {
  const partner = await User.findById(partnerId).lean();
  if (!partner) return;
  const unreadCount = await Chat.countDocuments({
    conversation_key: conversationId,
    receiver_id: targetId,
    read_status: false,
  });
  sendEvent(targetId.toString(), 'chat:conversation_update', {
    conversationId,
    lastMessage,
    unreadCount,
    partner: sanitizePartner(partner),
    listing: buildListingSummary(listing),
  });
};

router.get('/events', auth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  registerClient(req.user._id.toString(), res);
});

router.get('/conversations', auth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pipeline = [
      {
        $match: {
          $or: [{ sender_id: userId }, { receiver_id: userId }],
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$conversation_key',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver_id', userId] },
                    { $eq: ['$read_status', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const rows = await Chat.aggregate(pipeline);
    if (!rows.length) {
      return res.json({ conversations: [], unreadCount: 0 });
    }

    const partnerIds = rows.map((row) => {
      const { sender_id, receiver_id } = row.lastMessage;
      const partnerId =
        sender_id.toString() === userId.toString() ? receiver_id : sender_id;
      return partnerId.toString();
    });
    const uniquePartners = [...new Set(partnerIds)];
    const partners = await User.find({ _id: { $in: uniquePartners } }).lean();
    const partnerLookup = partners.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const listingByConversation = await Promise.all(
      rows.map(async (row) => {
        const hit = await Chat.findOne({
          conversation_key: row._id,
          listing_id: { $ne: null },
        })
          .sort({ timestamp: -1 })
          .select('listing_id')
          .lean();
        return {
          key: row._id,
          listingId: hit?.listing_id?.toString() || null,
        };
      })
    );
    const listingIds = [
      ...new Set(listingByConversation.map((entry) => entry.listingId).filter(Boolean)),
    ];
    const listings =
      listingIds.length > 0
        ? await Item.find({ _id: { $in: listingIds } })
            .select('title imageUrl slug')
            .lean()
        : [];
    const listingLookup = listings.reduce((acc, item) => {
      acc[item._id.toString()] = item;
      return acc;
    }, {});
    const listingMap = listingByConversation.reduce((acc, item) => {
      if (item.listingId) {
        acc[item.key] = item.listingId;
      }
      return acc;
    }, {});

    const conversations = rows
      .map((row) => {
        const { sender_id, receiver_id } = row.lastMessage;
        const partnerId =
          sender_id.toString() === userId.toString() ? receiver_id.toString() : sender_id.toString();
        const partner = partnerLookup[partnerId];
        if (!partner) return null;
        const listingId = listingMap[row._id];
        return {
          conversationId: row._id,
          partner: sanitizePartner(partner),
          lastMessage: formatMessage(row.lastMessage),
          unreadCount: row.unreadCount,
          listing: buildListingSummary(listingLookup[listingId] || null),
          lastActivity: row.lastMessage.timestamp,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    const unreadCount = conversations.reduce((sum, conv) => sum + (conv?.unreadCount || 0), 0);
    return res.json({ conversations, unreadCount });
  } catch (err) {
    return next(err);
  }
});

router.get('/messages', auth, async (req, res, next) => {
  try {
    const { partnerId } = req.query;
    if (!partnerId || !mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'partnerId is required' });
    }
    const conversationId = buildConversationId(req.user._id, partnerId);
    const messages = await Chat.find({ conversation_key: conversationId }).sort({ timestamp: 1 }).lean();
    const listingHit = await Chat.findOne({
      conversation_key: conversationId,
      listing_id: { $ne: null },
    })
      .sort({ timestamp: -1 })
      .select('listing_id')
      .lean();
    const listingDoc = listingHit
      ? await Item.findById(listingHit.listing_id).select('title imageUrl slug').lean()
      : null;
    return res.json({
      conversationId,
      messages: messages.map(formatMessage),
      listing: buildListingSummary(listingDoc),
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/messages', auth, async (req, res, next) => {
  try {
    const { receiverId, content, listingId } = req.body;
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiverId' });
    }
    const receiver = await User.findById(receiverId).lean();
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    const conversationId = buildConversationId(req.user._id, receiverId);
    const message = await Chat.create({
      sender_id: req.user._id,
      receiver_id: receiverId,
      content: content.trim(),
      listing_id: listingId && mongoose.Types.ObjectId.isValid(listingId) ? listingId : null,
      read_status: false,
      conversation_key: conversationId,
    });
    const formatted = formatMessage(message);
    const listingDoc =
      listingId && mongoose.Types.ObjectId.isValid(listingId)
        ? await Item.findById(listingId).select('title imageUrl slug').lean()
        : null;

    const unreadReceiver = await Chat.countDocuments({
      conversation_key: conversationId,
      receiver_id: receiverId,
      read_status: false,
    });

    sendEvent(receiverId.toString(), 'chat:new_message', {
      conversationId,
      message: formatted,
      partner: sanitizePartner(req.user),
      listing: buildListingSummary(listingDoc),
      unreadCount: unreadReceiver,
    });

    await Promise.all([
      sendConversationUpdate(receiverId, req.user._id, conversationId, formatted, listingDoc),
      sendConversationUpdate(req.user._id, receiverId, conversationId, formatted, listingDoc),
    ]);

    return res.status(201).json({ message: formatted });
  } catch (err) {
    return next(err);
  }
});

router.post('/mark-read', auth, async (req, res, next) => {
  try {
    const { partnerId } = req.body;
    if (!partnerId || !mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'partnerId is required' });
    }
    const conversationId = buildConversationId(req.user._id, partnerId);
    const result = await Chat.updateMany(
      {
        conversation_key: conversationId,
        receiver_id: req.user._id,
        read_status: false,
      },
      { read_status: true }
    );
    return res.json({ updated: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    return next(err);
  }
});

router.get('/unread-count', auth, async (req, res, next) => {
  try {
    const unread = await Chat.countDocuments({ receiver_id: req.user._id, read_status: false });
    return res.json({ unreadCount: unread });
  } catch (err) {
    return next(err);
  }
});

router.post('/typing', auth, async (req, res, next) => {
  try {
    const { partnerId, isTyping } = req.body;
    if (!partnerId || !mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'partnerId is required' });
    }
    const conversationId = buildConversationId(req.user._id, partnerId);
    sendEvent(partnerId.toString(), 'chat:typing', {
      conversationId,
      from: sanitizePartner(req.user),
      isTyping: Boolean(isTyping),
    });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
