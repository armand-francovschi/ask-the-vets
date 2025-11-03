import type { ChatTab } from "../functions/useLiveChat";
import React from "react";


type Props = {
  messages: ChatTab["messages"];
  username: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>; // allow null and make optional
};

export default function MessageList({ messages, username, messagesEndRef }: Props) {
  return (
    <div
      className="flex-1 p-2 md:p-4 overflow-y-auto bg-gray-100"
      style={{
        maxHeight: "calc(100vh - 13.78rem )", // mobile: screen height minus top navbar & input box height
      }}
    >
      {messages.map((m, i) => (
        <div key={i} className={m.from === username ? "text-right" : "text-left"}>
          <span className={m.to ? "text-red-500" : "text-black"}>
            <strong>{m.from}</strong>
            {m.to ? " (private)" : ""}: {m.content}
          </span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
