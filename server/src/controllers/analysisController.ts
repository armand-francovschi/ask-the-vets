// src/controllers/analysisController.ts
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { readJSON } from "../utils/readJSON.js";
import { writeJSON } from "../utils/writeJSON.js";
import { fileURLToPath } from "url";

// ---- Setup ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");
const analysisPath = path.join(__dirname, "..", "data", "analysis.json");

// Ensure directories and files exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(analysisPath)) writeJSON(analysisPath, []);

// ---- Types ----
export interface AnalysisFile {
  petId: number;
  filename: string;
  reviewed: boolean;
  feedback: string | null;
  comments: string[];
}

// ---- Helpers ----
const readAnalysisData = (): AnalysisFile[] => {
  const data = readJSON<unknown>(analysisPath);
  if (!Array.isArray(data)) return [];

  // Flatten nested arrays if they exist and cast safely
  return data.flatMap(item => (Array.isArray(item) ? item : [item])) as AnalysisFile[];
};

const writeAnalysisData = (data: AnalysisFile[]) => {
  writeJSON(analysisPath, data);
};

// ---- Controllers ----

// Upload a single analysis file
export const uploadAnalysisFile = (req: Request, res: Response) => {
  const petId = parseInt(req.params.petId ?? "", 10);
  if (!req.file?.filename) return res.status(400).json({ message: "No file uploaded" });

  const analysisData = readAnalysisData();
  const newFile: AnalysisFile = {
    petId,
    filename: req.file.filename,
    reviewed: false,
    feedback: null,
    comments: [],
  };
  analysisData.push(newFile);
  writeAnalysisData(analysisData);

  res.status(201).json(newFile);
};


// Get all analysis files for a pet
export const getAnalysisFiles = (req: Request, res: Response) => {
  const petId = parseInt(req.params.petId ?? "", 10);
  const analysisData = readAnalysisData();

  const petFiles = analysisData.filter(f => f.petId === petId);
  res.json(petFiles);
};

// Download a single file
export const downloadAnalysisFile = (req: Request, res: Response) => {
  const filename = req.params.filename;
  if (!filename) return res.status(400).send("Filename is required");

  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

  res.download(filePath);
};

// Add a comment to a file
export const addComment = (req: Request, res: Response) => {
  const { petId, filename, comment } = req.body;
  if (!petId || !filename || !comment) return res.status(400).json({ error: "Missing data" });

  const analysisData = readAnalysisData();
  const file = analysisData.find(f => f.petId === petId && f.filename === filename);
  if (!file) return res.status(404).json({ error: "File not found" });

  file.comments.push(comment);
  writeAnalysisData(analysisData);

  res.json({ success: true });
};

// Add medic feedback
export const addFeedback = (req: Request, res: Response) => {
  const { petId, filename, feedback } = req.body;
  if (!petId || !filename || !feedback) return res.status(400).json({ error: "Missing data" });

  const analysisData = readAnalysisData();
  const file = analysisData.find(f => f.petId === petId && f.filename === filename);
  if (!file) return res.status(404).json({ error: "File not found" });

  file.reviewed = true;
  file.feedback = feedback;
  writeAnalysisData(analysisData);

  res.json({ success: true });
};
