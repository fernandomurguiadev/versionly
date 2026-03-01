import { Injectable } from '@nestjs/common';

type InvitationPayload = {
  email: string;
  workspaceName: string;
  token: string;
  role: string;
};

@Injectable()
export class EmailService {
  async sendInvitation(payload: InvitationPayload) {
    console.log('INVITATION_EMAIL', payload);
  }
}
