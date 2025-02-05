import express, { Response, Request } from "express";
import mongoose from "mongoose";
import { CONNECTION_STRING, ContentModel, LinkModel, UserModel } from "./db/db";
import { authRouter } from "./auth/Authorization";
import { userAuthVerify } from "./middlewares/auth";
import { hashGenerator } from "./utils/hash";
require("dotenv").config();
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());



app.use("/api/v1/auth", authRouter);

function dbConnect() {
  try {
    mongoose.connect(CONNECTION_STRING);
    console.log("Connected to db!");
  } catch (e: any) {
    console.log(e.message);
  }
}

//Content endpoints

app.get(
  "/api/v1/content",
  userAuthVerify,
  async (req: Request, res: Response) => {
    const content = await ContentModel.find({
      userId: req.id,
    }).populate("userId", "username");

    res.status(200).json({
      content,
    });
  }
);

app.post(
  "/api/v1/content",
  userAuthVerify,
  async (req: Request, res: Response) => {
    const { link, type, title, tags } = req.body;
    const userId = req.id;

    await ContentModel.create({
      link,
      type,
      title,
      tags: [],
      userId,
    });

    res.status(201).json({
      message: "Content created!",
    });
  }
);

app.put(
  "/api/v1/content/:id",
  userAuthVerify,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const { link, type, title, tags } = req.body;
    const userId = req.id;

    try {
      const updateResult = await ContentModel.updateOne(
        {
          _id: id,
          userId: userId,
        },
        {
          $set: {
            link,
            type,
            title,
            tags,
          },
        }
      );

      if (updateResult.modifiedCount === 0) {
        res
          .status(404)
          .json({ message: "Content not found or not authorized to update" });

        return;
      }

      res.status(200).json({ message: "Content updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while updating the content" });
    }
  }
);

app.delete(
  "/api/v1/posts",
  userAuthVerify,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.id;

    try {
      const deleteCount = ContentModel.deleteOne({
        _id: id,
        userId: userId,
      });

      if ((await deleteCount).deletedCount === 0) {
        res
          .status(404)
          .json({ message: "Content not found or not authorized to delete" });
        return;
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while deleting the content" });
    }
  }
);

app.get(
  "/api/v1/brain/share",
  userAuthVerify,
  async (req: Request, res: Response) => {
    const userId = req.id;
    const share = req.body.share;

    if (share) {
      const userLink = await LinkModel.findOne({
        userId: userId,
      });

      if (userLink) {
        res.json({
          hash: userLink.hash,
        });
        return;
      }

      const linkHash = hashGenerator(10);

      await LinkModel.create({
        hash: linkHash,
        userId: userId,
      });

      res.json({
        linkHash,
      });
    } else {
      await LinkModel.deleteOne({
        userId: userId,
      });

      res.json({
        message: "Removed link",
      });
    }
  }
);

app.get("/api/v1/brain/share/:share", async (req: Request, res: Response) => {
  const hash =  req.params.share;
  const link =await LinkModel.findOne({
    hash: hash
  })

  if(!link){
    res.json({
      message: "Sorry incorrect input!"
    }).status(411)
    return;
  }
  //Getting all the content
  const data = await ContentModel.find({
    userId: link?.userId,
  })


  //User info to send
  const userInfo = await UserModel.findOne({
    _id: link.userId,
  })


  res.json({
    username: userInfo?.username,
    content: data,
  })

});



const PORT = process.env.APP_PORT || 3000;
dbConnect();
app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
