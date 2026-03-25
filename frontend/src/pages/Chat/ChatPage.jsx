import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyConversationsQuery } from "../../features/chat/chatApiSlice";
import ChatWindow from "../../components/chat/ChatWindow";
import { Loader2, MessageCircle } from "lucide-react";

function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetMyConversationsQuery();
  const [activeConversation, setActiveConversation] = useState(null);

  const getRecipient = (conversation) => {
    return conversation.participants?.find((p) => p._id !== user?._id);
  };

  const getUnreadCount = (conversation) => {
    return conversation.unreadCount?.[user?._id] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const conversations = data?.conversations || [];

  return (
    <div className="max-w-6xl mx-auto p-4 h-[calc(100vh-120px)]">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <div className="flex h-[calc(100%-3rem)] bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {/* Conversation List */}
        <div className="w-80 border-r dark:border-gray-700 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <MessageCircle size={40} className="mb-3" />
              <p className="text-center">No conversations yet</p>
              <p className="text-xs text-center mt-1">
                Start a chat from any product page
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const recipient = getRecipient(conv);
              const unread = getUnreadCount(conv);
              const isActive = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isActive ? "bg-blue-50 dark:bg-gray-700" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      {recipient?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {recipient?.name || "Unknown"}
                        </p>
                        {unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage?.text || "No messages yet"}
                      </p>
                      {conv.product && (
                        <p className="text-[10px] text-blue-500 truncate mt-0.5">
                          Re: {conv.product.name}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            conversationId={activeConversation?._id}
            recipientName={getRecipient(activeConversation)?.name}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
