import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    email!: string;

    @Column({ nullable: true })
    phone_number!: string;

    @Column({ nullable: true })
    old_password!: string;

    @Column({ type: 'timestamp', nullable: true })
    last_login!: Date;

    @Column({ type: 'timestamp', nullable: true })
    register_date!: Date;

    @Column({ default: false })
    isVerified!: boolean;
}
