import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { addCourseWord } from './controllers/adminController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);

// Add the course-words endpoint
app.post('/api/admin/course-words', addCourseWord);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});