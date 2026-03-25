import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useGetMessagesQuery, useSendMessageMutation } from "../../features/chat/chatApiSlice";
import { useSocket } from "../../context/SocketContext";
import { Send, Loader2 } from "lucide-react";

function ChatWindow({ conversationId, recipientName }) {
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();
  const [text, setText] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data, isLoading } = useGetMessagesQuery(
    { conversationId },
    { skip: !conversationId }
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  // Sync server messages to local state
  useEffect(() => {
    if (data?.messages) {
      setLocalMessages(data.messages);
    }
  }, [data]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("joinConversation", conversationId);

    const handleNewMessage = ({ message, conversationId: cId }) => {
      if (cId === conversationId) {
        setLocalMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = ({ userId }) => {
      if (userId !== user?._id) setIsTyping(true);
    };

    const handleStopTyping = ({ userId }) => {
      if (userId !== user?._id) setIsTyping(false);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);

    return () => {
      socket.emit("leaveConversation", conversationId);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
    };
  }, [socket, conversationId, user?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleTyping = () => {
    if (socket) {
      socket.emit("typing", { conversationId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { conversationId });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    try {
      const result = await sendMessage({ conversationId, text: text.trim() }).unwrap();
      setLocalMessages((prev) => [...prev, result.message]);
      setText("");
      if (socket) socket.emit("stopTyping", { conversationId });
    } catch {
      // Error handled by RTK Query
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <h3 className="font-semibold">{recipientName || "Chat"}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : localMessages.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No messages yet. Say hi!</p>
        ) : (
          localMessages.map((msg) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-2xl text-sm text-gray-500">
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full dark:bg-gray-700 dark:border-gray-600 text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
