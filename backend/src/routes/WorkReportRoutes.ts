import { Router } from "express";
import { WorkReportController } from "../controllers/WorkReportController";

const router = Router();

router.get('/get/', WorkReportController.get);
router.post('/create', WorkReportController.create);
router.get('/statistics/":id', WorkReportController.getSalesStatistics);

export default router;
