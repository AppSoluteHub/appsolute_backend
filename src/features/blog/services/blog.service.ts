import { PrismaClient } from "@prisma/client";
import { UpdatePostData } from "../../../interfaces/post.interface";

import {
  AppError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnAuthorizedError,
} from "../../../lib/appError";

const prisma = new PrismaClient();

export interface PostData {
  title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  tags: string[];
  contributors: string[]; 
  isPublished: boolean;
}

function normalizeToArray(input?: string | string[]): string[] {
  if (!input) return [];

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return input.split(",").map((item) => item.trim());
    }
  }

  return input;
}

class PostService {
 

  static async createPost(
    userId: string,
    editorRole: string,
    postData: PostData
  ) {
    const {
      title,
      description,
      imageUrl,
      categories,
      tags,
      contributors: contributorEmails,
      isPublished,
    } = postData;

    if (!title || !description) {
      throw new BadRequestError("Title and description are required");
    }

    const existingUsers = contributorEmails.length
      ? await prisma.user.findMany({
          where: { email: { in: contributorEmails } },
        })
      : [];

    const foundEmails = existingUsers.map((u) => u.email);
    const missing = contributorEmails.filter((e) => !foundEmails.includes(e));
    if (missing.length) {
      throw new BadRequestError(
        `Contributor(s) not found , Register the contributor in appsolute and try again: ${missing.join(", ")}`
      );
    }

    const contributorNames = existingUsers.map((u) => u.fullName);

    const post = await prisma.post.create({
      data: {
        title,
        description,
        imageUrl,
        isPublished,
        authorId: userId,
        editorRole,

        contributors: contributorNames,

        contributorsList: {
          create: existingUsers.map((u) => ({ userId: u.id })),
        },

        tags: {
          create: tags.map((t) => ({
            tag: {
              connectOrCreate: {
                where: { name: t },
                create: { name: t },
              },
            },
          })),
        },

        categories: {
          create: categories.map((c) => ({
            category: {
              connectOrCreate: {
                where: { name: c },
                create: { name: c },
              },
            },
          })),
        },
      },

      include: {
        contributorsList: { include: { user: true } },
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    });

    return post;
  }

  static async getAllPosts(publishedOnly: boolean = true) {
    try {
      return await prisma.post.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) throw error;
      throw new InternalServerError("Unable to fetch posts");
    }
  }

  static async getPostById(postId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: { id: true, fullName: true, email: true },
          },
          comments: {
            include: {
              author: {
                select: { id: true, fullName: true, profileImage: true },
              },
            },
          },
          likes: {
            include: {
              user: { select: { id: true, fullName: true, email: true } },
            },
          },
        },
      });

      if (!post) throw new NotFoundError("Post not found");

      return post;
    } catch (error) {
      console.error("Error fetching post:", error);
      if (error instanceof AppError) throw error;
      throw new InternalServerError("Unable to fetch post");
    }
  }

  static async updatePost(
    postId: string,
    userId: string,
    updateData: {
      title?: string;
      description?: string;
      imageUrl?: string;
      isPublished?: boolean;
      tags?: string[] | string;
      categories?: string[] | string;
      contributors?: string[] | string;
    }
  ) {
    // 1) normalize inputs (as before)
    const tags = normalizeToArray(updateData.tags);
    const categories = normalizeToArray(updateData.categories);
    const contributors = normalizeToArray(updateData.contributors);

    // 2) fetch & auth
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post not found");
    if (post.authorId !== userId) throw new UnAuthorizedError("Not authorized");

    // 3) minimal transaction: update & clear joins
    await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          title: updateData.title,
          description: updateData.description,
          imageUrl: updateData.imageUrl,
          isPublished: updateData.isPublished,
        },
      }),
      prisma.postTag.deleteMany({ where: { postId } }),
      prisma.postCategoryLink.deleteMany({ where: { postId } }),
      prisma.contributor.deleteMany({ where: { postId } }),
    ]);

    // 4) outside transaction: re-create tags
    for (const name of tags) {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await prisma.postTag.create({ data: { postId, tagId: tag.id } });
    }

    // 5) re-create categories
    for (const name of categories) {
      const cat = await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await prisma.postCategoryLink.create({
        data: { postId, categoryId: cat.id },
      });
    }

    // 6) re-create contributors
    for (const uid of contributors) {
      await prisma.contributor.create({ data: { postId, userId: uid } });
    }

    // 7) return the fully updated post
    return prisma.post.findUnique({
      where: { id: postId },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        contributorsList: { include: { user: true } },
      },
    });
  }

  static async deletePost(postId: string, userId: string) {
    try {
      // 1) Fetch post & user
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });
      if (!post) throw new NotFoundError("Post not found");

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user) throw new NotFoundError("User not found");

      // 2) Authorization check
      if (user.role !== "ADMIN" && post.authorId !== userId) {
        throw new ForbiddenError("Not authorized to delete this post");
      }

      // 3) Cascade‐style cleanup in a single transaction
      await prisma.$transaction([
        // remove comments & likes
        prisma.comment.deleteMany({ where: { postId } }),
        prisma.like.deleteMany({ where: { postId } }),
        // remove contributors join‐rows
        prisma.contributor.deleteMany({ where: { postId } }),
        // remove tags join‐rows
        prisma.postTag.deleteMany({ where: { postId } }),
        // remove categories join‐rows
        prisma.postCategoryLink.deleteMany({ where: { postId } }),
        // finally delete the post
        prisma.post.delete({ where: { id: postId } }),
      ]);

      return { message: "Post deleted successfully" };
    } catch (err: any) {
      console.error("Error deleting post:", err);
      if (err instanceof NotFoundError || err instanceof ForbiddenError)
        throw err;
      throw new InternalServerError("Unable to delete post");
    }
  }
}

export default PostService;
