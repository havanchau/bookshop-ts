import { Request, Response } from "express";
import { getRepository, getConnection, QueryRunner } from "typeorm";
import { WorkReport } from "../entities/WorkReport";
import * as jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

export class WorkReportController {

    /**
     * @swagger
     * /work-report:
     *   post:
     *     summary: Create a work report
     *     description: Allows an employee to create a work report for a specific day.
     *     tags: [WorkReport]
     *     parameters:
     *       - in: body
     *         name: workReport
     *         description: The work report details
     *         schema:
     *           type: object
     *           required:
     *             - uid
     *             - month
     *             - work_day
     *           properties:
     *             uid:
     *               type: integer
     *             month:
     *               type: integer
     *             work_day:
     *               type: string
     *             sale_number:
     *               type: integer
     *               nullable: true
     *     responses:
     *       201:
     *         description: Work report created successfully
     *       401:
     *         description: Unauthorized - No token provided
     *       403:
     *         description: Forbidden - Unauthorized access
     *       500:
     *         description: Internal server error
     */
    static create = async (req: Request, res: Response) => {
        const { uid, month, work_day, sale_number } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            const decoded: any = jwt.verify(token, SECRET_KEY);
            const employeeId = decoded.id;

            // Check if the UID matches the employee's ID from token
            if (uid !== employeeId) {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'Unauthorized' });
            }

            const workReportRepository = queryRunner.manager.getRepository(WorkReport);

            const newWorkReport = new WorkReport();
            newWorkReport.uid = uid;
            newWorkReport.month = month;
            newWorkReport.work_day = work_day;
            newWorkReport.sale_number = sale_number;
            newWorkReport.register_date = new Date();

            await workReportRepository.save(newWorkReport);
            await queryRunner.commitTransaction();

            res.status(201).send({ message: 'Work report created successfully', workReport: newWorkReport });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            res.status(500).send({ message: 'Error creating work report', error: error.message });
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /work-report/{uid}/{month}:
     *   get:
     *     summary: Get work reports for an employee for a specific month
     *     description: Retrieves all work reports for a specific employee and month.
     *     tags: [WorkReport]
     *     parameters:
     *       - in: path
     *         name: uid
     *         required: true
     *         schema:
     *           type: integer
     *       - in: path
     *         name: month
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Successfully retrieved work reports
     *       401:
     *         description: Unauthorized - No token provided
     *       403:
     *         description: Forbidden - Unauthorized access
     *       404:
     *         description: Not Found - Work reports not found
     *       500:
     *         description: Internal server error
     */
    static get = async (req: Request, res: Response) => {
        const { uid, month } = req.params;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);
            const employeeId = decoded.id;

            // Check if the UID matches the employee's ID from token
            if (Number(uid) !== employeeId) {
                return res.status(403).send({ message: 'Unauthorized' });
            }

            const workReportRepository = getRepository(WorkReport);
            const workReports = await workReportRepository.find({ where: { uid: Number(uid), month: Number(month) } });

            if (workReports.length === 0) {
                return res.status(404).send({ message: 'No work reports found' });
            }

            res.status(200).send({ workReports });
        } catch (error: any) {
            res.status(500).send({ message: 'Error retrieving work reports', error: error.message });
        }
    }

    /**
     * @swagger
     * /work-report/sales-statistics/{uid}:
     *   get:
     *     summary: Get sales statistics for an employee
     *     description: Retrieves the number of sales made by an employee each month.
     *     tags: [WorkReport]
     *     parameters:
     *       - in: path
     *         name: uid
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Successfully retrieved sales statistics
     *       401:
     *         description: Unauthorized - No token provided
     *       403:
     *         description: Forbidden - Unauthorized access
     *       500:
     *         description: Internal server error
     */
    static getSalesStatistics = async (req: Request, res: Response) => {
        const { uid } = req.params;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);
            const employeeId = decoded.id;

            // Check if the UID matches the employee's ID from token
            if (Number(uid) !== employeeId) {
                return res.status(403).send({ message: 'Unauthorized' });
            }

            const workReportRepository = getRepository(WorkReport);
            const salesStatistics = await workReportRepository
                .createQueryBuilder("work_report")
                .select("month, SUM(sale_number) AS total_sales")
                .where("uid = :uid", { uid: Number(uid) })
                .groupBy("month")
                .getRawMany();

            res.status(200).send({ salesStatistics });
        } catch (error: any) {
            res.status(500).send({ message: 'Error retrieving sales statistics', error: error.message });
        }
    }
}
