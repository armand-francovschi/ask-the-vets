import type { ChatTab } from "../functions/useLiveChat";
import React from "react";


type Props = {
  messages: ChatTab["messages"];
  username: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>; // allow null and make optional
};

export default function MessageList({ messages, username, messagesEndRef }: Props) {
  return (
    <div className="flex-1 min-h-0 p-2 md:p-4 overflow-y-auto bg-background/70 text-primary-dark">
      {messages.map((m, i) => (
        <div key={i} className={m.from === username ? "text-right" : "text-left"}>
          <span className={`${m.to ? "text-accent-dark" : "text-primary-dark"} break-words`}>
            <strong>{m.from}</strong>
            {m.to ? " (private)" : ""}: {m.content}
          </span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
