// routes/chatRoutes.ts
import express from "express";
import { getMessages, postMessage } from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getMessages); // GET /chat?user1=Alice&user2=Bob
router.post("/", postMessage); // POST /chat

export default router;
