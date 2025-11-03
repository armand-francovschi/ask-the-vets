import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export type Message = {
  from: string;
  content: string;
  to?: string;
};

export type ChatTab = {
  name: string;
  messages: Message[];
  unread: boolean;
};

export function useLiveChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [tabs, setTabs] = useState<ChatTab[]>([{ name: "General", messages: [], unread: false }]);
  const [activeTab, setActiveTab] = useState("General");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tabs, activeTab]);

  // Socket connection
  useEffect(() => {
    if (!username) return;
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    newSocket.emit("join", username);

    const handleUserList = (list: string[]) => setUsers(list);
    const handlePublicMessage = (msg: Message) => {
      setTabs(prev => prev.map(tab => tab.name === "General"
        ? { ...tab, messages: [...tab.messages, msg], unread: activeTab !== "General" }
        : tab
      ));
    };
    const handlePrivateMessage = (msg: Message) => {
      const tabName = msg.from === username ? msg.to || "" : msg.from;
      setTabs(prev => {
        const existing = prev.find(t => t.name === tabName);
        if (!existing) return [...prev, { name: tabName, messages: [msg], unread: activeTab !== tabName }];
        return prev.map(t => t.name === tabName
          ? { ...t, messages: [...t.messages, msg], unread: activeTab !== tabName }
          : t
        );
      });
    };

    newSocket.on("userList", handleUserList);
    newSocket.on("message", handlePublicMessage);
    newSocket.on("privateMessage", handlePrivateMessage);

    return () => {
      newSocket.disconnect();
    };
  }, [username, activeTab]);

  const sendMessage = () => {
    if (!socket || !message.trim()) return;
    const msgData: Message = { from: username, content: message, to: activeTab === "General" ? undefined : activeTab };
    if (msgData.to) socket.emit("privateMessage", msgData);
    else socket.emit("sendMessage", msgData);
    setMessage("");
  };

  const openPrivateTab = (user: string) => {
    if (user === username) return;
    if (!tabs.find(t => t.name === user)) setTabs(prev => [...prev, { name: user, messages: [], unread: false }]);
    setActiveTab(user);
    setTabs(prev => prev.map(t => t.name === user ? { ...t, unread: false } : t));
    setShowUserDropdown(false);
  };

  const closeTab = (tabName: string) => {
    setTabs(prev => prev.filter(t => t.name !== tabName));
    if (activeTab === tabName) setActiveTab("General");
  };

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
    setTabs(prev => prev.map(t => t.name === tabName ? { ...t, unread: false } : t));
  };

  const moveTab = (dragIndex: number, hoverIndex: number) => {
    const newTabs = [...tabs];
    const [removed] = newTabs.splice(dragIndex, 1);
    newTabs.splice(hoverIndex, 0, removed);
    setTabs(newTabs);
  };

  const addEmoji = (emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return {
    users, tabs, activeTab, message, username, inputName,
    showEmojiPicker, showUserDropdown, messagesEndRef,
    setMessage, setUsername, setInputName, setShowEmojiPicker,
    setShowUserDropdown, sendMessage, openPrivateTab,
    closeTab, switchTab, moveTab, addEmoji
  };
}
