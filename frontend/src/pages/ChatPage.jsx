import ConversationsList from '../components/chat/ConversationsList';
import ChatWindow from '../components/chat/ChatWindow';
import { useChatContext } from '../context/ChatContext';

const ChatPage = () => {
  const {
    conversations,
    activePartnerId,
    activeConversation,
    messages,
    selectConversation,
    sendMessage,
    notifyTyping,
    typing,
    isLoadingConversations,
    isLoadingMessages,
  } = useChatContext();

  const typingIndicator =
    activeConversation && activeConversation.conversationId
      ? typing[activeConversation.conversationId]
      : false;
  const listing = activeConversation?.listing || null;

  return (
    <div className="min-h-[calc(100vh-96px)] bg-slate-50 py-8">
      <div className="container-fixed flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary">Chat</p>
          <h1 className="text-3xl font-semibold text-slate-900">Real-time conversations</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Stay in control with a modern chat experience that mirrors Messenger, WhatsApp, or Fiverr. All your
            conversations are synced, highlighted when there&apos;s unread activity, and updated instantly.
          </p>
        </header>
        <div className="grid h-[calc(100vh-220px)] gap-6 lg:grid-cols-[320px_1fr]">
          <ConversationsList
            conversations={conversations}
            activePartnerId={activePartnerId}
            onSelectConversation={selectConversation}
            isLoading={isLoadingConversations}
          />
          <ChatWindow
            partner={activeConversation?.partner}
            messages={messages}
            listing={listing}
            isLoading={isLoadingMessages}
            onSend={sendMessage}
            typing={typingIndicator}
            notifyTyping={notifyTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
