// src/controllers/MessageController.ts
import { getRepository } from 'typeorm';
import { Message } from '../entities/Message';

export class MessageController {
    static async saveMessage(data: { senderId: string; receiverId: string; content: string; timestamp: Date }) {
        const messageRepository = getRepository(Message);
        const message = new Message();
        message.senderId = data.senderId;
        message.receiverId = data.receiverId;
        message.content = data.content;
        message.timestamp = data.timestamp;

        await messageRepository.save(message);
    }

    static async getMessagesForUser(userId: string) {
        const messageRepository = getRepository(Message);
        return await messageRepository.createQueryBuilder('message')
            .where('message.receiverId = :userId', { userId })
            .orWhere('message.senderId = :userId', { userId })
            .orderBy('message.timestamp', 'ASC')
            .getMany();
    }
}
