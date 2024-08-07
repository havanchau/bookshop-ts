import { Router } from "express";
import { BookOrderedController } from "../controllers/BookOrderedController";

const router = Router();

router.post('/create', BookOrderedController.create);
router.get('/get/', BookOrderedController.get);
router.put('/update/:id', BookOrderedController.update);
router.delete('/delete/":id', BookOrderedController.delete);

export default router;
