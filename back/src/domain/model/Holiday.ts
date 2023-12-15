import { LocalDate } from '@js-joda/core';
import { HolidayError } from '@app/domain/model/errors/holiday.error';

export class Holiday {
  private readonly _date: LocalDate;
  private readonly _name: string;

  constructor(date: LocalDate, name: string) {
    if (!(date && name)) {
      throw new HolidayError('cannot have a null attribute date or name');
    }
    this._date = date;
    this._name = name;
  }

  private readonly LOCALE_FR = 'fr-FR';

  public get id() {
    return this._date.toString();
  }

  public get date(): LocalDate {
    return this._date;
  }

  public get name(): string {
    return this._name;
  }

  static fromJson(json: any): Holiday {
    return new Holiday(LocalDate.parse(json._date), json._name);
  }

  mapToJson(): any {
    return {
      _date: this._date.toString(),
      _name: this._name,
    };
  }
}
