import { Project } from '@app/domain/model/Project';
import { ProjectDto } from '@app/dtos/project.dto';
import { ProjectCode } from '@app/domain/model/project.code';
import { CollabEmail } from '@app/domain/model/collab.email';
import { LocalDate } from '@js-joda/core';

export const mapProject = (proj: Project) => {
  const projectDto: ProjectDto = new ProjectDto();
  projectDto.code = proj.code.value;
  projectDto.client = proj.client;
  projectDto.date = proj.date.toString();
  projectDto.employees = proj.collabs.map((collabMail) => collabMail.value);
  projectDto.name = proj.name;
  projectDto.status = proj.status;

  return projectDto;
};

export const mapToDomain = (proj: ProjectDto) => {
  return new Project(
    new ProjectCode(proj.code),
    proj.employees.map((collabString) => new CollabEmail(collabString)),
    proj.name,
    proj.client,
    proj.date ? LocalDate.parse(proj.date) : LocalDate.now(),
    proj.status,
  );
};
