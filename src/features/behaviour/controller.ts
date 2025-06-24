import { Request, Response, NextFunction } from 'express';
import { BehaviorService } from './service';
import { BadRequestError } from '../../lib/appError';

export class BehaviorController {
  private behaviorService: BehaviorService;

  constructor() {
    this.behaviorService = new BehaviorService();
  }

  async trackHomepageView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string  
      const { device } = req.body; 

      if (!device) {
        throw new BadRequestError('Device type is required');
      }

      await this.behaviorService.logHomepageView(userId, device);

      res.status(200).json({
        success: true,
        message: 'Homepage view tracked successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}