import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserAccessibility,
} from "../Controllers/UsersController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/User", createUser);
router.get("/User/:id", getUserById);
router.put("/User/:id", updateUser);
router.put("/User/:id", updateUserAccessibility);
router.delete("/User/:id", deleteUser);

export default router;
