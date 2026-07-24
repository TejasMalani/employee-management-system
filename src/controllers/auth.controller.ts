import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import * as authService from '@services/auth.service';

export const signupHandler = asyncHandler(async (req: Request, res: Response) => {
  const employee = await authService.signup(req.body);
  res.status(201).json({ success: true, data: employee });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, employee } = await authService.login(email, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ success: true, data: { accessToken, employee } });
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) await authService.logout(refreshToken);
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out' });
});
