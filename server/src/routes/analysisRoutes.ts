import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import * as analysisController from "../controllers/analysisController.js";

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

const router = Router();

router.post("/upload/:petId", upload.single("file"), analysisController.uploadAnalysisFile);
router.get("/files/:petId", analysisController.getAnalysisFiles);
router.get("/download/:filename", analysisController.downloadAnalysisFile);
router.post("/comment", analysisController.addComment);
router.post("/feedback", analysisController.addFeedback);

export default router;
