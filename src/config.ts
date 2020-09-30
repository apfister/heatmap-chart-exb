import { ImmutableObject } from 'seamless-immutable';
// import { UseDataSource } from 'jimu-core';

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
  chartOptions: object;
  seriesData: Array<any>;
  chartTitle: string;
  useDataLabels: boolean;
  colorRanges: Array<any>;
}

export type IMConfig = ImmutableObject<Config>;
