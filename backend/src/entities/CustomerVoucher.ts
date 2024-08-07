import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Voucher {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    uid!: number;

    @Column()
    voucher_id!: number;

}
