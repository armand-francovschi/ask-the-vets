import { Router } from "express";
import * as petsController from "../controllers/petsController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/", petsController.getAllPets);
router.post("/", petsController.addPet);
router.put("/:id", petsController.updatePet);
router.delete("/:id", petsController.deletePet);
router.post("/:id/profile-image", upload.single("file"), petsController.uploadProfileImage);
router.post("/:id/medical-file", upload.single("file"), petsController.uploadMedicalFile);

export default router;
