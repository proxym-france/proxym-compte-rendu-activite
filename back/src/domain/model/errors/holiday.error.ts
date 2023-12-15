import { HttpException } from '@nestjs/common';

export class HolidayError extends HttpException {
  constructor(message: string) {
    super(message, 400);
  }
}
