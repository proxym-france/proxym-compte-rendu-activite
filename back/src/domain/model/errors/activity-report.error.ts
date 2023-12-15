import { HttpException } from '@nestjs/common';

export class ActivityReportError extends HttpException {
  constructor(message: string) {
    super(message, 400);
  }
}
