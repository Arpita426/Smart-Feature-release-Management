export class EmailService {
  async sendOrganizationInvitation(
    email: string,
    organizationName: string
  ) {
    console.log(
      `📧 Invitation sent to ${email} for ${organizationName}`
    );
  }
}