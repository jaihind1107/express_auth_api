import express from "express";
import cors from "cors";
import connectDb from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// cors policy
app.use(cors());

//database connection...
connectDb(DATABASE_URL);

//json
app.use(express.json());

//load routes
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
