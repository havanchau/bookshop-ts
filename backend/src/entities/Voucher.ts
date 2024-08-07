import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Voucher {
    @PrimaryGeneratedColumn()
    id!: number;

}
