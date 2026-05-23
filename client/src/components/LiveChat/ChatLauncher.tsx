import { useLiveChatContext } from "../../context/LiveChatContext";

export default function ChatLauncher() {
  const { openChat, connectedCount, isChatOpen } = useLiveChatContext();

  if (isChatOpen) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      className="chat-launcher-btn fixed right-3 md:right-6 z-[1050] rounded-full bg-primary-dark text-white px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-base shadow-xl border border-primary-dark/40 hover:opacity-90"
      aria-label={`Open chat with ${connectedCount} connected users`}
    >
      Chat ({connectedCount})
    </button>
  );
}
