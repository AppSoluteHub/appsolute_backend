import { Request, Response } from "express";
import ContentService from "../services/content.service";

class ContentController {

  async createContent(req: Request, res: Response) {
    try {
      const { body, description } = req.body;

      if (!body || !description) {
        return res.status(400).json({ success: false, message: "Body and description are required" });
      }

      const content = await ContentService.createContent(body, description);
      return res.status(201).json({ success: true, data: content });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getAllContent(req: Request, res: Response) {
    try {
      const contents = await ContentService.getAllContent();
      return res.status(200).json({ success: true, data: contents });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getContentById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "ID is required" });
      }

      const content = await ContentService.getContentById(id);
      return res.status(200).json({ success: true, data: content });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

 
  async updateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { body, description } = req.body;

      if (!id || !body || !description) {
        return res.status(400).json({ success: false, message: "ID, body, and description are required" });
      }

      const updatedContent = await ContentService.updateContent(id, body, description);
      return res.status(200).json({ success: true, data: updatedContent });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

 
  async deleteContent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "ID is required" });
      }

      const deletedContent = await ContentService.deleteContent(id);
      return res.status(200).json({ success: true, data: deletedContent });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}

export default new ContentController();
