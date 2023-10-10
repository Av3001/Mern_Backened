import dotenv from "dotenv"
import express from "express";
import cors from "cors"
import connectDB from "./config/connectDB.js"

const app=express()
dotenv.config()
app.use(cors())
const DATABASE_URL=process.env.DATABASE_URL
const port=process.env.PORT

//Database Connection
connectDB(DATABASE_URL)

//JSON
app.use(express.json())


app.listen(port,()=>{
    console.log(`Server Listening at http://localhost:${port}`);
})