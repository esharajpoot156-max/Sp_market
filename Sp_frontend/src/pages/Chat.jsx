import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const getConversationId = (id1, id2) => [id1, id2].sort().join("_");

const Chat = () => {
  const { userId: otherUserId } = useParams();
  const { user, loading: authLoading } = useAuth();   // 👈 loading nikala
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const conversationId = user ? getConversationId(user._id, otherUserId) : null;

  useEffect(() => {
    if (authLoading || !user || !otherUserId) return;   // 👈 ye guard add karo
    api.get(`/users/${otherUserId}`).then((res) => setOtherUser(res.data));
    api.get(`/messages/${conversationId}`).then((res) => setMessages(res.data));
  }, [otherUserId, conversationId, authLoading, user]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit("join_conversation", conversationId);

    const handleReceive = (msg) => {
      if (msg.conversationId === conversationId) setMessages((prev) => [...prev, msg]);
    };
    const handleTyping = ({ conversationId: cid }) => { if (cid === conversationId) setTyping(true); };
    const handleStopTyping = ({ conversationId: cid }) => { if (cid === conversationId) setTyping(false); };

    socket.on("receive_message", handleReceive);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit("send_message", { conversationId, receiverId: otherUserId, text: text.trim() });
    setText("");
    socket.emit("stop_typing", { conversationId, receiverId: otherUserId });
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing", { conversationId, receiverId: otherUserId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId, receiverId: otherUserId });
    }, 1500);
  };

  if (authLoading) return <p className="text-center py-16 text-secondary/50 dark:text-white/50">Loading...</p>;  // 👈 naya guard

  return (
    <div className="bg-bg dark:bg-ink min-h-[calc(100vh-72px)] flex flex-col transition-colors">
      <div className="bg-surface dark:bg-secondary/60 border-b border-secondary/10 dark:border-white/10 px-6 py-4 flex items-center gap-3">
        {otherUser?.profilePicture ? (
          <img src={otherUser.profilePicture} className="w-9 h-9 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-secondary/10 dark:bg-white/10" />
        )}
        <div>
          <p className="font-medium text-secondary dark:text-white text-sm">{otherUser?.name || "Loading..."}</p>
          {typing && <p className="text-xs text-primary">typing...</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl w-full mx-auto space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId._id === user._id || msg.senderId === user._id;
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-surface dark:bg-secondary/60 border border-secondary/10 dark:border-white/10 text-secondary dark:text-white rounded-bl-sm"
                }`}
              >
                {msg.text}
                <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-secondary/40 dark:text-white/40"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="bg-surface dark:bg-secondary/60 border-t border-secondary/10 dark:border-white/10 px-6 py-4 flex items-center gap-3 max-w-2xl w-full mx-auto"
      >
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white w-10 h-10 rounded-full flex items-center justify-center transition"
        >
          <FaPaperPlane size={14} />
        </button>
      </form>
    </div>
  );
};

export default Chat;