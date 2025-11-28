import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import AdPreviewCard from './AdPreviewCard';

const buildSound = (freq, duration, audioCtxRef) => {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = audioCtxRef.current || new AudioCtx();
  audioCtxRef.current = ctx;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.frequency.value = freq;
  gain.gain.value = 0.15;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

const ChatWindow = ({
  partner,
  messages = [],
  listing = null,
  isLoading = false,
  onSend,
  typing = false,
  notifyTyping,
}) => {
  const { user } = useAuthContext();
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef(null);
  const audioCtxRef = useRef(null);
  const lastMessageRef = useRef(null);
  const typingTimerRef = useRef(null);

  const playSendSound = useCallback(() => buildSound(520, 0.09, audioCtxRef), []);
  const playReceiveSound = useCallback(() => buildSound(320, 0.12, audioCtxRef), []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom, isLoading]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.message_id === lastMessageRef.current) return;
    lastMessageRef.current = last.message_id;
    if (last.sender_id !== user?._id) {
      playReceiveSound();
    }
  }, [messages, playReceiveSound, user?._id]);

  useEffect(() => () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
  }, []);

  const resetTypingTimeout = useCallback(
    (partnerId) => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (!partnerId) return;
      typingTimerRef.current = setTimeout(() => {
        notifyTyping(partnerId, false);
      }, 1500);
    },
    [notifyTyping]
  );

  const handleDraftChange = (value) => {
    setDraft(value);
    if (partner?._id) {
      notifyTyping(partner._id, true);
      resetTypingTimeout(partner._id);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!partner || !draft.trim()) return;
    notifyTyping(partner._id, false);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    const trimmed = draft.trim();
    setDraft('');
    playSendSound();
    await onSend(partner._id, trimmed, listing?.id);
  };

  const messageRows = useMemo(() => messages || [], [messages]);

  if (!partner) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        <p className="text-lg font-semibold text-slate-900">Select a conversation</p>
        <p className="mt-2 text-sm">Pick a conversation from the left to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-400">Chat with</p>
          <p className="text-xl font-semibold text-slate-900">{partner.name}</p>
        </div>
        <div className="text-xs text-slate-500">{partner.email}</div>
      </div>
      {listing && <AdPreviewCard listing={listing} />}
      <div className="relative flex-1 overflow-hidden px-6 py-4">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/70 to-transparent pointer-events-none" />
        <div className="relative h-full overflow-y-auto pr-1 pb-4">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <span className="h-2 w-10 animate-pulse rounded-full bg-slate-200" />
              <span className="h-2 w-8 animate-pulse rounded-full bg-slate-200" />
              <span className="h-2 w-6 animate-pulse rounded-full bg-slate-200" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messageRows.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
                  No messages yet. Say hello!
                </div>
              ) : (
                messageRows.map((message) => {
                  const isMe = message.sender_id === user?._id;
                  const bubbleClasses = isMe
                    ? 'bg-primary text-white border border-primary/80 rounded-2xl rounded-br-none self-end'
                    : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl rounded-bl-none self-start';
                  return (
                    <div key={message.message_id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[78%] px-4 py-2 text-sm leading-relaxed transition-shadow duration-200 animate-chat-pop ${bubbleClasses}`}
                      >
                        {message.content}
                      </div>
                      <span className="mt-1 text-[10px] text-slate-400">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-slate-100 px-6 py-4">
        {typing && (
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="typing-dots inline-flex items-center gap-1">
              <span />
              <span />
              <span />
            </span>
            <span>{partner?.name || 'Someone'} is typing…</span>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={draft}
            onChange={(event) => handleDraftChange(event.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
