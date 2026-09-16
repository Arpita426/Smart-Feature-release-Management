// import {
//   OrganizationInvitation,
//   IOrganizationInvitation,
// } from './organization-invitation.model';
// import { OrganizationInvitationStatus } from './organization-invitation-status';

// export class OrganizationInvitationRepository {
//   async create(
//     data: Partial<IOrganizationInvitation>
//   ) {
//     return OrganizationInvitation.create(data);
//   }

//   async findById(id: string) {
//     return OrganizationInvitation.findById(id);
//   }

//   async findPendingInvitation(
//     organizationId: string,
//     email: string
//   ) {
//     return OrganizationInvitation.findOne({
//       organizationId,
//       email: email.toLowerCase(),
//       status: OrganizationInvitationStatus.PENDING,
//     });
//   }

//   async findPendingByEmail(email: string) {
//     return OrganizationInvitation.find({
//       email: email.toLowerCase(),
//       status: OrganizationInvitationStatus.PENDING,
//     }).sort({
//       createdAt: -1,
//     });
//   }

//   async findByOrganization(
//     organizationId: string
//   ) {
//     return OrganizationInvitation.find({
//       organizationId,
//     })
//       .populate('invitedBy', 'name email')
//       .sort({
//         createdAt: -1,
//       });
//   }

//   async update(
//     id: string,
//     data: Partial<IOrganizationInvitation>
//   ) {
//     return OrganizationInvitation.findByIdAndUpdate(
//       id,
//       data,
//       {
//         new: true,
//       }
//     );
//   }
//   async findByEmail(email: string) {
//   return OrganizationInvitation.find({
//     email: email.toLowerCase(),
//   }).sort({
//     createdAt: -1,
//   });
// }
// // async findPendingInvitation(
// //   organizationId: string,
// //   email: string
// // ) {
// //   return OrganizationInvitation.findOne({
// //     organizationId,
// //     email: email.toLowerCase(),
// //     status: OrganizationInvitationStatus.PENDING,
// //   });
// // }
// }



// import {
//   OrganizationInvitation,
//   IOrganizationInvitation,
// } from './organization-invitation.model';

// import { OrganizationInvitationStatus } from './organization-invitation-status';
// import { InvitationScope } from './invitation-scope';

// export class OrganizationInvitationRepository {
//   async create(
//     data: Partial<IOrganizationInvitation>
//   ) {
//     return OrganizationInvitation.create(data);
//   }

//   async findById(id: string) {
//     return OrganizationInvitation.findById(id);
//   }

//   async findPendingInvitation(
//     organizationId: string,
//     scope: InvitationScope,
//     targetId: string,
//     email: string
//   ) {
//     return OrganizationInvitation.findOne({
//       organizationId,
//       scope,
//       targetId,
//       email: email.toLowerCase(),
//       status: OrganizationInvitationStatus.PENDING,
//     });
//   }

//   async findPendingByEmail(email: string) {
//     return OrganizationInvitation.find({
//       email: email.toLowerCase(),
//       status: OrganizationInvitationStatus.PENDING,
//     }).sort({
//       createdAt: -1,
//     });
//   }

//   async findByOrganization(
//     organizationId: string
//   ) {
//     return OrganizationInvitation.find({
//       organizationId,
//     })
//       .populate('invitedBy', 'name email')
//       .sort({
//         createdAt: -1,
//       });
//   }

//   async findByEmail(email: string) {
//     return OrganizationInvitation.find({
//       email: email.toLowerCase(),
//     }).sort({
//       createdAt: -1,
//     });
//   }

//   async update(
//     id: string,
//     data: Partial<IOrganizationInvitation>
//   ) {
//     return OrganizationInvitation.findByIdAndUpdate(
//       id,
//       data,
//       {
//         new: true,
//       }
//     );
//   }
// }

import {
  OrganizationInvitation,
  IOrganizationInvitation,
} from './organization-invitation.model';

import { OrganizationInvitationStatus } from './organization-invitation-status';
import { InvitationScope } from './invitation-scope';

export class OrganizationInvitationRepository {
  async create(data: Partial<IOrganizationInvitation>) {
    return OrganizationInvitation.create(data);
  }

  async findById(id: string) {
    return OrganizationInvitation.findById(id);
  }

  async findPendingInvitation(
    organizationId: string,
    scope: InvitationScope,
    targetId: string,
    email: string
  ) {
    return OrganizationInvitation.findOne({
      organizationId,
      scope,
      targetId,
      email: email.toLowerCase(),
      status: OrganizationInvitationStatus.PENDING,
    });
  }

  async findPendingByEmail(email: string) {
    return OrganizationInvitation.find({
      email: email.toLowerCase(),
      status: OrganizationInvitationStatus.PENDING,
    }).sort({
      createdAt: -1,
    });
  }

  async findByOrganization(organizationId: string) {
    return OrganizationInvitation.find({
      organizationId,
    })
      .populate('invitedBy', 'fullName email')
      .sort({
        createdAt: -1,
      });
  }

  async findByEmail(email: string) {
    return OrganizationInvitation.find({
      email: email.toLowerCase(),
    }).sort({
      createdAt: -1,
    });
  }
async findByTokenHash(tokenHash: string) {
  return OrganizationInvitation.findOne({
    tokenHash,
  });
}
  async update(
    id: string,
    data: Partial<IOrganizationInvitation>
  ) {
    return OrganizationInvitation.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
  }
}