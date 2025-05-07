import asyncHandler from 'express-async-handler'
import { Request, Response } from 'express';

import Chat from '../models/Chat';
import User from '../models/User';

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
export const accessChat = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { docId, patId } = req.body;

  if (!docId || !patId) {
    res.status(400).json({ message: "Both docId and patId are required." });
    return;
  }

  console.log("🔍 Looking for existing chat...");

  let chat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: patId } } },
      { users: { $elemMatch: { $eq: docId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

    
  chat = await Chat.populate(chat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (chat.length > 0) {
    console.log("✅ Chat found, returning existing chat.");
    res.status(200).json(chat[0]);
    return;
  }

  console.log("📦 No chat found. Creating a new one...");

  const chatData = {
    chatName: "sender", 
    isGroupChat: false,
    users: [patId, docId],
  };

  try {
    const createdChat = await Chat.create(chatData);

    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );

    console.log("✅ New chat created successfully.");
    res.status(200).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error });
  }
});
//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
export const fetchChats = asyncHandler(async (req:Request, res:Response):Promise<any> => {
  try {
    console.log("FETECHINGGGGGGGGGGGGGGGGGGG");
    const {userId} = req.params;
    Chat.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results:any) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
  }
});


export const createGroupChat = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  let users = req.body.users;

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  if (!users.includes(req.user?.userId)) {
    users.push(req.user?.userId);
  }

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user?.userId,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
export const renameGroup = asyncHandler(async (req:Request, res:Response) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
export const removeFromGroup = asyncHandler(async (req:Request, res:Response) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
export const addToGroup = asyncHandler(async (req:Request, res:Response) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});








