import { Request, Response, NextFunction } from 'express';
import { userBehaviorService } from './service';

const VALID_INTERACTIONS = ['VIEW', 'CLICK', 'LIKE', 'SHARE'];

export class UserBehaviorController {
  static async trackInteraction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || null;
      const { interaction, page } = req.body;

      if (!interaction || !VALID_INTERACTIONS.includes(interaction.toUpperCase())) {
         res.status(400).json({
          message: `Invalid or missing interaction. Must be one of: ${VALID_INTERACTIONS.join(', ')}`
          
        });
        return;
      }

      if (!page) {
         res.status(400).json({ message: 'Page is required' });
         return;
      }

      const device = req.headers['user-agent'] || 'unknown';

      const record = await userBehaviorService.trackInteraction(
        userId,
        interaction.toUpperCase(),
        page,
        device
      );

      res.status(201).json({
        success: true,
        message: `${interaction} recorded successfully`,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }
}
