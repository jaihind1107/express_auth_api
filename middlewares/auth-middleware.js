import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

//authintcate user middleware....
var checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      // verify token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      //get User from Token
      req.user = await UserModel.findById(userID).select("-password");
      next();
    } catch (error) {
      //   console.log(error);
      res.status(401).send({ status: "failed", message: "Unauthorized User" });
    }
  } else {
    res.send({ status: "failed", message: "Unauthorized User 34" });
  }
};

export default checkUserAuth;
