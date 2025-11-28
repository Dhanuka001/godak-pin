const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / 36e5;
  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diffHours < 168) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }
  return date.toLocaleDateString();
};

const ConversationsList = ({
  conversations = [],
  activePartnerId,
  onSelectConversation,
  isLoading = false,
}) => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
        <p className="mt-1 text-xs text-slate-500">Connect with donors, request help, and stay in the loop.</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 animate-pulse">
                <span className="h-12 w-12 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <span className="block h-3 w-1/2 rounded-full bg-slate-200" />
                  <span className="block h-3 w-3/4 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length ? (
          <div className="space-y-2 px-2 py-3">
            {conversations.map((conversation) => {
              const isActive = conversation.partner._id === activePartnerId;
              const hasUnread = conversation.unreadCount > 0;
              const highlightClasses = isActive
                ? 'border-primary/40 bg-primary/5 shadow'
                : 'border-transparent bg-white hover:border-slate-200';
              return (
                <button
                  key={conversation.conversationId}
                  type="button"
                  onClick={() => onSelectConversation(conversation.partner._id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${highlightClasses}`}
                >
                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold uppercase text-slate-700">
                      {conversation.partner.name?.[0] || 'C'}
                    </span>
                    {hasUnread && (
                      <span className="absolute -top-0 -right-0 inline-flex h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm ${hasUnread || isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}
                      >
                        {conversation.partner.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatTimestamp(conversation.lastMessage?.timestamp)}
                      </span>
                    </div>
                    <p
                      className={`mt-1 truncate text-xs  ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'}`}
                    >
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-5 py-10 text-sm text-slate-500">
            <span className="text-lg font-semibold">No conversations yet</span>
            <p className="text-xs text-slate-400 text-center">
              Start a chat from an item page or respond to someone who reaches out to you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
