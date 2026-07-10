import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/messages/conversations")
      .then((res) => setConversations(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-16 text-secondary/50 dark:text-white/50">Loading...</p>;

  // 👇 null/undefined otherUser wale conversations filter out karo
  const validConversations = conversations.filter((c) => c.otherUser && c.otherUser._id);

  return (
    <div className="bg-bg dark:bg-ink min-h-[calc(100vh-72px)] px-6 py-8 transition-colors">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary dark:text-white mb-6">Messages</h1>

        {validConversations.length === 0 ? (
          <p className="text-secondary/50 dark:text-white/50 text-sm">No conversations yet.</p>
        ) : (
          <div className="space-y-2">
            {validConversations.map((c) => (
              <Link
                key={c.conversationId}
                to={`/chat/${c.otherUser._id}`}
                className="flex items-center gap-3 bg-surface dark:bg-secondary/60 p-4 rounded-xl border border-secondary/10 dark:border-white/10 hover:shadow-sm transition"
              >
                {c.otherUser.profilePicture ? (
                  <img src={c.otherUser.profilePicture} className="w-11 h-11 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-secondary/10 dark:bg-white/10" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary dark:text-white text-sm">{c.otherUser.name}</p>
                  <p className="text-xs text-secondary/50 dark:text-white/50 truncate">{c.lastMessage}</p>
                </div>
                {!c.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;