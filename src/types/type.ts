export type Role = 'ADMIN' | 'GUEST';


export type PostCategory = 'AI' | 'TECHNOLOGY' | 'MARKETING' | 'DESIGN' | 'SOFTWARE';


export interface JwtPayload {
  id: string;
  role: Role;
}

