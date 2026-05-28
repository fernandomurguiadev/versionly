import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ImportDocumentDto } from './dto/import-document.dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('folders/:folderId/imports')
  importDocument(
    @CurrentUser() user: { userId: string },
    @Param('folderId', UuidValidationPipe) folderId: string,
    @Body() dto: ImportDocumentDto,
  ) {
    return this.importsService.importDocument(user.userId, folderId, dto);
  }
}
