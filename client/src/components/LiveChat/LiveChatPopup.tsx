import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAuth } from "../../context/AuthContext";
import { useLiveChatContext } from "../../context/LiveChatContext";
import ChatTabs from "./elements/ChatTabs";
import MessageInput from "./elements/MessageInput";
import MessageList from "./elements/MessageList";
import UserSidebar from "./elements/UsersSidebar";

export default function LiveChatPopup() {
  const { user } = useAuth();
  const { chat, isChatOpen, closeChat } = useLiveChatContext();

  if (!isChatOpen) return null;

  const isAuthenticated = Boolean(user?.name);
  const needsGuestName = !isAuthenticated && !chat.username;

  const currentMessages = chat.tabs.find(t => t.name === chat.activeTab)?.messages || [];

  return (
    <div className="fixed inset-0 z-[1100] pointer-events-none">
      <DndProvider backend={HTML5Backend}>
        <section
          className="pointer-events-auto absolute right-2 md:right-6 bottom-2 md:bottom-6 w-[calc(100%-1rem)] md:w-[756px] h-[68dvh] max-h-[68dvh] md:h-[64dvh] md:max-h-[620px] rounded-2xl border border-primary-dark/15 bg-background/95 shadow-2xl flex flex-col overflow-hidden"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
        >
          <header className="px-4 md:px-5 py-3 border-b border-primary-dark/15 bg-accent/65 flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-primary-dark">Live Chat</h2>
              <p className="text-sm text-primary-dark/70">Connected users: {chat.users.length}</p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="px-3 py-1.5 rounded-lg bg-primary-dark text-white hover:opacity-90"
            >
              Close
            </button>
          </header>

          {needsGuestName ? (
            <div className="flex-1 p-4 md:p-5 bg-background/90 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-primary-dark mb-2">Join as guest</h3>
              <p className="text-sm text-primary-dark/75 mb-3">
                Enter a display name to start chatting with connected users.
              </p>
              <input
                type="text"
                value={chat.inputName}
                onChange={(e) => chat.setInputName(e.target.value)}
                placeholder="Your name"
                className="border border-primary-dark/20 p-2 rounded w-full mb-3"
              />
              <button
                type="button"
                onClick={() => chat.inputName.trim() && chat.setUsername(`${chat.inputName.trim()} (Guest)`)}
                className="bg-primary-dark text-white px-4 py-2 rounded w-full hover:opacity-90"
              >
                Join Chat
              </button>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              <UserSidebar
                users={chat.users}
                openPrivateTab={chat.openPrivateTab}
                showUserDropdown={chat.showUserDropdown}
                setShowUserDropdown={chat.setShowUserDropdown}
                username={chat.username}
              />

              <div className="flex-1 min-h-0 flex flex-col relative">
                <ChatTabs
                  tabs={chat.tabs}
                  moveTab={chat.moveTab}
                  activeTab={chat.activeTab}
                  switchTab={chat.switchTab}
                  closeTab={chat.closeTab}
                />
                <MessageList
                  messages={currentMessages}
                  username={chat.username}
                  messagesEndRef={chat.messagesEndRef}
                />
                <MessageInput
                  message={chat.message}
                  setMessage={chat.setMessage}
                  sendMessage={chat.sendMessage}
                  showEmojiPicker={chat.showEmojiPicker}
                  setShowEmojiPicker={chat.setShowEmojiPicker}
                  addEmoji={chat.addEmoji}
                />
              </div>
            </div>
          )}
        </section>
      </DndProvider>
    </div>
  );
}
