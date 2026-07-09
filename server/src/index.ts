import "dotenv/config";
import prisma from "./config/database";
import connectMongoDB from "./config/mongodb";
import app from "./app";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
  }

  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
