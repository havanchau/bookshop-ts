import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Voucher {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    type_to_use!: string;

    @Column({ type: 'timestamp' })
    start_date!: Date;

    @Column({ type: 'timestamp' })
    end_date!: Date;

    @Column()
    amount!: number;

    @Column()
    discount_percent!: number;

}
