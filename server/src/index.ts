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
import medicineRoute from './routes/medicineRoute'
import cartRoute from './routes/Cart'
import chatRoute from './routes/chatRoute'
import rateLimit from 'express-rate-limit'
import cookieParser from "cookie-parser";
import paymentRoute from './routes/PaymentRoute'
import messageRoute from './routes/messageRoutes'
import orderRoute from './routes/orderRoute'
const port = 3000
dotenv.config()
connectDB()
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: "Too many requests from this IP, please try again later.",
});
app.use(cookieParser());
app.use(limiter);
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("./uploads"));

app.get('/', (req: Request, res: Response) => {
    res.send('<h2 style="color:blue;text-align:center">Welcome to the pharmacy API</h2>')
}
)


app.use("/auth",authRoute) //1
app.use("/patient",patientRoute) //2
app.use("/pharmacist",pharmacistRoute) //3
app.use("/admin", adminRoute)   //4
app.use('/medicine',medicineRoute)  //5
app.use ("/cart", cartRoute)   //6
app.use("/chat", chatRoute)  //7
app.use("/message", messageRoute); //8
app.use("/orders", orderRoute);  //9
app.use("/create-checkout-session", paymentRoute); //10
//

// app.use("/walletPayment", walletPaymentRouter);
// app.use("/cashOnDelivery", cashOnDeliveryRouter);
// app.use("/api/user", userRoutes);

//
app.use(NotFound)
app.use(errorHandling)
const server=app.listen(process.env.PORT, () => console.log(`Watch in ${process.env.PORT}!`))
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
