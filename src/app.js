import 'dotenv/config'
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import passport from "passport";
import "./utils/google-strategy.js"


const app = express();

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGIN1,
  process.env.CORS_ORIGIN2
];

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
      // if (allowedOrigins.includes(origin) || !origin) {
      //   callback(null, true);
      // } else {
      //   callback(new Error("Not allowed by CORS"));
      // }
    },
    methods: "GET, POST, DELETE , PATCH , PUT",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());

// All Routes Imports
import userRouter from "./routes/user.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import authenticationRouter from "./routes/authentication.routes.js"

// Route Declaration
app.use("/api/users", userRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);

// Authentication Routes
app.use("/api/auth", authenticationRouter);

// Google Auth
// app.get('/api/auth/google',
//   passport.authenticate('google', { scope: ['profile'], session: false }));

// app.get('/api/auth/google/callback', 
//   passport.authenticate('google', { session: false, failureRedirect: `${process.env.FORNTEND_HOST}/login` }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });


app.get("/", (req, res) => {
  res.send("Welcome to Lalon store");
});

export { app };

