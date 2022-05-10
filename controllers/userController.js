import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
  ///new user registration function...
  static userRegistration = async (req, res) => {
    const { name, email, password, password_conf, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email aiready exist" });
    } else {
      if (name && email && password && password_conf && tc) {
        if (password === password_conf) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            // generate jwt token....
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.status(201).send({
              status: "success",
              message: "Registration successgully",
              token: token,
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          res.send({
            status: "failed",
            message: "Both password are not matched",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };

  /// user login function ....
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // generate jwt token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "Success",
              message: "login Success",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "email or password not mached",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a register user",
          });
        }
      } else {
        res.send({ status: "failed", message: "All field are required" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //change password function...
  static changeUserPassword = async (req, res) => {
    const { password, password_conf } = req.body;
    if (password && password_conf) {
      if (password !== password_conf) {
        res.send({
          status: "failed",
          message: "password and conf_password not matched",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newHashPassword },
        });
        res.send({
          status: "success",
          message: "password change successfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All field are required" });
    }
  };

  // get logged user detail function
  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  //reset password link send on email function
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });

      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        console.log(link);

        // send email....

        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Password reset link",
          html: `<a href = ${link}>click here </a>to reset your password`,
        });

        res.send({
          status: "success",
          message: "password reset email sent... please check your email",
          info: info,
        });
      } else {
        res.send({ status: "failed", message: "email does not exist" });
      }
    } else {
      res.send({ status: "failed", message: "email field are required" });
    }
  };

  ///reset password function
  static userPasswordReset = async (req, res) => {
    const { password, password_conf } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_conf) {
        if (password !== password_conf) {
          res.send({
            status: "failed",
            message: "password and conf_password not matched",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: newHashPassword },
          });
          res.send({
            status: "success",
            message: "password change successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All field are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "invalid Token" });
    }
  };
}

export default UserController;
