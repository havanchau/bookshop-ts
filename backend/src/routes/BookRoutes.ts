import { Router } from "express";
import { BookController } from "../controllers/BookController";

const router = Router();

router.post('/create', BookController.create);
router.get('/get/', BookController.get);
router.put('/update/:id', BookController.update);
router.delete('/delete/":id', BookController.delete);

export default router;
