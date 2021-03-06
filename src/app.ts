import express from "express";
import bearerToken from "express-bearer-token";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";

import config from "./config";
import { httpLogStream, logger } from "./resources/logger";
import { serviceDocsRouter, serviceRouter } from "./services";
import { attachIdentity } from "./middlewares";

class App {
  public app: express.Application;
  constructor() {
    this.app = express();
    this.connectMongoDB(); // connect to mongoDB
    this.initializeMiddlewares(); // initialize middlewares
    this.initializeMorgan(); // initialize morgan
    this.initializeRouter(); // initialize router
  }
  private initializeRouter() {
    this.app.use("/", serviceRouter);
    this.app.use("/docs", serviceDocsRouter);
  }
  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(express.json()); // for parsing application/json
    this.app.use(
      bearerToken({
        headerKey: "Bearer",
        reqKey: "token",
      })
    );
    this.app.use(attachIdentity);
  }
  private connectMongoDB() {
    const { mongoURI } = config;
    const mongooseOptions: mongoose.ConnectOptions = {};
    mongoose.connect(mongoURI, mongooseOptions).then(() => {
      logger.info(`MongoDB connected`);
    });
  }
  private initializeMorgan() {
    const morganFormat = `HTTP/:http-version :method :remote-addr 
      :url :remote-user :status :res[content-length] 
      :referrer :user-agent :response-time ms`;

    this.app.use(morgan(morganFormat, { stream: httpLogStream }));
  }
}
export default App;
