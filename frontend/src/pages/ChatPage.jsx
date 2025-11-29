import { useEffect, useMemo, useState } from 'react';
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

  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileView, setMobileView] = useState('list');

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia('(min-width: 1024px)');
    const update = (event) => setIsDesktop(event.matches);
    update(mql);
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
    } else {
      mql.addListener(update);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', update);
      } else {
        mql.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setMobileView('list');
    }
  }, [isDesktop]);

  const typingIndicator =
    activeConversation && activeConversation.conversationId
      ? typing[activeConversation.conversationId]
      : false;
  const listing = activeConversation?.listing || null;

  const handleSelectConversation = (conversationId) => {
    selectConversation(conversationId);
    if (!isDesktop) {
      setMobileView('chat');
    }
  };

  const handleBackToList = () => setMobileView('list');

  const shouldShowList = isDesktop || mobileView === 'list';
  const shouldShowChat = isDesktop || mobileView === 'chat';

  return (
    <div className="min-h-[calc(100vh-96px)] bg-slate-50 py-8">
      <div className="container-fixed flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-slate-900">Real-time conversations</h1>
        </header>
        <div
          className={`grid h-[calc(100vh-220px)] gap-6 ${
            isDesktop ? 'lg:grid-cols-[320px_1fr]' : 'grid-cols-1'
          }`}
        >
          {shouldShowList && (
            <ConversationsList
              conversations={conversations}
              activePartnerId={activePartnerId}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoadingConversations}
            />
          )}
          {shouldShowChat && (
            <ChatWindow
              partner={activeConversation?.partner}
              messages={messages}
              listing={listing}
              isLoading={isLoadingMessages}
              onSend={sendMessage}
              typing={typingIndicator}
              notifyTyping={notifyTyping}
              onBack={!isDesktop ? handleBackToList : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
