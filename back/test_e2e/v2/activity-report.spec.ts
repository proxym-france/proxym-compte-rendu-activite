import { DateProvider } from '../../src/domain/model/date-provider';
import { ProjectActivitiesDto } from '../../src/dtos/activity.dto';
import { createProject, createUser, prepareApp } from '../test.utils';
import { ProjectCode } from '../../src/domain/model/project.code';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { CraApplication } from '../../src/domain/application/cra.application';
import { CollabEmail } from '../../src/domain/model/collab.email';
import { ActivityReportDto } from '../../src/dtos/v2/activity-report.dto';
import { prepareActivities } from '../cra.controller.spec';
import { LocalDate, Month } from '@js-joda/core';
import { createCra } from '../../test/utils';
import { ACTIVITY_REPORT_URI } from '../../src/controllers/v2/activity-report.controller';
import { IRepoCra } from '../../src/domain/IRepository/IRepoCra';

describe('Activity Report Controller', () => {
  const getApp = prepareApp('activity_report');

  it('Can post cra activities in bulk', async () => {
    const date = LocalDate.parse('2023-11-02');
    const nextDate = LocalDate.parse('2023-11-03');
    DateProvider.setTodayDate(LocalDate.parse('2023-11-02'));

    const activities: ProjectActivitiesDto[] = prepareActivities(
      date,
      nextDate,
    );

    const collabEmail = new CollabEmail('aleksandar@proxym.fr');
    await createUser(getApp(), collabEmail);
    await createProject(getApp(), new ProjectCode('proj1'), collabEmail);
    await createProject(getApp(), new ProjectCode('proj2'), collabEmail);

    const dto = new ActivityReportDto();
    dto.month = Month.NOVEMBER.value();
    dto.year = 2023;
    dto.employeeEmail = collabEmail.value;
    dto.activities = activities;

    const response = await request(getApp().getHttpServer())
      .post('/v2/private/activity-report/')
      .set('Content-Type', 'application/json')
      .send(dto);

    expect(response.status).toBe(HttpStatus.CREATED);

    const application = getApp().get(CraApplication);

    const cra = await application.getCraByCollabMonthYear(
      collabEmail,
      Month.NOVEMBER,
      2023,
    );

    expect(cra.activities).toHaveLength(2);
    expect(cra.absences).toHaveLength(2);
    expect(cra.holidays).toHaveLength(2);
  });

  it('Can retrieve activity reports for a user', async () => {
    // given
    await userWithReport();

    // when
    const response = await request(getApp().getHttpServer())
      .get(`${ACTIVITY_REPORT_URI}/test@proxym.fr/2023/9`)
      .set('Content-Type', 'application/json');

    // then
    expect(response.body).toEqual(
      expect.objectContaining({
        id: '9-2023-test@proxym.fr',
        employee: 'test@proxym.fr',
      }),
    );
  });

  it('Can retrieve list of cras for a user for the whole year', async () => {
    // given
    await userWithTwoReports();

    // when
    const response = await request(getApp().getHttpServer())
      .get(`${ACTIVITY_REPORT_URI}/test@proxym.fr/2023`)
      .set('Content-Type', 'application/json');

    // then
    expect(response.body).toHaveLength(2);
  });

  async function userWithTwoReports() {
    const user = await createUser(getApp(), new CollabEmail('test@proxym.fr'));
    await createProject(getApp(), new ProjectCode('project1'));
    const cra1 = await createCra(user, LocalDate.of(2023, 9, 1));
    const cra2 = await createCra(user, LocalDate.of(2023, 10, 1));

    const repo: IRepoCra = getApp().get('IRepoCra');
    await repo.save(cra1);
    await repo.save(cra2);
  }

  async function userWithReport() {
    const user = await createUser(getApp(), new CollabEmail('test@proxym.fr'));
    await createProject(getApp(), new ProjectCode('project1'));
    const cra = await createCra(user, LocalDate.of(2023, 9, 1));

    const repo: IRepoCra = getApp().get('IRepoCra');
    await repo.save(cra);
  }
});
