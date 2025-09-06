import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

const SALT_ROUNDS = 10;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || "ecommerce");
    console.log("Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordPlain = process.env.ADMIN_PASSWORD;

    const existingAdmin = await db.collection("users").findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash(adminPasswordPlain, SALT_ROUNDS);
      await db.collection("users").insertOne({
        email: adminEmail,
        password: adminPassword,
        name: "Admin User",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Admin user created: ${adminEmail}`);
    }

    const products = await db.collection("products").countDocuments();
    if (products === 0) {
      await db.collection("products").insertMany([
        { name: "Laptop", price: 50000, description: "Powerful laptop", createdAt: new Date() },
        { name: "Phone", price: 20000, description: "Smartphone device", createdAt: new Date() },
      ]);
      console.log("Sample products inserted");
    }
  } catch (error) {
    console.error("Error connecting to DB:", error);
  }
}

connectToDatabase();
