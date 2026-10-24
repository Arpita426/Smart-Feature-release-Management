export interface SDKContext {
  projectId: string;
  environmentId: string;
  keyId: string;
  keyPrefix: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      sdkContext?: SDKContext;
    }
  }
}

export {};