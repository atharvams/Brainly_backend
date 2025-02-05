import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
      export interface Request {
        id: string
      }
    }
  }



export const userAuthVerify = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jwtToken = req.headers["authorization"];
  console.log(jwtToken);

  if (jwtToken == null || process.env.JWT_SECRET == undefined) {
    res.status(500).json({
      message: "Auth server error!",
    });
    return;
  }

  const decodedUser = jwt.verify(jwtToken as string, process.env.JWT_SECRET!);
  console.log(decodedUser);

  if (decodedUser) {
    if (typeof decodedUser == "string") {
      res.status(403).json({
        message: "You are not logged in",
      });
      return;
    }
    req.id = decodedUser.id;
    next();
  } else {
    res.status(403).json({
      message: "You are not logged in",
    });
  }
};
