import { Request, Response } from 'express';
import * as softwareService from '../services/software.service';
import  appResponse  from '../../../lib/appResponse';

export const createSoftware = async (req: Request, res: Response) => {
  try {
    const software = await softwareService.createSoftware(req.body);
    res.status(201).json(appResponse('Software created successfully', software));
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getAllSoftware = async (req: Request, res: Response) => {
  try {
    const { page, limit, category, search } = req.query;
    const options = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      category: category as string,
      search: search as string,
    };
    const software = await softwareService.getAllSoftware(options);
    res.status(200).json(appResponse('Software retrieved successfully', software));
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getSoftwareById = async (req: Request, res: Response) => {
  try {
    const software = await softwareService.getSoftwareById(req.params.id);
    res.status(200).json(appResponse('Software retrieved successfully', software));
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const updateSoftware = async (req: Request, res: Response) => {
  try {
    const software = await softwareService.updateSoftware(req.params.id, req.body);
    res.status(200).json(appResponse('Software updated successfully', software));
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const deleteSoftware = async (req: Request, res: Response) => {
  try {
    await softwareService.deleteSoftware(req.params.id);
    res.status(200).json(appResponse('Software deleted successfully', null));
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};