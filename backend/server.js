import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { fileURLToPath } from 'url'; 
import path from 'path';
import open from 'open';
import { sql } from "./config/db.js";
import routes from './routes/index.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static("public"));
app.use(cors({
  origin: "http://localhost:5174", 
}));

app.use("/api", routes)
async function initDB() {
  try{
    await sql`
      CREATE TABLE IF NOT EXISTS instructors (
        instructor_id VARCHAR(50) NOT NULL,
        instructor_fname VARCHAR(50) NOT NULL,
        instructor_lname VARCHAR(50) NOT NULL,
        instructor_email VARCHAR(50) NOT NULL
      )
    `
  } catch (error){
    console.log("ERROR IN DB", error);
  }
}

// app.use(express.static(path.join(__dirname, "../frontend/public")));

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   open(`http://localhost:${PORT}`);
// });

initDB().then(()=> {
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
  });
})