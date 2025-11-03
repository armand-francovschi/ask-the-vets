import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const petsPath = path.join(__dirname, "data", "pets.json");
const usersPath = path.join(__dirname, "data", "users.json");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ---------------- Multer Setup ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------------- TypeScript Interfaces ----------------
interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  image?: string;
  medicalFiles: string[];
}

interface User {
  id: number;
  name: string;
  role: "user" | "doctor";
  pets?: number[]; // store pet IDs
}

// ---------------- Helper Functions ----------------
const readJSON = <T>(filePath: string): T[] => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

const writeJSON = <T>(filePath: string, data: T[]) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

// Upload profile image
app.post("/pets/:id/profile-image", upload.single("file"), (req, res) => {
  const petId = parseInt(req.params.id ?? "", 10);
  const pets = readJSON<Pet>(petsPath);
  const pet = pets.find(p => p.id === petId);
  if (!pet) return res.status(404).json({ message: "Pet not found" });

  // Remove old image file from server
  if (pet.image) {
    const oldPath = path.join(uploadsDir, pet.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  // Save new image
  if (!req.file?.filename) return res.status(400).json({ message: "No file uploaded" });
  pet.image = req.file.filename;

  writeJSON(petsPath, pets);
  res.json({ filename: req.file.filename });
});

// ---------------- Pet Endpoints ----------------
app.get("/pets", (req: Request, res: Response) => {
  const pets = readJSON<Pet>(petsPath).map(p => ({ ...p, medicalFiles: p.medicalFiles || [] }));
  res.json(pets);
});

// Upload pet profile image
app.post("/pets/:id/image", upload.single("image"), (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);
  const pets = readJSON<Pet>(petsPath);
  const pet = pets.find(p => p.id === petId);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  if (!req.file?.filename) return res.status(400).json({ message: "No file uploaded" });

  pet.image = req.file.filename; // save uploaded file as profile image
  writeJSON(petsPath, pets);

  res.json({ filename: req.file.filename });
});




// Add a new pet and assign to a user
app.post("/pets", (req: Request, res: Response) => {
  const pets = readJSON<Pet>(petsPath);
  const users = readJSON<User>(usersPath);

  const { name, type, breed, age, userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const newPet: Pet = {
    id: pets.length > 0 ? (pets.at(-1)?.id ?? 0) + 1 : 1,
    name,
    type,
    breed,
    age,
    medicalFiles: [],
  };

  pets.push(newPet);
  writeJSON(petsPath, pets);

  // Assign pet to user
  const user = users.find(u => u.id === userId);
  if (user) {
    user.pets = user.pets ?? [];
    user.pets.push(newPet.id);
    writeJSON(usersPath, users);
  }

  res.status(201).json(newPet);
});

app.put("/pets/:id", (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);
  const pets = readJSON<Pet>(petsPath);
  const users = readJSON<User>(usersPath);

  const index = pets.findIndex(p => p.id === petId);
  if (index === -1) return res.status(404).json({ error: "Pet not found" });

  // Update the pet
  pets[index] = { ...pets[index], ...req.body };
  writeJSON(petsPath, pets);

const updatedPet = pets[index];
if (updatedPet) {
  
  users.forEach(u => {
    if (u.pets) {
      u.pets = u.pets.map(pid => (pid === petId ? updatedPet.id : pid));
      
    }
    res.json(updatedPet);
writeJSON(usersPath, users); // Don't forget to save users if modified

  });
}
});

// Delete pet and remove from users.json
app.delete("/pets/:id", (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);

  let pets = readJSON<Pet>(petsPath);
  if (!pets.some(p => p.id === petId)) return res.status(404).json({ error: "Pet not found" });
  pets = pets.filter(p => p.id !== petId);
  writeJSON(petsPath, pets);

  // Remove pet from all users
  const users = readJSON<User>(usersPath);
  users.forEach(u => {
u.pets = (u.pets || []).filter(pid => pid !== petId);
  });
  writeJSON(usersPath, users);

  res.json({ success: true });
});

// Upload medical file
app.post("/pets/:id/medical-file", upload.single("file"), (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);
  const pets = readJSON<Pet>(petsPath);
  const pet = pets.find(p => p.id === petId);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  if (!req.file?.filename) return res.status(400).json({ message: "No file uploaded" });

  pet.medicalFiles.push(req.file.filename);
  writeJSON(petsPath, pets);

  res.json({ filename: req.file.filename });
});

// ---------------- User Endpoints ----------------
app.get("/users", (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  res.json(users);
});

app.get("/users/:id", (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  const userId = parseInt(req.params.id ?? "", 10);
  const user = users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.get("/users/:id/pets", (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  const pets = readJSON<Pet>(petsPath);
  const userId = parseInt(req.params.id ?? "", 10);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const userPets = pets.filter(p => (user.pets ?? []).includes(p.id));
  res.json(userPets);
});

// ---------------- Serve uploads ----------------
app.use("/uploads", express.static(uploadsDir));

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 

