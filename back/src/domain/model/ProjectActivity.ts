import { Percentage } from '../percentage.type';
import { ProjectCode } from './project.code';
import { LocalDate } from '@js-joda/core';
import { Activity } from './Activity';
import { ProjectActivityRule } from '@app/domain/model/ProjectActivityRule';
import { ProjectError } from '@app/domain/model/errors/project.error';

export class ProjectActivity extends Activity {
  private readonly _project: ProjectCode;

  constructor(project: ProjectCode, percentage: Percentage, date: LocalDate) {
    super(percentage, date);
    if (project == null) {
      throw new ProjectError('cannot have a null attribute code');
    }
    this._project = project;
    this.addActivityRule(new ProjectActivityRule());
  }

  public get project(): ProjectCode {
    return this._project;
  }

  static fromJson(json: any): Activity {
    if (!json) {
      console.error('Invalid JSON data', json);
      throw new ProjectError('Invalid JSON data');
    }

    return new ProjectActivity(
      new ProjectCode(json._project._code),
      json._percentage as Percentage,
      LocalDate.parse(json._date),
    );
  }

  toJSON(): object {
    return {
      percentage: this._percentage,
      date: this._date.toJSON(),
      project: this._project.value,
    };
  }

  mapToJson(): any {
    return {
      _percentage: this._percentage,
      _date: this._date.toString(),
      _project: this._project,
    };
  }
}
