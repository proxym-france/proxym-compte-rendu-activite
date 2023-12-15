import { createProject, createUser, prepareApp } from './test.utils';
import { ProjectStatus } from '@app/domain/model/projetStatus.enum';
import { ProjectRepository } from '@app/repositories/project.repository';
import { Project } from '@app/domain/model/Project';
import { ProjectCode } from '@app/domain/model/project.code';
import { HttpStatus } from '@nestjs/common';
import { CollabEmail } from '@app/domain/model/collab.email';
import { ProjectDto } from '@app/dtos/project.dto';
import * as request from 'supertest';
import { LocalDate } from '@js-joda/core';

describe('Project controller', () => {
  const app = prepareApp('project');
  const clientId = new CollabEmail('test1@proxym.fr');

  it(`create project`, async () => {
    await createUser(app(), clientId);
    await createProject(app(), new ProjectCode('code'), clientId);

    const createdProject = (
      await request(app().getHttpServer())
        .get(`/project/code`)
        .set('Content-Type', 'application/json')
        .accept('application/json')
    ).body;

    expect(createdProject.code).toEqual('code');
    expect(createdProject.status).toEqual(ProjectStatus.Active);
  });

  it(`Can deactivate a project`, async () => {
    const repo: ProjectRepository = app().get('IRepoProject');
    const project = new Project(
      new ProjectCode('projetTest'),
      [],
      '',
      '',
      LocalDate.now(),
      ProjectStatus.Active,
    );
    await repo.save(project);

    const response = await request(app().getHttpServer())
      .post(`/project/desactivate/projetTest`)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send();

    expect(response.status).toBe(HttpStatus.CREATED);

    const actualProject = await repo.findById(new ProjectCode('projetTest'));
    expect(actualProject.status).toBe(ProjectStatus.Inactive);
  });

  it('Does not allow to add a non existing user to a an existing project', async () => {
    const projectDto = badProject();

    await createUser(app(), clientId);

    const response = await request(app().getHttpServer())
      .put(`/project/update`)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send(projectDto);

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  function badProject() {
    const projectDto = new ProjectDto();
    projectDto.name = 'New project';
    projectDto.status = ProjectStatus.Active;
    projectDto.employees = ['unknown@proxym.fr', clientId.value];
    projectDto.code = 'new_proj_01';
    projectDto.client = 'axa';
    return projectDto;
  }

  it('Does not allow to create a project with a non existing user', async () => {
    const projectDto = badProject();

    await createUser(app(), clientId);

    const response = await request(app().getHttpServer())
      .post(`/project/add`)
      .set('Content-Type', 'application/json')
      .accept('application/json')
      .send(projectDto);

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
