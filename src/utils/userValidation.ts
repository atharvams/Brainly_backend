import { Request, Response, NextFunction } from "express";

import z, { ParseStatus } from "zod";

export const userSchemaZod = z.object({
  username: z
    .string()
    .min(3, "Username should be at least 3 charactor long")
    .max(50),
  password: z.string().min(3, "Password should be at least 3 charactor long"),
});

export const validateUserCred = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userCredParse = userSchemaZod.safeParse(req.body);

  if (!userCredParse.success) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  } else {
    next();
  }
};
