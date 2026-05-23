import EmojiPicker from "emoji-picker-react";

type Props = {
  message: string;
  setMessage: (msg: string) => void;
  sendMessage: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (b: boolean) => void;
  addEmoji: (emojiData: { emoji: string }) => void;
};

export default function MessageInput({ message, setMessage, sendMessage, showEmojiPicker, setShowEmojiPicker, addEmoji }: Props) {
  return (
    <div className="p-2 md:p-4 border-t border-primary-dark/15 flex items-center gap-2 bg-accent/30 relative z-10">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 min-w-0 border border-primary-dark/20 bg-background/95 text-primary-dark p-2 rounded text-sm md:text-base"
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />

      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="bg-primary-light/60 text-primary-dark text-xl px-3 py-2 rounded hover:bg-primary-light/80 shrink-0"
        title="Add emoji"
      >
        😊
      </button>

      {showEmojiPicker && (
        <div className="absolute bottom-[calc(100%+8px)] right-0 transition-all duration-300 overflow-hidden max-w-[calc(100vw-1rem)]">
          <EmojiPicker onEmojiClick={addEmoji} height={300} width={320} />
        </div>
      )}

      <button
        onClick={sendMessage}
        className="bg-primary-dark text-white px-4 py-2 rounded shrink-0 hover:opacity-90"
      >
        Send
      </button>
    </div>
  );
}


