import { IsISO8601, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Percentage } from '../domain/percentage.type';
import { ProjectSimpleDto } from '@app/dtos/project.simple.dto';
import { Raison } from '@app/domain/model/Raison';
import { ApiProperty } from '@nestjs/swagger';
import { LocalDate } from '@js-joda/core';
import { Absence } from '@app/domain/model/Absence';

export enum ActivityDtoType {
  project = 'Project',
  holiday = 'Holiday',
  absence = 'Absence',
  blank = 'Available',
}

export class ActivityDto {
  @ApiProperty({
    description:
      'The activity title. If absence then contains the reason for absence, other ways project code',
    enum: Raison,
    required: false,
  })
  title?: string; // raison ou project ou available

  @ApiProperty({
    description: 'The percentage of the day this activity occupies.',
    minimum: 0,
    maximum: 100,
    examples: [0, 25, 50, 75, 100],
  })
  percentage: Percentage;

  @ApiProperty({
    description: 'What type of activity this is.',
    enum: ActivityDtoType,
  })
  type: ActivityDtoType;

  @ApiProperty({
    description: 'The date this activity is related to.',
    example: LocalDate.now().toString(),
  })
  @IsISO8601()
  date: string;

  @ApiProperty({
    description: 'The project this activity is for.',
    type: ProjectSimpleDto,
    required: false,
  })
  project?: ProjectSimpleDto;

  @ApiProperty({
    description: 'If an absence, the reason for absence',
    enum: Absence,
    required: false,
  })
  reason?: Raison;
}

export class ProjectActivitiesDto {
  @ApiProperty()
  projectCode: string;

  @ApiProperty({
    type: [ActivityDto],
  })
  @Type(() => ActivityDto)
  @ValidateNested({ each: true })
  activities: ActivityDto[];
}
