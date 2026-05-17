export interface Profile {
  id: number;
  name: string;
  lastname: string;
  imageUrl: string;
  biography: string;
  quote: string;
  user_id: number;
  role: "author" | "tourist";
}

export interface UpdateProfile {
  name: string;
  lastname: string;
  imageUrl: string;
  biography: string;
  quote: string;
  user_id: number;
}