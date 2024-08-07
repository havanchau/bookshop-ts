import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    order_id!: number;

    @Column()
    uid!: number;

    @Column()
    eid!: number;

    @Column()
    amount!: number;

    @Column()
    status!: string;

}