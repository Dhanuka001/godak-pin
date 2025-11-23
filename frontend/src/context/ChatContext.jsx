import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from './AuthContext';

const ChatContext = createContext(null);

const baseState = { conversations: [], activeId: null, isOpen: false };
const threadKey = (conversationId) => `gp_chat_thread_${conversationId}`;
const metaKey = (conversationId) => `gp_chat_meta_${conversationId}`;

const readThread = (conversationId) => {
  try {
    const raw = localStorage.getItem(threadKey(conversationId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_e) {
    return [];
  }
};

const writeThread = (conversationId, messages) => {
  localStorage.setItem(threadKey(conversationId), JSON.stringify(messages));
};

const writeMeta = (conversationId, meta) => {
  localStorage.setItem(metaKey(conversationId), JSON.stringify(meta));
};

const readMeta = (conversationId) => {
  try {
    const raw = localStorage.getItem(metaKey(conversationId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuthContext();
  const hydrated = useRef(false);
  const storageKey = useMemo(() => (user ? `gp_chat_state_${user._id}` : 'gp_chat_state_guest'), [user?._id]);
  const [state, setState] = useState(baseState);

  useEffect(() => {
    if (!storageKey) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch {
        setState(baseState);
      }
    } else {
      setState(baseState);
    }
    hydrated.current = true;
  }, [storageKey]);

  // Bootstrap conversations from shared threads when no saved state exists (e.g., other account on same device)
  useEffect(() => {
    if (!hydrated.current) return;
    if (state.conversations.length) return;
    const discovered = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('gp_chat_thread_')) {
        const conversationId = key.replace('gp_chat_thread_', '');
        const thread = readThread(conversationId);
        const meta = readMeta(conversationId);
        const messages = thread.map((m) => ({
          id: m.id,
          text: m.text,
          ts: m.ts,
          from: m.fromId && user && m.fromId === user._id ? 'me' : 'donor',
        }));
        const otherMessage = thread.find((m) => !user || m.fromId !== user._id);
        const derivedName = otherMessage?.fromName || meta?.name || 'Conversation';
        discovered.push({
          id: conversationId,
          name: derivedName,
          avatar: meta?.avatar || null,
          unread: 0,
          messages,
        });
      }
    }
    if (discovered.length) {
      setState((prev) => ({ ...prev, conversations: discovered, activeId: discovered[0].id || null }));
    }
  }, [state.conversations.length, user]);

  const unreadCount = useMemo(
    () => state.conversations.reduce((sum, convo) => sum + (convo.unread || 0), 0),
    [state.conversations]
  );

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    if (!user) {
      setState(baseState);
    }
  }, [user]);

  const syncFromThread = (conversationId, opts = { markUnread: true }) => {
    setState((prev) => {
      const thread = readThread(conversationId);
      const existing = prev.conversations.find((c) => c.id === conversationId);
      if (!existing) {
        const meta = readMeta(conversationId);
        const messages = thread.map((m) => ({
          id: m.id,
          text: m.text,
          ts: m.ts,
          from: m.fromId && user && m.fromId === user._id ? 'me' : 'donor',
        }));
        return {
          ...prev,
          conversations: [
            ...prev.conversations,
            {
              id: conversationId,
              name: meta?.name || 'Conversation',
              avatar: meta?.avatar || null,
              unread: opts.markUnread ? messages.filter((m) => m.from === 'donor').length : 0,
              messages,
            },
          ],
        };
      }
      const seenIds = new Set(existing.messages.map((m) => m.id));
      const mapped = thread
        .filter((m) => !seenIds.has(m.id))
        .map((m) => ({
          id: m.id,
          text: m.text,
          ts: m.ts,
          from: m.fromId && user && m.fromId === user._id ? 'me' : 'donor',
        }));
      if (!mapped.length) return prev;
      const unreadIncrement =
        opts.markUnread && !(prev.isOpen && prev.activeId === conversationId)
          ? (existing.unread || 0) + mapped.filter((m) => m.from === 'donor').length
          : 0;
      const conversations = prev.conversations.map((convo) =>
        convo.id === conversationId
          ? {
              ...convo,
              unread: opts.markUnread ? unreadIncrement : 0,
              messages: [...convo.messages, ...mapped],
            }
          : convo
      );
      return { ...prev, conversations };
    });
  };

  const setActiveConversation = (id) => {
    setState((prev) => ({
      ...prev,
      activeId: id,
      conversations: prev.conversations.map((convo) => (convo.id === id ? { ...convo, unread: 0 } : convo)),
    }));
    syncFromThread(id, { markUnread: false });
  };

  const toggleChat = () => setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  const closeChat = () => setState((prev) => ({ ...prev, isOpen: false }));

  const openChatWith = ({ id, name, avatar }) => {
    if (!id) return;
    if (name || avatar) {
      writeMeta(id, { name: name || 'Conversation', avatar: avatar || null });
    }
    setState((prev) => {
      const exists = prev.conversations.find((c) => c.id === id);
      const conversations = exists
        ? prev.conversations
        : [...prev.conversations, { id, name: name || 'Conversation', avatar: avatar || null, unread: 0, messages: [] }];
      return {
        ...prev,
        isOpen: true,
        activeId: id,
        conversations: conversations.map((convo) => (convo.id === id ? { ...convo, unread: 0 } : convo)),
      };
    });
    syncFromThread(id, { markUnread: false });
  };

  const addIncomingMessage = (conversationId, text) => {
    const ts = Date.now();
    const entry = { id: `${conversationId}-in-${ts}`, fromId: conversationId, fromName: 'Donor', text, ts };
    const thread = readThread(conversationId);
    writeThread(conversationId, [...thread, entry]);
    syncFromThread(conversationId);
  };

  const sendMessage = (conversationId, text) => {
    if (!text.trim()) return;
    const ts = Date.now();
    const entry = { id: `${conversationId}-me-${ts}`, fromId: user?._id || 'me', fromName: user?.name || 'Me', text, ts };
    const thread = readThread(conversationId);
    writeThread(conversationId, [...thread, entry]);
    setState((prev) => {
      const conversations = prev.conversations.map((convo) =>
        convo.id === conversationId
          ? { ...convo, messages: [...convo.messages, { id: entry.id, text: entry.text, ts: entry.ts, from: 'me' }] }
          : convo
      );
      return { ...prev, conversations };
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (!e.key || !e.key.startsWith('gp_chat_thread_')) return;
      const conversationId = e.key.replace('gp_chat_thread_', '');
      syncFromThread(conversationId);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        unreadCount,
        setActiveConversation,
        toggleChat,
        closeChat,
        openChatWith,
        addIncomingMessage,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
