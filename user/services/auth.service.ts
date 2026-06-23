import { prisma } from "../databse/client";
import { AppError } from "../errors/app-error";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generate-token";
export const register = async (data: {
  email: string;
  name: string;
  password: string;
}) => {
  const { email, name, password } = data;
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(409, "User already exists", "DUPLICATE_RESOURCE");
  }

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const login = async (data: {
  email: string;
  password: string;
  deviceId: string;
  deviceToken: string;
  deviceType: string;
}) => {
  const { email, password, deviceId, deviceToken, deviceType } = data;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(403, "Account is inactive", "ACCOUNT_INACTIVE");
  }

  const isPasswordValid = await Bun.password.verify(
    password,
    user.password as string,
  );

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  const accessToken = generateAccessToken(user.id, user.email!);
  const refreshToken = generateRefreshToken(user.id, user.email!);

  if (!accessToken || !refreshToken) {
    throw new AppError(500, "Failed to generate token", "SERVER_ERROR");
  }

  await prisma.userDevice.upsert({
    where: {
      deviceId: deviceId,
    },
    update: {
      userId: user.id,
      deviceToken: deviceToken,
      lastSeenAt: new Date(),
    },
    create: {
      userId: user.id,
      deviceId,
      deviceToken,
      deviceType,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  };
};
