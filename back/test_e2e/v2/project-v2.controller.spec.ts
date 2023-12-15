import * as request from 'supertest';
import { createProject, createUser, prepareApp } from '../test.utils';
import { PROJECT_URI } from '../../src/controllers/v2/project-v2.controller';
import { ProjectStatus } from '../../src/domain/model/projetStatus.enum';
import { ProjectDto } from '../../src/dtos/project.dto';
import { HttpStatus } from '@nestjs/common';
import { ProjectCode } from '../../src/domain/model/project.code';
import { CollabEmail } from '../../src/domain/model/collab.email';
import { mapProject } from '../../src/mappers/v2/project.mapper';
import { ProjectRepository } from '../../src/repositories/project.repository';

describe('Project Controller', () => {
  const getApp = prepareApp('project');

  it('should list all projects', async () => {
    const clientId = new CollabEmail('test1@proxym.fr');
    await createUser(getApp(), clientId);
    await createProject(getApp(), new ProjectCode('code 1'), clientId);
    await createProject(getApp(), new ProjectCode('code 2'), clientId);

    const response = await request(getApp().getHttpServer())
      .get(PROJECT_URI)
      .set('Content-Type', 'application/json');

    expect(response.body).toHaveLength(2);
  });

  it('should list all projects by client email', async () => {
    const clientId1 = new CollabEmail('test1@proxym.fr');
    await createUser(getApp(), clientId1);
    await createProject(getApp(), new ProjectCode('code 1'), clientId1);

    const clientId2 = new CollabEmail('test2@proxym.fr');
    await createUser(getApp(), clientId2);
    await createProject(getApp(), new ProjectCode('code 2'), clientId2);

    const response = await request(getApp().getHttpServer())
      .get(PROJECT_URI)
      .set('Content-Type', 'application/json')
      .query({ user: 'test1@proxym.fr' });

    expect(response.body).toHaveLength(1);
  });

  it('should create a project', async () => {
    const projectDto = new ProjectDto();
    projectDto.name = 'New project';
    projectDto.status = ProjectStatus.Active;
    projectDto.employees = [];
    projectDto.code = 'new_proj_01';
    projectDto.client = '';

    const response = await request(getApp().getHttpServer())
      .post(PROJECT_URI)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send(projectDto);

    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('should update the project', async () => {
    await createProject(getApp(), new ProjectCode('code'));

    const updatedName = 'New project';
    const updatedProjectDto = new ProjectDto();
    updatedProjectDto.name = updatedName;
    updatedProjectDto.status = ProjectStatus.Active;
    updatedProjectDto.code = 'code';

    const response = await request(getApp().getHttpServer())
      .post(PROJECT_URI)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send(updatedProjectDto);

    expect(response.status).toBe(HttpStatus.CREATED);
    const repo: ProjectRepository = getApp().get('IRepoProject');
    const allProjects = await repo.findAll();
    expect(allProjects).toHaveLength(1);
    const findProject = await repo.findById(new ProjectCode('code'));
    expect(findProject.name).toEqual(updatedName);
  });

  it('should update the project status to inactive', async () => {
    const savedProject = await createProject(getApp(), new ProjectCode('code'));

    const projectDto = mapProject(savedProject);
    projectDto.status = ProjectStatus.Inactive;

    const response = await request(getApp().getHttpServer())
      .post(PROJECT_URI)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send(projectDto);

    expect(response.status).toBe(HttpStatus.CREATED);
    const repo: ProjectRepository = getApp().get('IRepoProject');
    const allProjects = await repo.findAll();
    expect(allProjects).toHaveLength(1);
    const findProject = await repo.findById(new ProjectCode('code'));
    expect(findProject.status).toBe(ProjectStatus.Inactive);
  });

  it('should retrieve a project with its id', async () => {
    const clientId = new CollabEmail('test1@proxym.fr');
    await createUser(getApp(), clientId);
    const projectId = 'code';
    const project = await createProject(
      getApp(),
      new ProjectCode(projectId),
      clientId,
    );

    const response = await request(getApp().getHttpServer())
      .get(PROJECT_URI + '/' + projectId)
      .set('Content-Type', 'application/json');

    expect(response.body).toEqual(mapProject(project));
  });

  it('should not allow to create a project with a non existing user', async () => {
    const clientId = new CollabEmail('test1@proxym.fr');
    const projectDto = new ProjectDto();
    projectDto.name = 'New project';
    projectDto.status = ProjectStatus.Active;
    projectDto.employees = ['unknown@proxym.fr', clientId.value];
    projectDto.code = 'new_proj_01';
    projectDto.client = '';

    await createUser(getApp(), clientId);

    const response = await request(getApp().getHttpServer())
      .post(PROJECT_URI)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send(projectDto);

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should not allow to add a none existing user to an existing project', async () => {
    const clientId = new CollabEmail('test1@proxym.fr');
    await createUser(getApp(), clientId);
    const savedProject = await createProject(
      getApp(),
      new ProjectCode('code'),
      clientId,
    );

    const projectDto = mapProject(savedProject);
    projectDto.employees = [...projectDto.employees, 'unknown@proxym.fr'];

    const response = await request(getApp().getHttpServer())
      .post(PROJECT_URI)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send(projectDto);

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
