import banksRouter from './routes/banksRouter';
import authRouter from './routes/authRouter';
import express from 'express';
import bodyParser from 'body-parser';
const PORT = 3001;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/auth', authRouter);
app.use('/banks', banksRouter);
export default app;

app.listen(PORT, () => { console.log(`Server is running on PORT: ${PORT}`) });