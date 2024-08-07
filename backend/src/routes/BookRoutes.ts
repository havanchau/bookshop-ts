import { Router } from "express";
import { BookController } from "../controllers/BookController";

const router = Router();

router.post('/create', BookController.create);
router.get('/get/', BookController.get);
router.get('/update/:id', BookController.update);
router.get('/delete/":id', BookController.delete);

export default router;
