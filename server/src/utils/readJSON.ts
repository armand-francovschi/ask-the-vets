import fs from "fs";

export const readJSON = <T>(filePath: string): T[] => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

