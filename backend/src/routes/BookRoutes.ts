import { Router } from "express";
import { BookController } from "../controllers/BookController";

const router = Router();

router.post('/create', BookController.create);
router.get('/get/', BookController.get);

export default router;
