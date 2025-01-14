import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, (req, res) => {
      console.log(`Server is listening on ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection fialed !!! ", err);
  });

app.on("error", (error) => {
  console.log("Error", error);
  throw error;
});


// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from 'express'

// const app = express()

// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error) => {
//             console.log("Error",error);
//             throw error
//         })

//         app.listen(process.env.PORT, () =>{
//             console.log(`app is listen on ${process.env.PORT}`)
//         })

//     } catch (error){
//         console.log("Error",error);
//         throw error
//     }
// })()
