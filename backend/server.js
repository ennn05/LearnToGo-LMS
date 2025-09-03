import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { fileURLToPath } from 'url'; 
import path from 'path';
import open from 'open';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, "../frontend/public")));

// app.get('/', (req, res) => {
//   res.send('Hello from backend!');
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  open(`http://localhost:${PORT}`);
});
