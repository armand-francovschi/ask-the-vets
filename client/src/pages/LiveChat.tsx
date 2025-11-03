import { DndProvider } from "react-dnd"; import { HTML5Backend } from "react-dnd-html5-backend"; import { useLiveChat } from "../components/LiveChat/functions/useLiveChat"; import ChatTabs from "../components/LiveChat/elements/ChatTabs"; import MessageList from "../components/LiveChat/elements/MessageList"; import MessageInput from "../components/LiveChat/elements/MessageInput"; import UserSidebar from "../components/LiveChat/elements/UsersSidebar"; import UsernameModal from "../components/LiveChat/modals/UsernameModal";

export default function LiveChat() {
  const chat = useLiveChat();
  if (!chat.username) return <UsernameModal inputName={chat.inputName} setInputName={chat.setInputName} setUsername={chat.setUsername} />;
  const currentMessages = chat.tabs.find(t => t.name === chat.activeTab)?.messages || [];
  return (
  <DndProvider backend={HTML5Backend}>
  <div className="fixed inset-x-0 top-16 bottom-0 flex justify-center z-40 pointer-events-none p-2 md:p-0">
    <div className={`pointer-events-auto bg-white rounded-lg shadow-xl w-full max-w-[1000px] h-full md:h-[600px] flex flex-col md:flex-row overflow-hidden relative`}>
      
      <UserSidebar users={chat.users} openPrivateTab={chat.openPrivateTab} showUserDropdown={chat.showUserDropdown} setShowUserDropdown={chat.setShowUserDropdown} username={chat.username} />
      
      <div className={`flex-1 flex flex-col relative ${chat.showUserDropdown && "md:ml-0"} transition-all duration-300`}>
        <ChatTabs tabs={chat.tabs} moveTab={chat.moveTab} activeTab={chat.activeTab} switchTab={chat.switchTab} closeTab={chat.closeTab} />
        <MessageList messages={currentMessages} username={chat.username} messagesEndRef={chat.messagesEndRef} />
        <MessageInput message={chat.message} setMessage={chat.setMessage} sendMessage={chat.sendMessage} showEmojiPicker={chat.showEmojiPicker} setShowEmojiPicker={chat.setShowEmojiPicker} addEmoji={chat.addEmoji} />
      </div>
    </div>
  </div>
</DndProvider>

  );
}
