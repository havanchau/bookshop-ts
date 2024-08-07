import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Vourcher {
    @PrimaryGeneratedColumn()
    id!: number;

}
