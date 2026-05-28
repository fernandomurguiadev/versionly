import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class UuidValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || !UUID_REGEX.test(value)) {
      throw new BadRequestException('UUID inválido.');
    }
    return value;
  }
}
