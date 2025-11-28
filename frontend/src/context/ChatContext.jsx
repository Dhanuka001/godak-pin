import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuthContext } from './AuthContext';
import api, { apiBase } from '../utils/api';

const ChatContext = createContext(null);

const buildConversationId = (a, b) => {
  if (!a || !b) return null;
  const ids = [a.toString(), b.toString()].sort();
  return ids.join(':');
};

const ChatProvider = ({ children }) => {
  const { user, token } = useAuthContext();
  const [conversations, setConversations] = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const eventSourceRef = useRef(null);
  const typingTimeoutRef = useRef({});
  const activePartnerRef = useRef(null);
  const activeConversationIdRef = useRef(null);

  const resetState = useCallback(() => {
    setConversations([]);
    setMessages([]);
    setActivePartnerId(null);
    setTyping({});
    setIsReady(false);
    setIsLoadingConversations(false);
    setIsLoadingMessages(false);
    Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    typingTimeoutRef.current = {};
  }, []);

  const upsertConversation = useCallback((payload) => {
    if (!payload || !payload.conversationId) return;
    setConversations((prev) => {
      const existing = prev.find((conv) => conv.conversationId === payload.conversationId);
      const basePartner =
        payload.partner || existing?.partner || { _id: payload.conversationId, name: 'Chat' };
      const updated = {
        conversationId: payload.conversationId,
        partner: basePartner,
        lastMessage: payload.lastMessage || existing?.lastMessage || null,
        unreadCount:
          typeof payload.unreadCount === 'number'
            ? payload.unreadCount
            : existing?.unreadCount || 0,
        listing: payload.listing ?? existing?.listing ?? null,
        lastActivity:
          payload.lastMessage?.timestamp || existing?.lastActivity || new Date().toISOString(),
      };
      const next = existing
        ? prev.map((conv) =>
            conv.conversationId === payload.conversationId ? updated : conv
          )
        : [updated, ...prev];
      return next.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    });
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    setIsReady(false);
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Unable to load conversations', err);
    } finally {
      setIsLoadingConversations(false);
      setIsReady(true);
    }
  }, [user]);

  const markAsRead = useCallback(async (partnerId) => {
    if (!partnerId) return;
    try {
      await api.post('/chat/mark-read', { partnerId });
      setConversations((prev) =>
        prev.map((conv) =>
          conv.partner._id === partnerId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to mark messages as read', err);
    }
  }, []);

  const fetchMessages = useCallback(
    async (partnerId) => {
      if (!partnerId) {
        setMessages([]);
        return;
      }
      setIsLoadingMessages(true);
      const conversationId = buildConversationId(user?._id, partnerId);
      try {
        const { data } = await api.get('/chat/messages', { params: { partnerId } });
        setMessages(data.messages || []);
        if (data.listing) {
          upsertConversation({
            conversationId,
            listing: data.listing,
          });
        }
        await markAsRead(partnerId);
      } catch (err) {
        setMessages([]);
        // eslint-disable-next-line no-console
        console.error('Failed to load messages', err);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [markAsRead, upsertConversation, user?._id]
  );

  const selectConversation = useCallback(
    (partnerId, opts = {}) => {
      if (!partnerId) return;
      const conversationId = buildConversationId(user?._id, partnerId);
      setActivePartnerId(partnerId);
      setTyping((prev) => ({ ...prev, [conversationId]: false }));
      const shouldUpsert =
        opts.partner || opts.listing || opts.lastMessage || typeof opts.unreadCount === 'number';
      if (shouldUpsert) {
        upsertConversation({
          conversationId,
          partner: opts.partner,
          lastMessage: opts.lastMessage,
          unreadCount: opts.unreadCount,
          listing: opts.listing,
        });
      }
    },
    [upsertConversation, user]
  );

  const sendMessage = useCallback(
    async (partnerId, content, listingId) => {
      if (!partnerId || !content?.trim()) return null;
      try {
        const { data } = await api.post('/chat/messages', {
          receiverId: partnerId,
          content: content.trim(),
          listingId: listingId || null,
        });
        const payload = data.message;
        setMessages((prev) => [...prev, payload]);
        const conversationId = buildConversationId(user?._id, partnerId);
        setConversations((prev) => {
          const existing = prev.find((conv) => conv.conversationId === conversationId);
          const next = {
            conversationId,
            partner: existing?.partner || { _id: partnerId, name: 'Conversation' },
            lastMessage: payload,
            unreadCount: existing?.unreadCount || 0,
            listing: existing?.listing || null,
            lastActivity: payload.timestamp,
          };
          const merged = existing
            ? prev.map((conv) =>
                conv.conversationId === conversationId ? next : conv
              )
            : [next, ...prev];
          return merged.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        });
        return payload;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Unable to send message', err);
        return null;
      }
    },
    [user]
  );

  const notifyTyping = useCallback(async (partnerId, isTyping) => {
    if (!partnerId) return;
    try {
      await api.post('/chat/typing', { partnerId, isTyping });
    } catch (_err) {
      // ignore typing noise
    }
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.partner._id === activePartnerId) || null,
    [conversations, activePartnerId]
  );

  useEffect(() => {
    activePartnerRef.current = activePartnerId;
  }, [activePartnerId]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversation?.conversationId || null;
  }, [activeConversation]);

  const handleNewMessage = useCallback(
    (event) => {
      if (!event?.data) return;
      try {
        const payload = JSON.parse(event.data);
        upsertConversation({
          conversationId: payload.conversationId,
          partner: payload.partner,
          lastMessage: payload.message,
          unreadCount: payload.unreadCount,
          listing: payload.listing,
        });
        if (payload.conversationId === activeConversationIdRef.current) {
          setMessages((prev) => [...prev, payload.message]);
          void markAsRead(activePartnerRef.current);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Malformed chat event', err);
      }
    },
    [markAsRead, upsertConversation]
  );

  const handleConversationUpdate = useCallback(
    (event) => {
      if (!event?.data) return;
      try {
        const payload = JSON.parse(event.data);
        upsertConversation({
          conversationId: payload.conversationId,
          partner: payload.partner,
          lastMessage: payload.lastMessage,
          unreadCount: payload.unreadCount,
          listing: payload.listing,
        });
        if (payload.conversationId === activeConversationIdRef.current) {
          void markAsRead(activePartnerRef.current);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Malformed chat event', err);
      }
    },
    [markAsRead, upsertConversation]
  );

  const handleTypingEvent = useCallback((event) => {
    if (!event?.data) return;
    try {
      const payload = JSON.parse(event.data);
      const key = payload.conversationId;
      setTyping((prev) => ({ ...prev, [key]: Boolean(payload.isTyping) }));
      if (payload.isTyping) {
        if (typingTimeoutRef.current[key]) {
          clearTimeout(typingTimeoutRef.current[key]);
        }
        typingTimeoutRef.current[key] = setTimeout(() => {
          setTyping((prevState) => {
            const next = { ...prevState };
            delete next[key];
            return next;
          });
        }, 3200);
      } else if (typingTimeoutRef.current[key]) {
        clearTimeout(typingTimeoutRef.current[key]);
        delete typingTimeoutRef.current[key];
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Bad typing payload', err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      resetState();
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return undefined;
    }
    fetchConversations();
    return undefined;
  }, [fetchConversations, resetState, user]);

  useEffect(() => {
    if (!activePartnerId) {
      setMessages([]);
      return undefined;
    }
    fetchMessages(activePartnerId);
    return undefined;
  }, [activePartnerId, fetchMessages]);

  useEffect(() => {
    if (!user || !token) return undefined;
    const stream = new EventSource(`${apiBase}/chat/events?token=${token}`, {
      withCredentials: true,
    });
    eventSourceRef.current = stream;
    stream.addEventListener('chat:new_message', handleNewMessage);
    stream.addEventListener('chat:conversation_update', handleConversationUpdate);
    stream.addEventListener('chat:typing', handleTypingEvent);
    stream.onerror = () => {
      // eslint-disable-next-line no-console
      console.warn('Chat stream disconnected, retrying...');
    };
    return () => {
      stream.close();
      eventSourceRef.current = null;
    };
  }, [user, token, handleNewMessage, handleConversationUpdate, handleTypingEvent]);

  useEffect(() => {
    if (!activePartnerId && conversations.length) {
      setActivePartnerId(conversations[0].partner._id);
    }
  }, [activePartnerId, conversations]);

  useEffect(() => () => {
    eventSourceRef.current?.close();
    Object.values(typingTimeoutRef.current).forEach(clearTimeout);
  }, []);

  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activePartnerId,
        activeConversation,
        messages,
        typing,
        isReady,
        isLoadingConversations,
        isLoadingMessages,
        unreadCount,
        selectConversation,
        sendMessage,
        notifyTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);

export { ChatProvider };
