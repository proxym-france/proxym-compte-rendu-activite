import { HttpException } from '@nestjs/common';

export class ProjectError extends HttpException {
  constructor(message: string) {
    super(message, 400);
  }
}
