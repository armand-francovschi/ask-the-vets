import express from "express";
import cors from "cors";
import path from "path";
import petsRoutes from "./routes/petsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import { fileURLToPath } from "url";
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/pets", petsRoutes);
app.use("/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
