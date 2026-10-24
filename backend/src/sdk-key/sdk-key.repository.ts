import { ISDKKey, SDKKey, SDKKeyStatus } from './sdk-key.model';

export class SDKKeyRepository {
  async create(data: Partial<ISDKKey>): Promise<ISDKKey> {
    const sdkKey = new SDKKey(data);
    return await sdkKey.save();
  }

  async findByHash(keyHash: string): Promise<ISDKKey | null> {
    return await SDKKey.findOne({ keyHash });
  }

  async findByProjectAndEnvironment(
    projectId: string,
    environmentId: string
  ): Promise<ISDKKey[]> {
    return await SDKKey.find({ projectId, environmentId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<ISDKKey | null> {
    return await SDKKey.findById(id);
  }

  async updateStatus(id: string, status: SDKKeyStatus): Promise<ISDKKey | null> {
    return await SDKKey.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async updateLastUsed(id: string): Promise<ISDKKey | null> {
    return await SDKKey.findByIdAndUpdate(
      id,
      { lastUsedAt: new Date() },
      { new: true }
    );
  }
}
