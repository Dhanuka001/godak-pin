import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';

const formatTime = (ts) => {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const colorPalette = [
  'bg-amber-200 text-amber-900',
  'bg-blue-200 text-blue-900',
  'bg-emerald-200 text-emerald-900',
  'bg-rose-200 text-rose-900',
  'bg-indigo-200 text-indigo-900',
  'bg-teal-200 text-teal-900',
];

const ChatWidget = () => {
  const { user } = useAuthContext();
  const { isOpen, conversations, activeId, unreadCount, setActiveConversation, sendMessage, closeChat } = useChatContext();
  const [draft, setDraft] = useState('');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [showList, setShowList] = useState(true);
  const messagesEndRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((convo) => convo.id === activeId) || conversations[0],
    [activeId, conversations]
  );

  useEffect(() => {
    if (activeConversation) setActiveConversation(activeConversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length, isOpen]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isOpen && activeConversation) {
      setShowList(false);
    } else if (isOpen) {
      setShowList(true);
    }
  }, [isOpen, activeConversation]);

  if (!user) return null;

  const handleSend = () => {
    if (!activeConversation || !draft.trim()) return;
    sendMessage(activeConversation.id, draft.trim());
    setDraft('');
  };

  const layoutClass =
    isMobile && isOpen ? 'fixed inset-0 z-50 bg-white' : 'fixed right-4 top-[76px] z-40 w-[400px]';

  const colorFor = (id) => {
    const hash = (id || 'x').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return colorPalette[hash % colorPalette.length];
  };

  const senderStyles = (from) =>
    from === 'me'
      ? { bubble: 'bg-primary text-white border border-primary/80 rounded-2xl rounded-br-sm', badge: 'bg-primary/90', name: 'You' }
      : { bubble: 'bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl rounded-bl-sm', badge: colorFor(activeConversation?.id), name: activeConversation?.name || 'Donor' };

  const lastMessage = (convo) => {
    const msg = convo.messages[convo.messages.length - 1];
    if (!msg) return 'Start the conversation';
    const sender = msg.from === 'me' ? 'You: ' : '';
    return `${sender}${msg.text}`.slice(0, 80);
  };

  const handleSelectConversation = (id) => {
    setActiveConversation(id);
    setShowList(false);
  };

  return (
    <div className={layoutClass}>
      {isOpen && (
        <div
          className={`mt-3 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden ${
            isMobile ? 'h-[calc(100vh-96px)] mt-4' : ''
          }`}
        >
          {showList ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-800">Messages</div>
                <button
                  type="button"
                  onClick={closeChat}
                  className="h-9 w-9 rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
              <div className="p-3 space-y-2 overflow-y-auto">
                {conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectConversation(convo.id)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2 transition text-left border border-slate-200 hover:border-primary/50 ${
                      convo.unread ? 'ring-2 ring-primary/30' : ''
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden ${colorFor(convo.id)}`}
                    >
                      {convo.avatar ? (
                        <img src={convo.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        convo.name?.[0] || 'D'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${convo.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'}`}>
                          {convo.name}
                        </span>
                        {convo.unread > 0 && (
                          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                            {convo.unread}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs truncate ${convo.unread ? 'text-slate-700 font-semibold' : 'text-slate-500'}`}>
                        {lastMessage(convo)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowList(true)}
                    className="h-9 w-9 rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                    aria-label="Back to conversations"
                  >
                    ←
                  </button>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">Chat</div>
                    <div className="text-sm font-semibold text-slate-800">{activeConversation?.name}</div>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full">
                    {unreadCount} new
                  </div>
                )}
              </div>
              <div className={`overflow-y-auto px-4 py-3 space-y-3 ${isMobile ? 'h-[calc(100vh-240px)]' : 'h-[420px]'}`}>
                {activeConversation?.messages.map((msg) => {
                  const styles = senderStyles(msg.from);
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {msg.from !== 'me' && (
                        <span
                          className={`h-7 w-7 rounded-full inline-flex items-center justify-center text-[11px] text-white ${styles.badge}`}
                        >
                          {styles.name[0]}
                        </span>
                      )}
                      <div className="space-y-1 max-w-[80%]">
                        <div className={`px-3 py-2 text-sm ${styles.bubble}`}>{msg.text}</div>
                        <div className="text-[11px] text-slate-500">{formatTime(msg.ts)}</div>
                      </div>
                      {msg.from === 'me' && (
                        <span
                          className={`h-7 w-7 rounded-full inline-flex items-center justify-center text-[11px] text-white ${styles.badge}`}
                        >
                          {styles.name[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="rounded-xl bg-primary text-white px-3 py-2 text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
                    disabled={!draft.trim()}
                  >
                    Send
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Unread conversations stay highlighted until opened.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
