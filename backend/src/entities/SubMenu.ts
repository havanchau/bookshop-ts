import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SubMenu {
    @PrimaryGeneratedColumn()
    id!: number;

}
