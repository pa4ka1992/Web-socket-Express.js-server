import * as dotenv from "dotenv";
import expressWs from "express-ws";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./route/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const wsRouter = expressWs(app);

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL2],
  })
);
app.use(cookieParser());
app.use("/api", router);

app.ws("/game", function (ws, req) {
  console.log('connected');
  ws.on("message", function (msg) {
    ws.send(msg);
  });
});

const init = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DB_URL);

    app.listen(PORT, () => console.log(PORT));
  } catch (error) {
    console.log(error);
  }
};

init();
