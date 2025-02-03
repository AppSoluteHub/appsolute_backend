
import { PostCategory } from "@prisma/client";

export interface PostData {
  title: string;
  imageUrl: string;
  description: string;
  category?: PostCategory;
  isPublished?: boolean;
  contributors?: string;
}

export interface UpdatePostData {
  title?: string;
  imageUrl?: string;
  description?: string;
  isPublished?: boolean;

}

