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
    <div className="p-2 md:p-4 border-t flex items-center bg-white relative md:relative fixed md:bottom-auto bottom-0 left-0 w-full md:w-auto z-50">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 border p-2 rounded text-sm md:text-base"
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />

      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="ml-2 bg-gray-200 text-xl px-3 py-2 rounded hover:bg-gray-300"
        title="Add emoji"
      >
        😊
      </button>

      {showEmojiPicker && (
        <div className="absolute bottom-[calc(100%+8px)] right-2 md:right-4 transition-all duration-300 overflow-hidden">
          <EmojiPicker onEmojiClick={addEmoji} height={300} />
        </div>
      )}

      <button
        onClick={sendMessage}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}


