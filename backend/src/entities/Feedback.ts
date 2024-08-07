import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    uid!: number;

    @Column()
    rate!: number;

    @Column()
    content!: string;

    @Column({ type: 'timestamp' })
    regdate!: Date;

    @Column({ type: 'timestamp' })
    last_update!: Date;

}
