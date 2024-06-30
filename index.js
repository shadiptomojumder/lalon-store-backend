import 'dotenv/config'
import { app } from "./src/app.js";
import connectDB from "./src/db/database.js";


try {
  connectDB()
    .then(() => {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at PORT : ${process.env.PORT}`);
      });
      app.on("error", (error) => {
        console.log("Error in App", error);
        throw error;
      });
    })
    .catch((error) => {
      console.log("MONGODB CONNECTION ERROR !!", error);
    });
} catch (error) {
  console.log("Error in index.js", error);
}
