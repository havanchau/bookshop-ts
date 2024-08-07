import { WorkReport } from './../entities/WorkReport';
import { Request, Response } from "express";
import { getRepository, getConnection, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

export class WorkReportController {

}
