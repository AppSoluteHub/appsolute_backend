


export interface PostData {
   title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  tags: string[];
  contributors: string[]; // array of userIds
  isPublished: boolean;
}
export interface PostAdminData {
  title: string;
  imageUrl: string;
  description: string;
  category?: string[];
  isPublished?: boolean;
  contributors?: string;
}


export interface UpdatePostData {
  title?: string;
  description?: string;
  imageUrl?: string;
  isPublished?: boolean;
  categories?: string[];    // names
  tags?: string[];          // names
  contributors?: string[];  // emails
}
