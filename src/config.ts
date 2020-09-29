import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  xAxisField: string;
  yAxisField: string;
  metricField: string;
  useStats: boolean;
  statsType: string;
  useWhereClause: boolean;
  whereClause: string;
  useYAxisFieldLabel: boolean;
  yAxisFieldLabel: string;
  numClasses: number;
  selectedColorRamp: string;
  availableColorRamps: Array<any>;
}

export type IMConfig = ImmutableObject<Config>;
