import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column()
    role!: string;

    @Column()
    is_del!: boolean;

    @Column({ type: 'timestamp' })
    start_date!: Date;

    @Column({ nullable: true })
    email!: string;

    @Column({ nullable: true })
    phone_number!: string;

    @Column({ nullable: true })
    old_password!: string;

    @Column({ type: 'timestamp', nullable: true })
    last_login!: Date;

    @Column({ type: 'timestamp', nullable: true })
    regdate!: Date;

    @Column({ type: 'timestamp', nullable: true })
    last_update!: Date;
}
