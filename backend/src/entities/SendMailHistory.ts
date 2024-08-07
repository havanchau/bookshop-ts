import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SendMailHistory {
    @PrimaryGeneratedColumn()
    id!: number;

}
