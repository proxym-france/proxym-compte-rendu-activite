import { Cron } from '@nestjs/schedule';
import { environment } from '../environment/environment';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IRepoHoliday } from '@app/domain/IRepository/IRepoHoliday';
import { Holiday } from '@app/domain/model/Holiday';
import { HttpHolidayFetchService } from '@app/services/http-holiday-fetch.service';
import { LocalDate } from '@js-joda/core';

@Injectable()
export class HolidaysSyncService implements OnApplicationBootstrap {
  constructor(
    @Inject('IRepoHoliday') private holidayRepository: IRepoHoliday,
    @Inject(HttpHolidayFetchService)
    private holidayHttpService: HttpHolidayFetchService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.fetchAndStoreHolidays();
  }

  @Cron('0 0 1 1 *')
  async fetchAndStoreHolidays(year?: number): Promise<void> {
    console.log('fetching holidays');
    await this.holidayRepository.deleteAll();
    if (!year) {
      year = LocalDate.now().year();
    }

    for (const currentYear of [year - 1, year, year + 1]) {
      const url = `${environment.apiUrl}${currentYear}.json`;

      try {
        const holidaysData =
          await this.holidayHttpService.fetchHolidaysData(url);
        for (const [dateStr, name] of Object.entries(holidaysData)) {
          const date = LocalDate.parse(dateStr);

          const holiday = new Holiday(date, name as string);
          await this.holidayRepository.save(holiday);
        }
        console.log('Done fetching holidays for', currentYear);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        throw error;
      }
    }
  }
}
