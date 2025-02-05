import express, { Request, Response, Router } from "express";
import { UserModel } from "../db/db";
import bcrypt from "bcrypt";
import mongoose, { Mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import { validateUserCred } from "../utils/userValidation";
require("dotenv").config();
import cors from "cors";

export const authRouter: Router = Router();

authRouter.post(
  "/signup",
  validateUserCred,
  async (req: Request, res: Response) => {
    const { username, password } = req.body;
    console.log("Request received at home route 'signup' ", req.body);

    try {
      const existingUser = await UserModel.findOne({ username: username });

      if (existingUser) {
        res.status(400).json({
          message: "User already exists",
        });
        return;
      }

      const genSalt = await bcrypt.genSalt();
      const hashPass = await bcrypt.hash(password, genSalt);

      await UserModel.create({ username: username, password: hashPass });

      res.status(201).json({
        message: "User successfully signed up!",
      });
    } catch (e) {
      console.log("Error while signing up!");
      res.status(500).json({
        meassage: "Error while creating user!",
      });
    }
  }
);

authRouter.post(
  "/signin",
  validateUserCred,
  async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      //Check for existing user
      const existingUser = await UserModel.findOne({ username: username });

      if (!existingUser) {
        res.status(404).json({
          message: "User not found!",
        });
        return;
      }

      //Password hash compairsion.
      const compairedPassword = await bcrypt.compare(
        password,
        existingUser!.password
      );

      if (!compairedPassword) {
        res.status(401).json({
          message: "Invalid Credentials!",
        });
        return;
      }

      //JWT creation and sent
      const jwt = generateJWT(existingUser!._id);

      res.status(200).json({
        token: jwt,
      });
    } catch (e: any) {
      res.status(500).json({
        message: "Signin error!",
      });
      console.log(e.message);
    }
  }
);

function generateJWT(_id: mongoose.Types.ObjectId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }

  const jwtToken = jwt.sign(
    {
      id: _id,
    },
    secret
  );

  return jwtToken;
}
