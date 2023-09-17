import { Project } from '../domain/model/Project';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateProjectDto } from '@app/dtos/CreateProjectDto';
import { CraApplication } from '../domain/application/craApplication';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

//@UseGuards(AuthGuard)
@ApiTags('Gestion des projets')
@Controller('project')
export class ProjectController {
  constructor(private readonly craApplication: CraApplication) {}

  @Post('add')
  @ApiOperation({
    summary: 'Ajouter un projet',
    description: 'Ajoute un nouveau projet.',
  })
  async addProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const project = new Project(
      createProjectDto.code,
      createProjectDto.collabs,
      createProjectDto.name,
      createProjectDto.client,
      new Date(createProjectDto.date),
      createProjectDto.status,
    );
    await this.craApplication.addProject(project);
    return await this.craApplication.getProjectById(project.code);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Liste de tous les projets',
    description: 'Récupère la liste de tous les projets enregistrés.',
  })
  async getProjects(): Promise<Project[]> {
    console.log('getting projects back');
    return await this.craApplication.getAllProjects();
  }

  @Get('user/:id')
  @ApiOperation({
    summary: "Liste de projets d'un utilisateur",
    description:
      "Récupère la liste des projets associés à l'email de l'utilisateur fourni.",
  })
  async getUserProjects(@Param('id') userId: string): Promise<Project[]> {
    return await this.craApplication.getProjectsByUser(userId);
  }

  @Get('/:id')
  @ApiOperation({
    summary: "Détails d'un projet par code(id)",
    description:
      "Récupère les détails d'un projet en fonction de l'identifiant fourni.",
  })
  async getById(@Param('id') projectId: string): Promise<Project> {
    return await this.craApplication.getProjectById(projectId);
  }

  @Put('update')
  @ApiOperation({
    summary: 'Mettre à jour un projet',
    description: "Met à jour les informations d'un projet.",
  })
  async updateProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<void> {
    const project = new Project(
      createProjectDto.code,
      createProjectDto.collabs,
      createProjectDto.name,
      createProjectDto.client,
      new Date(createProjectDto.date),
      createProjectDto.status,
    );
    await this.craApplication.updateProject(project);
  }

  @Get('search/:id')
  @ApiOperation({
    summary: 'Recherche de projets par ID',
    description:
      "Effectue une recherche de projets en fonction de l'identifiant fourni.",
  })
  async getProjectsSearch(@Param('id') id: string): Promise<Project[]> {
    return await this.craApplication.getProjectsLikeId(id);
  }

  @Post('desactivate/:id')
  @ApiOperation({
    summary: 'Desactiver un projet par code(id)',
    description: "Desactiver un projet en fonction de l'identifiant fourni.",
  })
  async desactivateProject(@Param('id') projectId: string): Promise<void> {
    await this.craApplication.desactivateProject(projectId);
  }
}
