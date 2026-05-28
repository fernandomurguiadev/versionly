import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import { PrismaModule } from './integrations/prisma/prisma.module';
import { RedisModule } from './integrations/redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { FoldersModule } from './modules/folders/folders.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DraftsModule } from './modules/drafts/drafts.module';
import { VersionsModule } from './modules/versions/versions.module';
import { DiffModule } from './modules/diff/diff.module';
import { MergeModule } from './modules/merge/merge.module';
import { SharesModule } from './modules/shares/shares.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ImportsModule } from './modules/imports/imports.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ApiThrottlerGuard } from './common/guards/api-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, storageConfig],
    }),
    PrismaModule,
    RedisModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 300,
      },
    ]),
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ProjectsModule,
    FoldersModule,
    InvitationsModule,
    DocumentsModule,
    DraftsModule,
    VersionsModule,
    DiffModule,
    MergeModule,
    SharesModule,
    NotificationsModule,
    ImportsModule,
    AssetsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard,
    },
  ],
})
export class AppModule {}
