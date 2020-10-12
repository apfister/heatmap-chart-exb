import { ImmutableObject } from 'seamless-immutable';
import { IMSqlExpression } from 'jimu-core';

export interface Config {
  xAxisField: string;
  yAxisField: string;
  metricField: string;
  useStats: boolean;
  statsType: string;
  useExpression: boolean;
  expression: IMSqlExpression;
  useYAxisFieldLabel: boolean;
  yAxisFieldLabel: string;
  numClasses: number;
  selectedColorRamp: string;
  shouldFlipColorRamp: boolean;
  availableColorRamps: Array<any>;
  chartOptions: object;
  seriesData: Array<any>;
  chartTitle: string;
  useDataLabels: boolean;
  dataLabelForeColor: string;
  colorRanges: Array<any>;
  noDataLabel: string;
  noDataColor: string;
}

export type IMConfig = ImmutableObject<Config>;
