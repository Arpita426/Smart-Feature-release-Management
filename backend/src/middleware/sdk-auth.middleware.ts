import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { SDKKeyRepository } from '../sdk-key/sdk-key.repository';
import { SDKKeyStatus } from '../sdk-key/sdk-key.model';
import { EnvironmentRepository } from '../environment/environment.repository';

const sdkKeyRepository = new SDKKeyRepository();
const environmentRepository = new EnvironmentRepository();

export async function sdkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      res.status(401).json({
        success: false,
        message: 'SDK key is required',
      });
      return;
    }

    const rawKey = authHeader.substring(7).trim();
    if (!rawKey) {
      res.status(401).json({
        success: false,
        message: 'SDK key is required',
      });
      return;
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const sdkKey = await sdkKeyRepository.findByHash(keyHash);

    if (!sdkKey) {
      res.status(401).json({
        success: false,
        message: 'Invalid SDK key',
      });
      return;
    }

    if (sdkKey.status !== SDKKeyStatus.ACTIVE) {
      res.status(401).json({
        success: false,
        message: 'SDK key has been revoked',
      });
      return;
    }

    if (sdkKey.expiresAt && new Date(sdkKey.expiresAt).getTime() < Date.now()) {
      res.status(401).json({
        success: false,
        message: 'SDK key has expired',
      });
      return;
    }

    const environment = await environmentRepository.findById(sdkKey.environmentId.toString());
    if (!environment) {
      res.status(401).json({
        success: false,
        message: 'Associated environment no longer exists',
      });
      return;
    }

    req.sdkContext = {
      projectId: sdkKey.projectId.toString(),
      environmentId: sdkKey.environmentId.toString(),
      keyId: sdkKey._id.toString(),
      keyPrefix: sdkKey.keyPrefix,
    };

    // Update lastUsedAt asynchronously
    sdkKeyRepository.updateLastUsed(sdkKey._id.toString()).catch(() => {});

    next();
  } catch (error) {
    next(error);
  }
}
