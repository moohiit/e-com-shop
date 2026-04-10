import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyConversationsQuery } from "../../features/chat/chatApiSlice";
import ChatWindow from "../../components/chat/ChatWindow";
import {
  Loader2,
  MessageCircle,
  ChevronLeft,
  Search,
} from "lucide-react";

function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetMyConversationsQuery(undefined, {
    pollingInterval: 15000,
  });
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getRecipient = (conversation) =>
    conversation?.participants?.find((p) => p._id !== user?._id);

  const getUnreadCount = (conversation) =>
    conversation?.unreadCount?.[user?._id] || 0;

  const conversations = data?.conversations || [];

  const filtered = searchTerm
    ? conversations.filter((c) => {
        const r = getRecipient(c);
        return (
          r?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : conversations;

  const totalUnread = conversations.reduce(
    (sum, c) => sum + getUnreadCount(c),
    0
  );

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
  };

  const handleBack = () => {
    setActiveConversation(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          {totalUnread > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden h-[calc(100vh-200px)] flex">
          {/* Conversation List */}
          <div
            className={`w-full md:w-80 shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col ${
              activeConversation ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                  <MessageCircle size={40} className="mb-3 text-gray-300 dark:text-gray-700" />
                  <p className="text-center font-medium text-sm">
                    {searchTerm
                      ? "No conversations match"
                      : "No conversations yet"}
                  </p>
                  <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-500">
                    {searchTerm
                      ? "Try a different search"
                      : "Start a chat from any product page"}
                  </p>
                </div>
              ) : (
                filtered.map((conv) => {
                  const recipient = getRecipient(conv);
                  const unread = getUnreadCount(conv);
                  const isActive = activeConversation?._id === conv._id;
                  const lastTime = conv.lastMessage?.createdAt
                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )
                    : "";

                  return (
                    <button
                      key={conv._id}
                      type="button"
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm ${
                              recipient?.role === "seller"
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {recipient?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm truncate ${
                                unread > 0
                                  ? "font-bold text-gray-900 dark:text-white"
                                  : "font-medium text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {recipient?.name || "Unknown"}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              {lastTime && (
                                <span className="text-[10px] text-gray-400">
                                  {lastTime}
                                </span>
                              )}
                              {unread > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                          <p
                            className={`text-xs truncate mt-0.5 ${
                              unread > 0
                                ? "text-gray-700 dark:text-gray-300 font-medium"
                                : "text-gray-500 dark:text-gray-500"
                            }`}
                          >
                            {conv.lastMessage?.text || "No messages yet"}
                          </p>
                          {conv.product && (
                            <p className="text-[10px] text-blue-500 dark:text-blue-400 truncate mt-0.5">
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
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${
              activeConversation ? "flex" : "hidden md:flex"
            }`}
          >
            {activeConversation ? (
              <>
                {/* Mobile back button header */}
                <div className="md:hidden flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-xs shrink-0">
                      {getRecipient(activeConversation)
                        ?.name?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>
                    <p className="text-sm font-semibold truncate">
                      {getRecipient(activeConversation)?.name || "Chat"}
                    </p>
                  </div>
                </div>
                <ChatWindow
                  conversationId={activeConversation._id}
                  recipientName={getRecipient(activeConversation)?.name}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <MessageCircle size={28} className="text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                  Select a conversation
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Choose from your existing conversations to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
