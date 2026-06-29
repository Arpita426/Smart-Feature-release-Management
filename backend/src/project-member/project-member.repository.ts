import {
  ProjectMember,
  IProjectMember,
} from './project-member.model';

export class ProjectMemberRepository {
  async create(data: Partial<IProjectMember>) {
    return ProjectMember.create(data);
  }

  async findById(id: string) {
    return ProjectMember.findById(id);
  }

  async findMember(
    projectId: string,
    userId: string
  ) {
    return ProjectMember.findOne({
      projectId,
      userId,
    });
  }

  async findByProject(projectId: string) {
    return ProjectMember.find({
      projectId,
    })
      .populate('userId', 'fullName email avatarUrl')
      .sort({ createdAt: 1 });
  }

  async update(
    id: string,
    data: Partial<IProjectMember>
  ) {
    return ProjectMember.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
  }

  async delete(id: string) {
    return ProjectMember.findByIdAndDelete(id);
  }
}