import { HttpException } from '@nestjs/common';

export class ApplicationError extends HttpException {
  constructor(message: string) {
    super(message, 400);
  }
}
