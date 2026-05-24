import express, { Express } from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from 'cors';
import http from 'http';
const path = require('path');

dotenv.config();

const app: Express = express();

declare module 'express-session' {
  interface Session {
    userDetails?: { userName: string, email: string, password: string };
    otp?: string;
    otpGeneratedTime?: number;
    email?: string;
  }
}

app.use(cors({
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static(path.join(__dirname, 'Adhaar-Backend', 'dist', 'src', 'public', 'uploads')));

const sessionSecret = process.env.SESSION_SECRET || 'default_secret_key';

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Create HTTP server
const server = http.createServer(app);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
