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
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.put("/userAccess/:id", updateUserAccessibility);
router.delete("/:id", deleteUser);

export default router;
