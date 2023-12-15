import { ProjectActivitiesDto } from '../activity.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocalDate } from '@js-joda/core';

export class ActivityReportDto {
  @Type(() => ProjectActivitiesDto)
  @ValidateNested({ each: true })
  @ApiProperty({
    description: 'List of activities per project.',
    type: [ProjectActivitiesDto],
  })
  activities: ProjectActivitiesDto[];

  @ApiProperty({
    description: 'The email address of the employee who reports.',
  })
  employeeEmail: string;

  @ApiProperty({
    description: 'For which year the report is.',
    minimum: 2023,
    default: LocalDate.now().year(),
  })
  year: number;

  @ApiProperty({
    description: 'For what month the report is.',
    minimum: 1,
    maximum: 12,
    examples: ['1 - January', '12 - December'],
    default: LocalDate.now().month().value(),
  })
  month: number;

  @ApiProperty({
    description:
      'If set to true all inserts performed by this activity report will override existing dates.',
    default: false,
  })
  replace: boolean;
}
