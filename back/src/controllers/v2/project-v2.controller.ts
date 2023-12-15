import { ProjectDto } from '@app/dtos/project.dto';
import { mapProject, mapToDomain } from '@app/mappers/v2/project.mapper';
import { CraApplication } from '@app/domain/application/cra.application';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Project } from '@app/domain/model/Project';
import { ProjectCode } from '@app/domain/model/project.code';
import { CollabEmail } from '@app/domain/model/collab.email';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const PROJECT_URI = '/v2/private/project';

@ApiTags('v2', 'Project')
@Controller(PROJECT_URI)
export class ProjectV2Controller {
  constructor(private readonly craApplication: CraApplication) {}

  @Get()
  @ApiOperation({
    summary: 'List all projects.',
    description: 'Retrieve the list of projects registered in the application.',
  })
  @ApiQuery({
    name: 'user',
    description: 'Optionally provide the user email address to filter.',
    required: false,
  })
  @ApiResponse({
    type: [ProjectDto],
  })
  async listProjects(@Query('user') user: string): Promise<ProjectDto[]> {
    let projects: Project[];
    const craApplication = this.craApplication;
    if (user) {
      projects = await craApplication.getProjectsByUser(new CollabEmail(user));
    } else {
      projects = await craApplication.getAllProjects();
    }
    return projects.map((proj) => mapProject(proj));
  }

  @Post('')
  @ApiOperation({
    summary: 'Add or update a project.',
    description: 'Add a new project or update an existing project.',
  })
  @ApiBody({
    type: ProjectDto,
  })
  async addProject(@Body() projectDto: ProjectDto): Promise<any> {
    await this.craApplication.addProject(mapToDomain(projectDto));
    return {
      message: 'OK',
    };
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Retrieve the project.',
    description: 'Retrieve the project from its id.',
  })
  @ApiParam({
    name: 'id',
    description: 'The project id.',
  })
  @ApiResponse({
    type: ProjectDto,
  })
  async get(@Param('id') projectId: string): Promise<ProjectDto> {
    const project = await this.craApplication.getProjectById(
      new ProjectCode(projectId),
    );
    return mapProject(project);
  }
}
