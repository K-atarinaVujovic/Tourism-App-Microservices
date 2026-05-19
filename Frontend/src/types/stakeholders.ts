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

export interface CreateProfile{
  name: string;
  lastname: string | null;
  imageUrl: string | null;
  biography: string | null;
  quote: string | null;
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