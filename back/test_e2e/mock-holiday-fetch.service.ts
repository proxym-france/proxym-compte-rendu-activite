import { HolidayFetchService } from '@app/services/holiday-fetch.service';
import { mockedHolidays } from './holiday.mock-data';

export class MockHolidayFetchService implements HolidayFetchService {
  fetchHolidaysData(url: string): Promise<any> {
    return Promise.resolve(mockedHolidays);
  }
}
