import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "../../../config/api";

const CHAT_DEBUG =
  import.meta.env.DEV &&
  (import.meta.env.VITE_CHAT_DEBUG === "true" ||
    (typeof window !== "undefined" && window.localStorage.getItem("chatDebug") === "1"));

const chatDebugLog = (...args: unknown[]) => {
  if (!CHAT_DEBUG) return;
  console.debug("[LiveChat]", ...args);
};

export type ChatUser = {
  name: string;
  image?: string;
};

export type Message = {
  from: string;
  content: string;
  to?: string;
  fromImage?: string;
};

export type ChatTab = {
  name: string;
  messages: Message[];
  unread: boolean;
};

export function useLiveChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [tabs, setTabs] = useState<ChatTab[]>([{ name: "General", messages: [], unread: false }]);
  const [activeTab, setActiveTab] = useState("General");
  const activeTabRef = useRef("General");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const usernameRef = useRef("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [inputName, setInputName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tabs, activeTab]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Socket connection
  useEffect(() => {
    if (!username) return;
    const newSocket = io(SOCKET_BASE_URL);
    setSocket(newSocket);
    socketRef.current = newSocket;
    chatDebugLog("socket connect", { socketId: newSocket.id, username, profileImage });
    newSocket.emit("join", { name: username, image: profileImage || undefined });

    const handleUserList = (list: Array<string | ChatUser>) => {
      const normalized = list.map((entry) => {
        if (typeof entry === "string") {
          return { name: entry };
        }

        return { name: entry.name, image: entry.image };
      });
      setUsers(normalized);
      chatDebugLog("userList", normalized.map((u) => u.name));
    };
    const handlePublicMessage = (msg: Message) => {
      setTabs(prev => prev.map(tab => tab.name === "General"
        ? { ...tab, messages: [...tab.messages, msg], unread: activeTabRef.current !== "General" }
        : tab
      ));
    };
    const handlePrivateMessage = (msg: Message) => {
      const tabName = msg.from === usernameRef.current ? msg.to || "" : msg.from;
      chatDebugLog("privateMessage received", { msg, tabName, activeTab: activeTabRef.current });
      setTabs(prev => {
        const existing = prev.find(t => t.name === tabName);
        if (!existing) return [...prev, { name: tabName, messages: [msg], unread: activeTabRef.current !== tabName }];
        return prev.map(t => t.name === tabName
          ? { ...t, messages: [...t.messages, msg], unread: activeTabRef.current !== tabName }
          : t
        );
      });
    };

    newSocket.on("userList", handleUserList);
    newSocket.on("message", handlePublicMessage);
    newSocket.on("privateMessage", handlePrivateMessage);

    return () => {
      chatDebugLog("socket disconnect", { socketId: newSocket.id, username });
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
    };
  }, [username, profileImage]);

  const sendMessage = () => {
    const activeSocket = socketRef.current || socket;
    if (!activeSocket || !message.trim()) return;
    const msgData: Message = { from: username, content: message, to: activeTab === "General" ? undefined : activeTab };
    if (msgData.to) {
      chatDebugLog("privateMessage send", { msgData, socketId: activeSocket.id });
      activeSocket.emit("privateMessage", msgData);
    } else {
      activeSocket.emit("sendMessage", msgData);
    }
    setMessage("");
  };

  const openPrivateTab = (user: string | ChatUser) => {
    const targetName = typeof user === "string" ? user : user.name;
    chatDebugLog("openPrivateTab", { targetName, currentUser: username });
    if (targetName === username) return;
    if (!tabs.find(t => t.name === targetName)) setTabs(prev => [...prev, { name: targetName, messages: [], unread: false }]);
    setActiveTab(targetName);
    setTabs(prev => prev.map(t => t.name === targetName ? { ...t, unread: false } : t));
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
    users, tabs, activeTab, message, username, profileImage, inputName,
    showEmojiPicker, showUserDropdown, messagesEndRef,
    setMessage, setUsername, setProfileImage, setInputName, setShowEmojiPicker,
    setShowUserDropdown, sendMessage, openPrivateTab,
    closeTab, switchTab, moveTab, addEmoji
  };
}
