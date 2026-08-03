import { Types } from 'mongoose';
import { Audit } from './audit.model';
import { ProjectRepository } from '../project/project.repository';
import { FeatureFlagRepository } from '../feature-flag/feature-flag.repository';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';
import { NotFoundError } from '../errors/NotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { serializeDocs } from '../utils/serialize';

export class AuditService {
  private projectRepository = new ProjectRepository();
  private featureFlagRepository = new FeatureFlagRepository();
  private organizationMemberRepository = new OrganizationMemberRepository();

  async getProjectAuditLogs(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Auth check
    const isMember = await this.organizationMemberRepository.isMember(
      project.organizationId.toString(),
      userId
    );
    if (!isMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const flags = await this.featureFlagRepository.findByProject(projectId);
    const flagIds = flags.map((f) => f._id);

    const logs = await Audit.find({
      $or: [
        { entity: 'Project', entityId: new Types.ObjectId(projectId) },
        { entity: 'FeatureFlag', entityId: { $in: flagIds } },
      ],
    })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    return serializeDocs(logs);
  }
}
