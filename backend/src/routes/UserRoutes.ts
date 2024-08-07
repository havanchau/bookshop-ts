import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

router.get('/get/', UserController.get);
router.put('/update/:id', UserController.update);
router.delete('/delete/":id', UserController.delete);

export default router;
