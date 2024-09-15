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
router.post("/user", createUser);
router.get("/user/:id", getUserById);
router.put("/user/:id", updateUser);
router.put("/userAccess/:id", updateUserAccessibility);
router.delete("/user/:id", deleteUser);

export default router;
