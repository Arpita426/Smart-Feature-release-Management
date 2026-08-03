import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.validation';


export class AuthController {
  private authService = new AuthService();

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = registerSchema.parse(req.body);

      const result = await this.authService.register(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await this.authService.login(data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

profile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await this.authService.getProfile(req.user!.userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

  lookup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const email = req.query.email as string | undefined;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'email query parameter is required',
        });
        return;
      }

      const result = await this.authService.lookupUserByEmail(email);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}