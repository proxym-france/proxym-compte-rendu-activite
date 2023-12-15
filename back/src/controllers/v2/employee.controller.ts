import { Collab } from '@app/domain/model/Collab';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CollabEmail } from '@app/domain/model/collab.email';
import { CraApplication } from '@app/domain/application/cra.application';
import { CreateEmployeeDto } from '@app/dtos/v2/create-employee.dto';
import { ProjectCode } from '@app/domain/model/project.code';
import { EmployeeDto } from '@app/dtos/v2/employee.dto';
import { mapEmployee } from '@app/mappers/v2/employee.mapper';

export const EMPLOYEE_URI = '/v2/private/employees';

@ApiTags('v2', 'Employee')
@Controller(EMPLOYEE_URI)
export class EmployeeController {
  constructor(private readonly craApplication: CraApplication) {}

  @Get('')
  @ApiOperation({
    summary: 'List all employees',
    description: 'Retrieve a list of employees registered in the application.',
  })
  @ApiQuery({
    name: 'emailFilter',
    description:
      'Optionally provide a comma separated list of emails to filter.',
    required: false,
    example: 'john.doe@proxym.fr,mohamed.doe@proxym.fr',
  })
  @ApiResponse({
    type: [EmployeeDto],
  })
  async listEmployees(
    @Query('emailFilter') emailFilter: string,
  ): Promise<EmployeeDto[]> {
    let collabs = [];
    if (emailFilter) {
      collabs = await this.craApplication.getAllCollabsByIds(
        emailFilter.split(',').map((id) => new CollabEmail(id)),
      );
    } else {
      collabs = await this.craApplication.getAllCollabs();
    }
    return collabs.map((collab) => mapEmployee(collab));
  }

  @Post('')
  @ApiOperation({
    summary: 'Add an employee.',
    description: 'Add a new employee to the application',
  })
  @ApiBody({
    type: CreateEmployeeDto,
  })
  async addCollab(@Body() employeeDto: CreateEmployeeDto): Promise<any> {
    const collab = new Collab(
      new CollabEmail(employeeDto.email),
      employeeDto.name,
      employeeDto.lastname,
      employeeDto.role,
      employeeDto.projects.map((project) => new ProjectCode(project)),
    );
    await this.craApplication.addCollab(collab);

    return {
      message: 'OK',
    };
  }
}
