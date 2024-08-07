import { Request, Response } from "express";
import { getRepository, getConnection } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Token } from "../utils/Token";
import dotenv from 'dotenv';
import { sendMail } from "src/utils/mailer";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

export class UserController {

}
