// controllers/chatController.ts
import type { Request, Response } from "express";

// In-memory chat storage (replace with DB in production)
interface Message {
  from: string;
  to?: string; // undefined = public message
  content: string;
  timestamp: Date;
}

const messages: Message[] = [];

/**
 * Get all public messages (or optionally filtered by user for private messages)
 */
export const getMessages = (req: Request, res: Response) => {
  const { user1, user2 } = req.query as { user1?: string; user2?: string };

  if (user1 && user2) {
    // return private conversation between two users
    const privateMessages = messages.filter(
      (m) =>
        m.to &&
        ((m.from === user1 && m.to === user2) || (m.from === user2 && m.to === user1))
    );
    return res.json(privateMessages);
  }

  // return all public messages
  const publicMessages = messages.filter((m) => !m.to);
  return res.json(publicMessages);
};

/**
 * Save a new message
 */
export const postMessage = (req: Request, res: Response) => {
  const { from, content, to } = req.body as {
    from: string;
    content: string;
    to?: string;
  };

  if (!from || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newMessage: Message = {
    from,
    to: to ?? "public",
    content,
    timestamp: new Date(),
  };

  messages.push(newMessage);

  return res.status(201).json(newMessage);
};
