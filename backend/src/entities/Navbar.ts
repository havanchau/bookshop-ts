import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Navbar {
    @PrimaryGeneratedColumn()
    id!: number;

}
