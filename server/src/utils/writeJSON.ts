import fs from "fs";

export const writeJSON = <T>(filePath: string, data: T[]) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};