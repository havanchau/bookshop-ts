import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Branch {
    @PrimaryGeneratedColumn()
    id!: number;

}
