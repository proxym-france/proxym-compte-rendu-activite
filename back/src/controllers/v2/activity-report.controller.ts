import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CollabEmail } from '@app/domain/model/collab.email';
import { ActivityReportDto } from '@app/dtos/v2/activity-report.dto';
import { CraApplication } from '@app/domain/application/cra.application';
import { Month } from '@js-joda/core';
import {
  ACTIVITY_MONTH_DESC,
  ACTIVITY_YEAR_DESC,
  MonthActivityDto,
} from '@app/dtos/v2/month-activity.dto';
import { mapMonthActivityToCraDto } from '@app/mappers/v2/month-activity.mapper';

export const ACTIVITY_REPORT_URI = '/v2/private/activity-report';

@ApiTags('v2', 'Activity')
@Controller(ACTIVITY_REPORT_URI)
export class ActivityReportController {
  constructor(private craApp: CraApplication) {}

  @Post('')
  @ApiOperation({
    summary: 'Create multiple project activities',
    description:
      'Post multiple CRA days with for multiple projects. Usually for an entire week',
  })
  @ApiBody({
    type: ActivityReportDto,
  })
  async postBulk(@Body() activityReport: ActivityReportDto): Promise<any> {
    await this.craApp.bulkAdd(
      new CollabEmail(activityReport.employeeEmail),
      activityReport.month,
      activityReport.year,
      activityReport.activities,
    );

    return {
      message: 'OK',
    };
  }

  @ApiParam({
    name: 'user',
    description: 'The user email address',
  })
  @ApiParam({
    name: 'month',
    description: ACTIVITY_MONTH_DESC,
  })
  @ApiParam({
    name: 'year',
    description: ACTIVITY_YEAR_DESC,
  })
  @ApiResponse({
    type: MonthActivityDto,
  })
  @Get('/:user/:year/:month')
  async get(
    @Param('user') idUser: string,
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<MonthActivityDto> {
    const projects = await this.craApp.getAllProjects();
    const cra = await this.craApp.getCraByCollabMonthYear(
      new CollabEmail(idUser),
      Month.of(month),
      year,
    );

    return mapMonthActivityToCraDto(cra, projects);
  }

  @ApiParam({
    name: 'user',
    description: 'The user email address',
  })
  @ApiParam({
    name: 'year',
    description: ACTIVITY_YEAR_DESC,
  })
  @ApiResponse({
    type: [MonthActivityDto],
  })
  @Get('/:user/:year')
  async getMonthForUser(
    @Param('user') idUser: string,
    @Param('year') year: number,
  ): Promise<MonthActivityDto[]> {
    const projects = await this.craApp.getAllProjects();
    const cras = await this.craApp.userYearCra(new CollabEmail(idUser), year);

    return cras.map((cra) => mapMonthActivityToCraDto(cra, projects));
  }
}
