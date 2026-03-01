import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { EmailModule } from '../../integrations/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
