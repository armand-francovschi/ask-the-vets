import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useLiveChat } from "../components/LiveChat/functions/useLiveChat";

type LiveChatState = ReturnType<typeof useLiveChat>;

type LiveChatContextType = {
  chat: LiveChatState;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  connectedCount: number;
};

const LiveChatContext = createContext<LiveChatContextType | undefined>(undefined);

export function LiveChatProvider({ children }: { children: ReactNode }) {
  const chat = useLiveChat();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (user?.name && chat.username !== user.name) {
      chat.setUsername(user.name);
      return;
    }

    if (!user && chat.username && !chat.username.endsWith(" (Guest)")) {
      chat.setUsername("");
    }
  }, [user?.name, chat.username]);

  const value = useMemo(
    () => ({
      chat,
      isChatOpen,
      openChat: () => setIsChatOpen(true),
      closeChat: () => setIsChatOpen(false),
      toggleChat: () => setIsChatOpen(prev => !prev),
      connectedCount: chat.users.length,
    }),
    [chat, isChatOpen]
  );

  return <LiveChatContext.Provider value={value}>{children}</LiveChatContext.Provider>;
}

export function useLiveChatContext() {
  const ctx = useContext(LiveChatContext);
  if (!ctx) throw new Error("useLiveChatContext must be used within LiveChatProvider");
  return ctx;
}
