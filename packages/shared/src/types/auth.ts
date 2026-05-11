export interface LoginResponse {
  access_token: string;
  role: string;
  userId: number;
  email: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  vcaaStudentNumber?: string;
  yearLevel?: string;
}

export interface CompleteProfilePayload {
  yearLevel: string;
  vcaaStudentNumber?: string;
}
