import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    parent_id!: number;

    @Column()
    uid!: number;

    @Column()
    content!: string;

    @Column({ type: 'timestamp' })
    regdate!: Date;

    @Column({ type: 'timestamp' })
    last_update!: Date;

}
