export interface Pet {
  id?: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  image?: string;
  medicalFiles?: string[];
}

export interface User {
  id: number;
  name: string;
  role: "user" | "doctor";
  image?: string;
  pets?: number[];
}
