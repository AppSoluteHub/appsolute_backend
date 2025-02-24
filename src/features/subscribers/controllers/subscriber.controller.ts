import { Request, Response } from "express";
import SubscriberService from "../services/subscriber.service";

export default class SubscriberController {
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const message = await SubscriberService.subscribe(email);
       res.status(201).json({ message });
    } catch (error: any) {
       res.status(400).json({ message: error.message });
    }
  }
}
