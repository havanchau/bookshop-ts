import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    senderId!: string;

    @Column()
    receiverId!: string;

    @Column('text')
    content!: string;

    @CreateDateColumn()
    timestamp!: Date;
}
