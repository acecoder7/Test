import dotenv from "dotenv";
import express from "express";
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';

import mongoose from "mongoose";
// import cors from "cors";
import session from "express-session";
import passport from "passport";
import userRouter from "./routes/user.js";
import User from "./models/User.js";
// import authRouter from "./routes/auth.js";
const LINKEDIN_KEY = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_SECRET = process.env.LINKEDIN_CLIENT_SECRET;


const app = express();
dotenv.config();

mongoose.set("strictQuery", false);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("MongoDB connected");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(session({ secret: "proces9987987979879CRET" }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/user", userRouter);
// app.use("/api/auth", authRouter);

passport.use(
  new LinkedInStrategy(
    {
      clientID: "7732s97h4k42u6",
      clientSecret: "qmHxwQaAmjFy6bn0",
      callbackURL: "http://localhost:3000/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        //console.log("Pro");
        let user = await User.findOne({ linkedinId: profile.id });

        if (user) {
          // Update existing user if necessary
          user.firstName = profile.name.givenName;
          user.lastName = profile.name.familyName;
          user.email = profile.emails[0].value;
          user.photo = profile.photos[0].value;
          user = await user.save();
        } else {
          // Create a new user
          user = new User({
            linkedinId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
          });
          user = await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
);

app.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", { state: "SOME STATE" })
);


app.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/", (req, res) => {
  if (req.user) {
    //console.log(req.user);
    const name = req.user.firstName;
    const family = req.user.lastName;
    const photo = req.user.photo;
    const email = req.user.email;
    res.send(
      `<center style="font-size:140%"> <p>User is Logged In </p>
      <p>Name: ${name} ${family} </p>
      <p> Linkedn Email: ${email} </p>
      <img src="${photo}"/>
      </center>
      `
    )
  } else {
    res.send(`<center style="font-size:160%"> <p>This is Home Page </p>
    <p>User is not Logged In</p>
    <img style="cursor:pointer;"  onclick="window.location='/auth/linkedIn'" src="http://www.bkpandey.com/wp-content/uploads/2017/09/linkedinlogin.png"/>
    </center>
    `);
  }
});


app.listen(process.env.PORT, () => {
  connect();
  console.log("Listening PORT...");
});