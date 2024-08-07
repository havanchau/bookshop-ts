import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class PurchasesBook {
    @PrimaryGeneratedColumn()
    id!: number;

}
