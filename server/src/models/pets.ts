export interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  image?: string;
  medicalFiles: string[];
}

export interface MedicalFile {
  filename: string;
  reviewed: boolean;
  feedback: string | null;
  comments: string[];
}