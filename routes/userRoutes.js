import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

// route level middleware - to protect route
// router.use("/change_password", checkUserAuth);

//public Routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post(
  "/send_reset_password_email",
  UserController.sendUserPasswordResetEmail
);
router.post("/reset_password/:id/:token", UserController.userPasswordReset);

//protected route
router.post(
  "/changepassword",
  checkUserAuth,
  UserController.changeUserPassword
);
router.get("/loggeduser", checkUserAuth, UserController.loggedUser);

export default router;
