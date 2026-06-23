import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { prisma } from "./databse/client";

const PORT = process.env.PORT || 3000;
async function main() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  }
}

main();
