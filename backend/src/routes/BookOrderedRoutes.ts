import { Router } from "express";
import { BookOrderedController } from "../controllers/BookOrderedController";

const router = Router();

router.post('/create', BookOrderedController.create);
router.get('/get/', BookOrderedController.get);
router.get('/update/:id', BookOrderedController.update);
router.get('/delete/":id', BookOrderedController.delete);

export default router;
