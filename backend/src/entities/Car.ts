import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Car {
    @PrimaryGeneratedColumn()
    id!: number;

}
