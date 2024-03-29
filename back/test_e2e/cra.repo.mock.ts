import { IRepoCra } from '@app/domain/IRepository/IRepoCra';
import { CRA } from '@app/domain/model/CRA';
import { Absence } from '@app/domain/model/Absence';
import { Raison } from '@app/domain/model/Raison';
import { CollabEmail } from '@app/domain/model/collab.email';
import { LocalDate, Month } from '@js-joda/core';

/* eslint-disable @typescript-eslint/no-unused-vars */
export class MockRepoCra implements IRepoCra {
  save(cra: CRA): Promise<void> {
    throw new Error('Not implemented');
  }

  findById(id: string): Promise<CRA> {
    throw new Error('Not implemented');
  }

  findByMonthYearCollab(
    month: Month,
    year: number,
    collab: CollabEmail,
  ): Promise<CRA> {
    throw new Error('Not implemented');
  }

  findByYearUser(idUser: CollabEmail, year: number): Promise<CRA[]> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByMonthYear(month: Month, year: number): Promise<any[]> {
    const activityMap = new Map<string, number>();
    activityMap.set('Project1', 10);
    activityMap.set('Project2', 20);

    const abs1 = new Absence(0, LocalDate.now(), Raison.CongesPayes);
    const abs2 = new Absence(0, LocalDate.now(), Raison.CongesPayes);
    return [
      {
        collab: {
          name: 'amira',
          lastname: 'karchoud',
        },
        absences: [abs1, abs2],
        activities: [{}, {}, {}],
        calculateBusinessDays: jest.fn().mockReturnValue(20),
        getActivityCountByProject: jest.fn().mockReturnValue(activityMap),
        holidays: [],
      },
    ];
  }
}
