export interface Blog {
  id: number;
  authorId: number;
  title: string;
  description: string;
  createdAt: string;
  imageUrls: string[];
  likeCount: number;
}

export interface CreateBlog {
  authorId: number;
  title: string;
  description: string;
  imageUrls: string[];
}

export interface Comment {
  id: number;
  blogId: number;
  authorId: number;
  authorUsername: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComment {
  authorId: number;
  authorUsername: string;
  text: string;
}

export interface UpdateComment {
  text: string;
}