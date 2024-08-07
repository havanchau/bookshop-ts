import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    author!: string;

    @Column()
    cost!: number;

    @Column()
    discount!: string;

    @Column()
    discription!: string;

    @Column()
    edition!: string;

    @Column()
    amount!: number;

    @Column()
    saler_amount!: number;

    @Column()
    is_del!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    regdate!: Date;

    @Column({ type: 'timestamp', nullable: true })
    last_update!: Date;
}
