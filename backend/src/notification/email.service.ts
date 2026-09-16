import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private transporter =
    nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });

  private buildInvitationUrl(
    token: string
  ) {
    return (
      `${env.FRONTEND_URL}` +
      `/app/invitations/accept?token=${encodeURIComponent(token)}`
    );
  }

  private async sendInvitationEmail(
    email: string,
    subject: string,
    title: string,
    resourceType: string,
    resourceName: string,
    details: string,
    invitationToken: string
  ) {
    const invitationUrl =
      this.buildInvitationUrl(
        invitationToken
      );

    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
    }

    .wrapper {
      width: 100%;
      padding: 40px 16px;
      box-sizing: border-box;
    }

    .card {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    }

    .header {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      padding: 28px 32px;
      text-align: center;
      color: #ffffff;
    }

    .brand {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.3px;
      margin-bottom: 16px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.3;
    }

    .content {
      padding: 32px;
    }

    .intro {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px;
      color: #4b5563;
    }

    .details {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }

    .detail-row {
      margin-bottom: 14px;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .value {
      font-size: 15px;
      color: #111827;
      font-weight: 600;
    }

    .button-wrapper {
      text-align: center;
      margin: 30px 0;
    }

    .button {
      display: inline-block;
      background: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
    }

    .expiry {
      text-align: center;
      font-size: 13px;
      color: #92400e;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 10px 14px;
      margin-top: 20px;
    }

    .footer {
      padding: 20px 32px 28px;
      text-align: center;
      font-size: 12px;
      line-height: 1.6;
      color: #9ca3af;
      border-top: 1px solid #f0f0f0;
    }

    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 10px;
      }

      .content {
        padding: 24px 20px;
      }

      .header {
        padding: 24px 20px;
      }

      .footer {
        padding: 18px 20px 24px;
      }

      .header h1 {
        font-size: 23px;
      }
    }
  </style>
</head>

<body>
  <div class="wrapper">

    <div class="card">

      <div class="header">
        <div class="brand">
          Smart Feature Release Management
        </div>

        <h1>
          You're Invited 🎉
        </h1>
      </div>

      <div class="content">

        <p class="intro">
          You have received an invitation to collaborate
          on <strong>${resourceType}</strong>.
        </p>

        <div class="details">

          <div class="detail-row">
            <span class="label">
              ${resourceType}
            </span>

            <span class="value">
              ${resourceName}
            </span>
          </div>

          <div class="detail-row">
            <span class="label">
              Email
            </span>

            <span class="value">
              ${email}
            </span>
          </div>

          ${
            details
              ? `
                <div class="detail-row">
                  <span class="label">
                    Details
                  </span>

                  <span class="value">
                    ${details}
                  </span>
                </div>
              `
              : ''
          }

        </div>

        <div class="button-wrapper">
          <a
            href="${invitationUrl}"
            class="button"
          >
            View Invitation →
          </a>
        </div>

        <div class="expiry">
          ⏳ This invitation expires in 7 days.
        </div>

      </div>

      <div class="footer">
        You received this email because someone invited
        you to collaborate on Smart Feature Release Management.
        <br />
        If you weren't expecting this invitation, you can
        safely ignore this email.
      </div>

    </div>

  </div>
</body>
</html>
`,
    });
  }

  async sendOrganizationInvitation(
    email: string,
    organizationName: string,
    invitationToken: string
  ) {
    await this.sendInvitationEmail(
      email,
      `Invitation to join ${organizationName}`,
      'You have been invited',
      'organization',
      organizationName,
      'You have been invited to join this organization.',
      invitationToken
    );
  }

  async sendProjectInvitation(
    email: string,
    projectName: string,
    invitationToken: string
  ) {
    await this.sendInvitationEmail(
      email,
      `Invitation to join project ${projectName}`,
      'Project invitation',
      'project',
      projectName,
      'You have been invited to collaborate on this project.',
      invitationToken
    );
  }

  async sendFeatureInvitation(
    email: string,
    featureName: string,
    invitationToken: string
  ) {
    await this.sendInvitationEmail(
      email,
      `Feature access invitation: ${featureName}`,
      'Feature invitation',
      'feature',
      featureName,
      'You have been invited to access this feature.',
      invitationToken
    );
  }
}