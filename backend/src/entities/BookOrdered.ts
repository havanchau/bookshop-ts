import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class BookOrdered {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    book_id!: string;

    @Column()
    user_id!: string;

    @Column()
    amount!: string;

    @Column()
    price!: number;

    @Column()
    state!: string;

    @Column()
    discount!: string;

    @Column()
    bill_id!: string;

    @Column()
    is_del!: boolean;

    @Column()
    regdate!: Date;

    @Column()
    last_update!: Date;
}
