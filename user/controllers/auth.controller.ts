import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validators/auth.schema";
import * as authService  from "../services/auth.service";

const registerController = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const user = await authService.register(data);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
};

const loginController = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const response = await authService.login(data);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: response,
  });
};

export { loginController, registerController };
