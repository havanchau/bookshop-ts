import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import AuthRoutes from "./routes/AuthRoutes";
import BookRoutes from "./routes/BookRoutes";
import BookOrderedRoutes from "./routes/BookOrderedRoutes";
import setupSwagger from "./swagger";
import { MessageController } from "./controllers/MessageController";

createConnection().then(async connection => {
    const app = express();
    const server = http.createServer(app);
    const io = new SocketIOServer(server);

    app.use(bodyParser.json());

    app.use("/auth", AuthRoutes);
    app.use("/book", BookRoutes);
    app.use("/book-ordered", BookOrderedRoutes);

    setupSwagger(app);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('send_message', async (data) => {
            const { senderId, receiverId, content } = data;

            const message = {
                senderId,
                receiverId,
                content,
                timestamp: new Date(),
            };

            await MessageController.saveMessage(message);

            socket.to(receiverId).emit('receive_message', message);
        });

        socket.on('join_room', (room) => {
            socket.join(room);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    server.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}).catch(error => console.log(error));
