import { configDotenv } from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";


configDotenv({
    path: './.env'
});

connectDb()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on Port :${process.env.PORT}`)
    })   
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})