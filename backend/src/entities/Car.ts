import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Car {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    car_type!: string;

    @Column({ type: 'timestamp' })
    start_date_use!: Date;

    @Column()
    branch_id!: number;

    @Column()
    payload!: number;

}
