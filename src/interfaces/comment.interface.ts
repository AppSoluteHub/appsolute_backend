export interface CreateCommentDto {
    body: string;
    postId: string;
    authorId: string;
  }
  
  export interface UpdateCommentDto {
    body?: string;
  }
  
  export interface Comment {
    id: string;
    body: string;
    postId: string;
    authorId: string;
    createdAt: Date;
  }
  