import { Percentage } from '@app/domain/percentage.type';
import { ProjectCode } from '@app/domain/model/project.code';

export class Activity {
  private _project: ProjectCode;
  private _percentage: Percentage;
  private _date: Date;

  toJSON(): object {
    return {
      percentage: this._percentage,
      date: this._date.toISOString(),
      project: this._project.value,
    };
  }

  constructor(projet: ProjectCode, percentage: Percentage, date: Date) {
    if (date == null) {
      throw new Error('cannot have a null attribut');
    }
    if (projet == null) {
      throw new Error('cannot have a null attribut');
    }
    if (percentage == null) {
      throw new Error('cannot have a null attribut');
    }
    this._project = projet;
    this._percentage = percentage;
    this._date = date;
  }

  public get project(): ProjectCode {
    return this._project;
  }

  public get date(): Date {
    return this._date;
  }

  public get percentage(): Percentage {
    return this._percentage;
  }

  static fromJson(json: any): Activity {
    if (!json) {
      throw new Error('Invalid JSON data');
    }

    return new Activity(
      new ProjectCode(json._project._code),
      json._percentage as Percentage,
      new Date(json._date),
    );
  }
}
