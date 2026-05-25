import type { ChatTab } from "../functions/useLiveChat";
import React from "react";
import { buildApiUrl } from "../../../config/api";
import type { ChatUser } from "../functions/useLiveChat";


type Props = {
  messages: ChatTab["messages"];
  users: ChatUser[];
  username: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>; // allow null and make optional
};

export default function MessageList({ messages, users, username, messagesEndRef }: Props) {
  return (
    <div className="flex-1 min-h-0 p-2 md:p-4 overflow-y-auto bg-background/70 text-primary-dark">
      {messages.map((m, i) => {
        const isSender = m.from === username;
        const userImage = users.find((u) => u.name === m.from)?.image;
        const avatarSrc = m.fromImage || userImage;

        return (
        <div key={i} className={`mb-2 ${isSender ? "text-right" : "text-left"}`}>
          <div className={`inline-flex items-center gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}>
            <img
              src={avatarSrc ? buildApiUrl(`/uploads/${avatarSrc}`) : "/icons/document-icon.png"}
              alt={`${m.from} profile`}
              className="h-6 w-6 rounded-full object-cover border border-primary-dark/25"
            />
            <span className={`${m.to ? "text-accent-dark" : "text-primary-dark"} break-words`}>
              {!isSender && (
                <>
                  <strong>{m.from}</strong>
                  {m.to ? " (private)" : ""}: 
                </>
              )}
              {isSender && m.to ? "(private) " : ""}
              {m.content}
            </span>
          </div>
        </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
