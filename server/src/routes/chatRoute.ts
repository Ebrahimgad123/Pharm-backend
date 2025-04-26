import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} from "../controllers/chatController";
import { verifyToken } from "../middleware/verifyTokens";
import { checkPermission } from "../middleware/userRole";

const router = express.Router();

router.use(verifyToken);

// Access a one-to-one chat => Patients and Pharmacists can access their own chats
router.post("/",checkPermission("chat", "create", (req) => req.body.patId || req.body.docId),accessChat);

// Fetch all chats for a user => Patients and Pharmacists can fetch their own chats
router.get("/:userId",checkPermission("chat", "read", (req) => req.params.userId),fetchChats);

// Create a group chat => Patients and Pharmacists can create group chats
router.post("/group",checkPermission("chat", "create", (req) => req.user?.userId || ""),createGroupChat);

// Rename a group chat => Only group admins can rename their own group chats
router.put("/rename",checkPermission("chat", "update", (req) => req.body.chatId),renameGroup);

// Remove a user from a group => Only group admins can remove users from their own group chats
router.put("/groupremove",checkPermission("chat", "update", (req) => req.body.chatId),removeFromGroup);

// Add a user to a group => Only group admins can add users to their own group chats
router.put("/groupadd",checkPermission("chat", "update", (req) => req.body.chatId),addToGroup);

export default router;