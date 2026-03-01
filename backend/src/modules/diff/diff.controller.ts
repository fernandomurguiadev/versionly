import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiffService } from './diff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('diff')
@UseGuards(JwtAuthGuard)
export class DiffController {
  constructor(private readonly diffService: DiffService) {}

  @Get()
  compute(
    @CurrentUser() user: { userId: string },
    @Query('versionA') versionA: string,
    @Query('versionB') versionB: string,
  ) {
    return this.diffService.compute(user.userId, versionA, versionB);
  }
}
