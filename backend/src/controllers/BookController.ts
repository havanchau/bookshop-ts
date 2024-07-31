import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Book } from "../entities/Book";
import dotenv from 'dotenv';

export default class BookController {
    static get = async (req: Request, res: Response) => {
        const { id, name, cost_up, cost_down, edition, saler_amount, orderBy, typeOrder, page = 1, pageSize = 10 } = req.body;

        const bookRepository = getRepository(Book);

        try {
            const query = bookRepository.createQueryBuilder('book');

            const [books, count] = await query.getManyAndCount();

            res.status(200).send({
                data: books,
                total: count,
                page,
                pageSize,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).send({ message: 'Error retrieving books', error: error.message });
            } else {
                res.status(500).send({ message: 'Error retrieving books', error: String(error) });
            }
        }
    }
}
