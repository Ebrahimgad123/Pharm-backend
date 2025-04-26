import express, { Request, Response } from 'express'
const app = express()
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import connectDB from './config/db'
import authRoute from './routes/authRoute'
import {errorHandling, NotFound} from './middleware/errorHandling'
import patientRoute from './routes/patientRoute'
import pharmacistRoute from './routes/Pharmacists'
import adminRoute from './routes/adminRoute'
const port = 3000
dotenv.config()
connectDB()
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))




app.use("/auth",authRoute)
app.use("/patient",patientRoute)
app.use("/pharmacist",pharmacistRoute)
app.use("/admin", adminRoute)
app.use(NotFound)
app.use(errorHandling)
const server=app.listen(process.env.PORT, () => console.log(`Watch in ${port}!`))
import { Server } from "socket.io"
const io = new Server (server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
})

io.on("connection", (socket: any) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData: any) => {
        socket.join(userData);
        socket.emit("connected");
    });

    socket.on("join chat", (room: any) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room: any) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room: any) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved: any) => {
        console.log("HALLOO " + newMessageRecieved);
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user: any) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });
    // we added parameter userData (to be reviewed)
    socket.off("setup", (userData: any) => {
        console.log("USER DISCONNECTED");
        socket.leave(userData);
    });
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
});
