import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class WorkReport {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    uid!: number;

    @Column()
    month!: number;

    @Column()
    work_day!: string;

    @Column({ nullable: true })
    sale_number!: number;

    @Column({ type: 'timestamp', nullable: true })
    last_login!: Date;

    @Column({ type: 'timestamp', nullable: true })
    register_date!: Date;
}
