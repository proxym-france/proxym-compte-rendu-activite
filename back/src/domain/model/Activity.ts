import { Percentage } from '@app/domain/percentage.type';
import { LocalDate } from '@js-joda/core';
import { ActivityRule } from '@app/domain/model/ActivityRule';
import { NotWeekendRule } from '@app/domain/model/NotWeekendRule';
import { CRAClosureRule } from '@app/domain/model/CRAClosureRule';
import { Interval } from '@js-joda/extra';
import { ActivityError } from '@app/domain/model/errors/activity.error';

export abstract class Activity {
  protected readonly _percentage: Percentage;
  protected readonly _date: LocalDate;
  protected readonly _rules: ActivityRule[] = [];

  protected constructor(percentage: Percentage, date: LocalDate) {
    if (date == null) {
      throw new ActivityError('cannot have a null attribute date');
    }
    if (percentage == null) {
      throw new ActivityError('cannot have a null attribute percentage');
    }
    this._percentage = percentage;
    this._date = date;
    this._rules = [new NotWeekendRule(), new CRAClosureRule()];
  }

  public get date(): LocalDate {
    return this._date;
  }

  public get percentage(): Percentage {
    return this._percentage;
  }

  public get rules(): ActivityRule[] {
    return this._rules;
  }

  abstract toJSON(): object;

  abstract mapToJson(): any;

  public addActivityRule(activityRule: ActivityRule): void {
    this._rules.push(activityRule);
  }

  /**
   *
   * @param activity the activity
   * @param craInterval the interval of a CRA. ([firstDayOfMonth, lastDayOfMonth])
   * @param closureInterval the closure interval of a CRA. ([firstDateOfMonth, closureDayOfNextMonth])
   *
   * @return True, if every rule are valid, False otherwise.
   */
  public isValid(
    activity: Activity,
    craInterval: Interval,
    closureInterval: Interval,
  ): boolean {
    return this._rules.every((activityRule) =>
      activityRule.validateRule(activity, craInterval, closureInterval),
    );
  }
}
