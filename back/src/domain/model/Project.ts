import { ProjectStatus } from './projetStatus.enum';
import { ProjectCode } from '@app/domain/model/project.code';
import { CollabEmail } from '@app/domain/model/collab.email';
import { Transform } from 'class-transformer';
import { LocalDate } from '@js-joda/core';
import { ProjectError } from '@app/domain/model/errors/project.error';

export class Project {
  // @Transform((params) => params.value.map((item) => item.value))
  private readonly _collabs: CollabEmail[] = [];
  @Transform((params) => params.value.value)
  private readonly _code: ProjectCode;
  private readonly _name: string;
  private readonly _client: string;
  private readonly _date: LocalDate;

  constructor(
    code: ProjectCode,
    collabs: CollabEmail[],
    name: string,
    client: string,
    date: LocalDate,
    status: ProjectStatus,
  ) {
    if (!(code && collabs)) {
      throw new ProjectError('cannot have a null attribute code / employees');
    }
    this._code = code;
    this._collabs = collabs;
    this._name = name;
    this._client = client;
    this._date = date || LocalDate.now();
    this._status = status;
  }

  private _status: ProjectStatus = ProjectStatus.Active;

  public get status(): ProjectStatus {
    return this._status;
  }

  public get collabs(): CollabEmail[] {
    return this._collabs;
  }

  @Transform((value) => value.value.value)
  public get code(): ProjectCode {
    return this._code;
  }

  public get name(): string {
    return this._name;
  }

  public get client(): string {
    return this._client;
  }

  public get date(): LocalDate {
    return this._date;
  }

  addCollab(collab: CollabEmail) {
    this._collabs.push(collab);
  }

  public inactiveProject() {
    this._status = ProjectStatus.Inactive;
  }
}
