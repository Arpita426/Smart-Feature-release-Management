import { Environment, IEnvironment } from './environment.model';

export class EnvironmentRepository {
  async create(data: Partial<IEnvironment>) {
    return Environment.create(data);
  }

  async findById(id: string) {
    return Environment.findById(id);
  }

  async findByProject(projectId: string) {
    return Environment.find({ projectId }).sort({ order: 1, createdAt: 1 });
  }

  async findByProjectAndSlug(projectId: string, slug: string) {
    return Environment.findOne({ projectId, slug });
  }

  async findDefaultByProject(projectId: string) {
    return Environment.findOne({ projectId, isDefault: true });
  }

  async update(id: string, data: Partial<IEnvironment>) {
    return Environment.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return Environment.findByIdAndDelete(id);
  }
}
