import { Router } from "express";
import * as usersController from "../controllers/usersController.js";

const router = Router();

router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.get("/:id/pets", usersController.getUserPets);

export default router;
