import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeeController";

const router = Router();

router.get('/get/', EmployeeController.get);
router.put('/update/:id', EmployeeController.update);
router.post('/create', EmployeeController.create);
router.delete('/delete/":id', EmployeeController.delete);

export default router;
