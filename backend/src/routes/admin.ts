import { Router } from "express";
import { addCourseWords } from "../controllers/adminController";

const router = Router();

router.post("/course-words", addCourseWords as any);

export default router;