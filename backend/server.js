import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import userStatisticsRoutes from './routes/userStatisticsRoutes.js'; 
import { sql } from './db.js'; // your database connection

dotenv.config();
const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // React dev server
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use("/api", routes);
app.use("/api/statistics", userStatisticsRoutes); 

// Test DB
// async function testDB() {
//   try {
//     const result = await sql`SELECT * FROM "LMS".user;`;
//     console.log("✅ Database connection successful:", result);
//   } catch (err) {
//     console.error("❌ Database connection failed:", err);
//   }
// }
// testDB();

async function testDB() {
  try {
    const result = await sql`SELECT * FROM "LMS".instructor;`;
    console.log("✅ Database connection successful:", result);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}
testDB();

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
