import mongoose, { Schema, model } from "mongoose";
import { userSchemaZod } from "../utils/userValidation";
require("dotenv").config();

export const CONNECTION_STRING = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.na1sa.mongodb.net/${process.env.DB_NAME}`;
import z, { ParseStatus } from "zod";

type user = z.infer<typeof userSchemaZod>;

const UserSchema: Schema<user> = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const TagSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
});

const ContentTypes = ["image", "twitter", "youtube", "link"];

const ContentSchema = new mongoose.Schema({
  link: { type: String, required: true },
  type: { type: String, enum: ContentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});

const LinkSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});

export const UserModel = model("User", UserSchema);
export const TagModel = model("Tag", TagSchema);
export const ContentModel = model("Content", ContentSchema);
export const LinkModel = model("Link", LinkSchema);
