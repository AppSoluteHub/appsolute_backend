import * as tagService from '../tags/tag.service';
import { NextFunction, Request, Response } from 'express';

// export const createTagController = async (req: Request, res: Response):Promise<void> => {
//   try {
//     const { name } = req.body;
//   console.log(name)
//     if (!name || typeof name !== 'string') {
//        res.status(400).json({ message: 'Invalid or missing tag name' });
//         return;
//     }

//     const tag = await tagService.createTag({ name });

//      res.status(201).json({ message: 'Tag created successfully', tag });
//      return;
//   } catch (error) {
//     console.error('Error creating tag:', error);
//      res.status(500).json({ message: `Internal server error ${error}` });
//       return;
//   }
// };
export const createTagController = async (req:Request, res :Response):Promise<void> => {
  const { name } = req.body;
  const result = await tagService.createTag({ name });

  if (!result.success) {
     res.status(400).json({ error: result.message });
     return;
  }

   res.status(201).json(result.tag);
   return;
}
export const getAllTags = async (_req: Request, res: Response) => {
  const tags = await tagService.getAllTags();
  res.json(tags);
};

export const getTagById = async (req: Request, res: Response):Promise<void> => {
  const tag = await tagService.getTagById(req.params.id);
  if (!tag){
    res.status(404).json({ message: 'Tag not found' });
    return;
  }  
  res.json(tag);
};

// export const updateTag = async (req: Request, res: Response) => {
//   const tag = await tagService.updateTag(req.params.id, req.body);
//   res.json(tag);
// };


export const updateTagHandler = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const { id } = req.params;
  const data = { name: req.body.name };

  try {
    const tag = await tagService.updateTag(id, data);
     res.status(200).json(tag);
     return;
  } catch (err: any) {
    if (err.statusCode === 409) {
       res.status(409).json({ error: err.message });
       return
    }
    next(err);
  }
};
export const deleteTagController = async (req: Request, res: Response, next: NextFunction) :Promise<void> => {
  const { id } = req.params;

  try {
    const deletedTag = await tagService.deleteTag(id);
     res.status(200).json({
      message: 'Tag deleted successfully'
    });
    return;
  } catch (error) {
    next(error); 
  }
};
