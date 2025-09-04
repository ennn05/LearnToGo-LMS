// import express from 'express';
// import dotenv from 'dotenv';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import cors from 'cors';
// import { fileURLToPath } from 'url'; 
// import path from 'path';
// import open from 'open';
// import { sql } from "./db.js";
// import authRoutes from "./routes/authRoutes.js";


// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors({origin: "http://localhost:5173", }));
// app.use(helmet());
// app.use(morgan('dev'));
// app.use(express.json());
// app.use(express.static("public"));

// app.use("/api/auth", authRoutes)
// async function initDB() {
//   try{
//     await sql`
//       CREATE TABLE IF NOT EXISTS instructors (
//         instructor_id VARCHAR(50) NOT NULL,
//         instructor_name VARCHAR(50) NOT NULL,
//         instructor_email VARCHAR(50) NOT NULL
//         instructor_password VARCHAR(50) NOT NULL
//       )
//     `
//   } catch (error){
//     console.log("ERROR IN DB", error);
//   }
// }

// // app.use(express.static(path.join(__dirname, "../frontend/public")));

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// // initDB().then(()=> {
// //     app.listen(PORT, () => {
// //     console.log(`Server is running on port ${PORT}`);
// //     open(`http://localhost:${PORT}`);
// //   });
// // })

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { sql } from "./db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use("/api/auth", authRoutes);

async function testDB() {
  try {
    // await sql`SET search_path TO "LMS"`;
    const result = await sql`SELECT * FROM "LMS".instructor;`;
    console.log("✅ Database connection successful:", result);
    console.log(result[0].instructor_name);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

testDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});