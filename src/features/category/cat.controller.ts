import * as categoryService from '../category/cat.service';
import { NextFunction, Request, Response } from 'express';

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  const category = await categoryService.createCategory({ name });
  res.status(201).json(category);
};

export const getAllCategories = async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
};

export const getCategoryById = async (req: Request, res: Response):Promise<void> => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.json(category);
};

// export const updateCategory = async (req: Request, res: Response) => {
//   const category = await categoryService.updateCategory(req.params.id, req.body);
//   res.json(category);
// };


export const updateCategory = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const { id } = req.params;
  const data = { name: req.body.name };

  try {
    const cat = await categoryService.updateCategory(id, data);
     res.status(200).json(cat);
     return;
  } catch (err: any) {
    if (err.statusCode === 409) {
       res.status(409).json({ error: err.message });
       return
    }
    next(err);
  }
};



export const deleteCategory = async (req: Request, res: Response, next: NextFunction) :Promise<void> => {
  const { id } = req.params;

  try {
    const deletedCat = await categoryService.deleteCategory(id);
     res.status(200).json({
      message: 'Tag deleted successfully'
    });
    return;
  } catch (error) {
    next(error); 
  }
};