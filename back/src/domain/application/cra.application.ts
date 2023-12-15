import { Collab } from '@app/domain/model/Collab';
import { IRepoCollab } from '../IRepository/IRepoCollab';
import { Inject, Injectable } from '@nestjs/common';
import { IRepoProject } from '../IRepository/IRepoProject';
import { Project } from '../model/Project';
import { IRepoCra } from '../IRepository/IRepoCra';
import { CreateAbsenceDto } from '@app/dtos/CreateAbsenceDto';
import { CreateActivityDto } from '@app/dtos/CreateActivityDto';
import { Holiday } from '../model/Holiday';
import { IRepoHoliday } from '../IRepository/IRepoHoliday';
import { ProjectCode } from '@app/domain/model/project.code';
import { CollabEmail } from '@app/domain/model/collab.email';
import { Raison } from '@app/domain/model/Raison';
import { Absence } from '@app/domain/model/Absence';
import { CRA } from '@app/domain/model/CRA';
import { Etat } from '@app/domain/model/etat.enum';
import { Status } from '@app/domain/model/Status';
import { Activity } from '@app/domain/model/Activity';
import { ActivityDtoType, ProjectActivitiesDto } from '@app/dtos/activity.dto';
import { LocalDate, Month } from '@js-joda/core';
import { ProjectActivity } from '@app/domain/model/ProjectActivity';
import { ApplicationError } from '@app/domain/application/errors/application.error';
import { ActivityReportError } from '@app/domain/model/errors/activity-report.error';

@Injectable()
export class CraApplication {
  constructor(
    @Inject('IRepoCollab') private collabRepository: IRepoCollab,
    @Inject('IRepoProject') private projectRepository: IRepoProject,
    @Inject('IRepoCra') private craRepository: IRepoCra,
    @Inject('IRepoHoliday') private holidayRepository: IRepoHoliday,
  ) {}

  async getAllHolidays(): Promise<Holiday[]> {
    return await this.holidayRepository.findAll();
  }

  async addProject(project: Project) {
    return await this.projectRepository.save(project);
  }

  async getAllProjects() {
    return await this.projectRepository.findAll();
  }

  async updateProject(project: Project) {
    await this.projectRepository.update(project);
  }

  async getProjectById(id: ProjectCode) {
    return await this.projectRepository.findById(id);
  }

  async deleteProject(id: ProjectCode) {
    return await this.projectRepository.delete(id);
  }

  async getProjectsByUser(id: CollabEmail) {
    return await this.projectRepository.findByUser(id);
  }

  async addAbsence(createAbsenceDto: CreateAbsenceDto) {
    const dateAbs = LocalDate.parse(createAbsenceDto.date);

    const collabEmail = new CollabEmail(createAbsenceDto.collabId);

    // Check if the specified CRA exists
    let cra = await this.craRepository.findByMonthYearCollab(
      dateAbs.month(),
      dateAbs.year(),
      new CollabEmail(createAbsenceDto.collabId),
    );

    if (!cra) {
      cra = await this.createNewCra(dateAbs, collabEmail);
    }

    //create absence
    const absence = new Absence(
      createAbsenceDto.percentage,
      dateAbs,
      createAbsenceDto.raison,
    );
    // add absence to the cra
    cra.addActivity(absence);
    //save cra and done
    await this.craRepository.save(cra);

    return absence;
  }

  async deleteAbsence(idCra: string, date: LocalDate, raison: Raison) {
    const cra = await this.craRepository.findById(idCra);
    cra.etat = Etat.unsubmitted;
    cra.deleteAbsence(date, raison);
    return await this.craRepository.save(cra);
  }

  async addActivity(createActivityDto: CreateActivityDto) {
    const dateAct = LocalDate.parse(createActivityDto.date);

    const collabEmail = new CollabEmail(createActivityDto.collabId);

    const project = await this.projectRepository.findById(
      new ProjectCode(createActivityDto.projectId),
    );
    // Check if the specified CRA exists
    let cra = await this.craRepository.findByMonthYearCollab(
      dateAct.month(),
      dateAct.year(),
      new CollabEmail(createActivityDto.collabId),
    );

    if (!cra) {
      cra = await this.createNewCra(dateAct, collabEmail);
    }

    //create absence
    const activity = new ProjectActivity(
      project.code,
      createActivityDto.percentage,
      dateAct,
    );
    // add absence to the cra
    cra.addActivity(activity);
    //save cra and done
    await this.craRepository.save(cra);

    return activity;
  }

  async deleteActivity(idCra: string, date: LocalDate, project: ProjectCode) {
    const cra = await this.craRepository.findById(idCra);
    cra.etat = Etat.unsubmitted;
    cra.deleteActivity(date, project);
    return await this.craRepository.save(cra);
  }

  async getCraByCollabMonthYear(
    idUser: CollabEmail,
    month: Month,
    year: number,
  ) {
    return await this.craRepository.findByMonthYearCollab(month, year, idUser);
  }

  async bulkAdd(
    idUser: CollabEmail,
    month,
    year,
    activities: Array<ProjectActivitiesDto>,
    replace = false,
  ) {
    const toAdd = new Array<Activity | Absence>();
    const projects = await this.getProjectsByUser(idUser);

    for (const projectActivity of activities) {
      for (const activityDto of projectActivity.activities) {
        const date = LocalDate.parse(activityDto.date);

        if (activityDto.type === ActivityDtoType.project) {
          const existingProject = projects.find(
            (proj) => proj.code.value === projectActivity.projectCode,
          );

          if (!existingProject) {
            throw new ActivityReportError(
              `Cannot report activity, Project "${projectActivity.projectCode}" is not assigned to user ${idUser}`,
            );
          }
          toAdd.push(
            new ProjectActivity(
              new ProjectCode(projectActivity.projectCode),
              activityDto.percentage,
              date,
            ),
          );
        } else if (activityDto.type === ActivityDtoType.absence) {
          toAdd.push(
            new Absence(activityDto.percentage, date, activityDto.reason),
          );
        }
      }
    }

    const craDate = LocalDate.of(year, month, 1);
    let cra = await this.getCraByCollabMonthYear(
      idUser,
      craDate.month(),
      craDate.year(),
    );

    if (!cra) {
      cra = await this.createNewCra(craDate, idUser);
    }

    cra.bulkAdd(toAdd, { replace: replace });
    await this.craRepository.save(cra);
  }

  async submitCra(idCra: string) {
    const cra = await this.craRepository.findById(idCra);
    cra.SubmitCra();
    return await this.craRepository.save(cra);
  }

  async getEmptyDates(idCra: string) {
    const cra = await this.craRepository.findById(idCra);
    return cra.getAvailableDatesOfCra();
  }

  async userYearCra(idUser: CollabEmail, year: number) {
    return await this.craRepository.findByYearUser(idUser, year);
  }

  async getAllCollabs() {
    return await this.collabRepository.findAll();
  }

  async getAllCollabsByIds(ids: CollabEmail[]) {
    return await this.collabRepository.findByIds(ids);
  }

  async getProjectsLikeId(id: ProjectCode) {
    return await this.projectRepository.findLikeById(id);
  }

  async getMonthCra(month: Month, year: number) {
    return await this.craRepository.findByMonthYear(month, year);
  }

  async closeAllMonthCra(month: Month, year: number) {
    const cras = await this.craRepository.findByMonthYear(month, year);
    const crasUnsubmitted = cras.filter((cra) => cra.etat == Etat.unsubmitted);
    if (crasUnsubmitted.length > 0) {
      throw new ApplicationError(
        'cannot close month: there is an un-submitted activity report',
      );
    }
    cras.forEach((cra) => {
      cra.closeCra();
      this.craRepository.save(cra);
    });
  }

  async addCollab(collab: Collab): Promise<void> {
    await this.collabRepository.save(collab);
  }

  async desactivateProject(code: ProjectCode) {
    const project = await this.projectRepository.findById(code);
    project.inactiveProject();
    await this.projectRepository.save(project);
  }

  private async createNewCra(dateAct: LocalDate, user: CollabEmail) {
    const collabPromise = await this.collabRepository.findById(user);

    if (collabPromise === undefined) {
      throw new ApplicationError(
        `Cannot create new CRA for an unknown employee ${user.value}`,
      );
    }

    const cra = new CRA(
      dateAct.month(),
      dateAct.year(),
      user,
      [],
      [],
      Etat.unsubmitted,
      Status.Open,
    );
    cra.holidays = await this.holidayRepository.find(
      dateAct.month(),
      dateAct.year(),
    );
    await this.craRepository.save(cra);
    return await this.craRepository.findByMonthYearCollab(
      dateAct.month(),
      dateAct.year(),
      user,
    );
  }
}
