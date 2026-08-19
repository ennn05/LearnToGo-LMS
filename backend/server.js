import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import routes from './routes/index.js';

dotenv.config();
const app = express();
const PORT = 5000;

// Middleware
app.use(helmet());
app.use(cors()); // React dev server
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use("/api", routes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
