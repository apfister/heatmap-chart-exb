import {
  React,
  Immutable,
  IMFieldSchema,
  UseDataSource,
  IMDataSourceInfo,
  DataSource,
  DataSourceManager,
  DataSourceStatus,
  FeatureLayerQueryParams,
  AllWidgetProps,
  DataSourceComponent
} from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { ArcGISDataSourceTypes } from 'jimu-arcgis';
import {
  DataSourceSelector,
  FieldSelector
} from 'jimu-ui/advanced/data-source-selector';
import {
  SettingSection,
  SettingRow
} from 'jimu-ui/advanced/setting-components';

import {
  Switch,
  Label,
  Select,
  Option,
  DropdownItemProps,
  TextInput,
  NumericInput
} from 'jimu-ui';

import { IMConfig } from '../config';

import FeatureLayer = require('esri/layers/FeatureLayer');

interface IState {
  query: any;
  useWhereClause: boolean;
}
export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<IMConfig>,
  IState
> {
  supportedTypes = Immutable([ArcGISDataSourceTypes.FeatureLayer]);
  props: any;

  constructor(props) {
    super(props);

    this.state = {
      selectedDataSource:
        this.props &&
        this.props.useDataSources &&
        this.props.useDataSources.length > 0 &&
        this.props.useDataSources[0],
      checkProps: [
        'xAxisField',
        'yAxisField',
        'metricField',
        'useStats',
        'statsType',
        'useWhereClause',
        'whereClause',
        'useYAxisFieldLabel',
        'yAxisFieldLabel',
        'numClasses',
        'selectedColorRamp',
        'availableColorRamps'
      ],
      chartProps: ['useDataLabels']
    };
  }

  componentDidMount() {
    // const baseChartOptions = {
    //   chart: {
    //     type: 'heatmap',
    //     toolbar: {
    //       show: true,
    //       tools: {
    //         download: true,
    //         selection: true,
    //         zoom: true,
    //         zoomin: false,
    //         zoomout: false,
    //         pan: false,
    //         reset: false
    //       },
    //       width: '100%'
    //     },
    //     events: {
    //       selection: function (chartContext, { xaxis, yaxis }) {
    //         console.log('selection', chartContext, { xaxis, yaxis });
    //       },
    //       click: function (chartContext, { xaxis, yaxis }) {
    //         console.log('click', chartContext, { xaxis, yaxis });
    //       },
    //       dataPointSelection: function (event, chartContext, config) {
    //         console.log('dataPointSelection', event, chartContext, config);
    //       }
    //     }
    //   },
    //   plotOptions: {
    //     heatmap: {
    //       shadeIntensity: 0.1,
    //       useFillColorAsStroke: false,
    //       radius: 0,
    //       colorScale: {
    //         ranges: []
    //       }
    //     }
    //   },
    //   dataLabels: { enabled: true, style: { colors: ['#104c6d'] } },
    //   xaxis: {
    //     labels: {
    //       show: true,
    //       rotate: -45,
    //       rotateAlways: true,
    //       trim: true,
    //       maxHeight: 120,
    //       // datetimeFormatter: {
    //       //   year: 'yyyy',
    //       //   month: 'MMM \'yy',
    //       //   day: 'dd MMM',
    //       //   hour: 'HH:mm'
    //       // },
    //       // tickPlacement: "between",
    //       // formatter: (value, timestamp, index) => {
    //       //   // console.log('formatter',timestamp, parseInt(value));
    //       //   return this.formatDataItemKey(value);
    //       // },
    //       style: {
    //         colors: [],
    //         fontSize: '12px',
    //         cssClass: 'apexcharts-xaxis-label'
    //       },
    //       offsetX: 0,
    //       offsetY: 0
    //     }
    //   },
    //   selection: {
    //     enabled: true
    //   }
    // };
    // if (
    //   !this.props.config.chartOptions ||
    //   !this.props.config.chartOptions.chart
    // ) {
    //   console.log("no config found for 'chartOptions'. setting default");
    //   const config = {
    //     id: this.props.id,
    //     config: this.props.config.set('chartOptions', baseChartOptions)
    //   };
    //   this.props.onSettingChange(config);
    // }
  }

  componentDidUpdate(prevProps: AllWidgetSettingProps<IMConfig>) {
    // we may not need this check.
    // it could be that we will always want to re-run the query
    let props = this.state.checkProps;
    for (let i = 0; i < props.length; i++) {
      if (
        this.props.config[props[i]] !== prevProps.config[props[i]] &&
        this.isDsConfigured()
      ) {
        console.log(
          'ds is configured and there is a prop change. time to re-query!'
        );

        // re-run query
        this.query();
        break;
      }
    }

    // props = this.state.chartProps;
    // for (let i = 0; i < props.length; i++) {
    //   if (
    //     this.props.config[props[i]] !== prevProps.config[props[i]] &&
    //     this.isDsConfigured()
    //   ) {
    //     console.log(
    //       'ds is configured and there is a prop change. time to update the chart props'
    //     );

    //     const propName = props[i];
    //     const propValue = this.props.config[props[i]];
    //     let currentChartConfig = this.props.config.chartOptions;
    //     if (propName === 'useDataLabels') {
    //       currentChartConfig.dataLabels.enabled = propValue;
    //     }

    //     const config = {
    //       id: this.props.id,
    //       config: this.props.config.set('chartOptions', currentChartConfig)
    //     };

    //     this.props.onSettingChange(config);
    //     break;
    //   }
    // }
  }

  updateDataLabels(use) {
    let currentChartConfig = this.props.config.chartOptions;
    currentChartConfig.dataLabels.enabled = use;
    const config = {
      id: this.props.id,
      config: this.props.config.set('chartOptions', currentChartConfig)
    };
    this.props.onSettingChange(config);
  }

  onPropChange = (propKey: string, propValue: any) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set(propKey, propValue)
    };
    // save to config file
    this.props.onSettingChange(config);
  };

  isDsConfigured = () => {
    // console.log('isDsConfigured ===>');
    if (
      this.props.useDataSources &&
      this.props.useDataSources?.length === 1 &&
      this.props.config.xAxisField &&
      this.props.config.yAxisField
    ) {
      console.log('ds IS configured!');
      // const dId = this.props.useDataSources[0].dataSourceId;
      // const ds = DataSourceManager.getInstance().getDataSource(dId);
      // let label = ds.getLabel();
      // if (ds.parentDataSource) {
      //   const parentLabel = ds.parentDataSource.getLabel();
      //   label = `${parentLabel} - ${label}`;
      // }
      // this.setState({ chartLabel: label });
      return true;
    }
    console.log('ds IS NOT configured!');
    return false;
  };

  formatDataItemKey(invalue) {
    const dte = new Date(invalue);
    return `${dte.getDate() + 1}-${dte.getMonth() + 1}-${dte.getFullYear()}`;
  }

  transformFeaturesToSeries(
    features,
    xAxisField,
    xAxisAgg,
    yAxisField,
    yAxisLabelField
  ) {
    let pivoted = {};
    features.forEach((feature) => {
      if (!pivoted[feature.attributes[yAxisField]]) {
        pivoted[feature.attributes[yAxisField]] = {
          data: [],
          label: feature.attributes[yAxisLabelField]
        };
      }
      pivoted[feature.attributes[yAxisField]].data.push({
        [feature.attributes[xAxisField]]: feature.attributes[xAxisAgg]
      });
    });
    return Object.keys(pivoted).map((key) => ({
      name: pivoted[key].label,
      data: pivoted[key].data.map((dataItem) => {
        const dataItemKey = Object.keys(dataItem)[0];
        return {
          x: this.formatDataItemKey(parseInt(dataItemKey, 0)),
          y: dataItem[dataItemKey]
        };
      })
    }));
  }

  convertEsriGeomTypeToFLCType(geometryType) {
    switch (geometryType) {
      case 'esriGeometryPoint':
        return 'point';
      case 'esriGeometryMultipoint':
        return 'multipoint';
      case 'esriGeometryPolygon':
        return 'polygon';
      case 'esriGeometryPolyline':
        return 'line';
      default:
        return 'point';
    }
  }

  convertEsriFieldTypeToFLCType(sampleValue) {
    switch (typeof sampleValue) {
      case 'number':
        return Number.isInteger(sampleValue) ? 'integer' : 'double';
      case 'string':
        return 'string';
      default:
        return 'string';
    }
  }

  convertRecordsToFeatures(records) {
    return records.map((rec, i) => {
      let feature = JSON.parse(JSON.stringify(rec.feature));
      feature.attributes['oid'] = i + 1;
      return feature;
    });
  }

  query = () => {
    // if (!this.isDsConfigured()) {
    //   return;
    // }

    let where = '1=1';
    if (this.props.config.useWhereClause) {
      where = this.props.config.whereClause;
    }

    const orderByFields = [`${this.props.config.yAxisField} ASC`];

    let query = {
      where,
      orderByFields
    };

    if (this.props.config.useStats) {
      const outStatistics = [
        {
          statisticType: this.props.config.statsType,
          onStatisticField: this.props.config.metricField,
          outStatisticFieldName: `${this.props.config.statsType}_${this.props.config.metricField}`
        }
      ];
      let groupByFieldsForStatistics = [
        this.props.config.xAxisField,
        this.props.config.yAxisField
      ];
      if (
        this.props.config.useYAxisFieldLabel &&
        this.props.config.yAxisFieldLabel &&
        this.props.config.yAxisFieldLabel !== ''
      ) {
        groupByFieldsForStatistics.push(this.props.config.yAxisFieldLabel);
      }
      query['outStatistics'] = outStatistics;
      query['groupByFieldsForStatistics'] = groupByFieldsForStatistics;
    } else {
      query['outFields'] = [
        this.props.config.xAxisField,
        this.props.config.yAxisField
      ];

      if (
        this.props.config.useYAxisFieldLabel &&
        this.props.config.yAxisFieldLabel &&
        this.props.config.yAxisFieldLabel !== ''
      ) {
        query['outFields'].push(this.props.config.yAxisFieldLabel);
      }
    }

    console.log('query', query);

    this.setState({ query });
  };

  chartRender = (ds: DataSource, info: IMDataSourceInfo) => {
    if (ds && ds.getStatus() === DataSourceStatus.Loaded) {
      let records = ds.getRecords();

      const features = this.convertRecordsToFeatures(records);
      const formattedFields: Array<Object> = Object.keys(
        records[0].feature.attributes
      ).map((att) => {
        return {
          name: att,
          alias: att,
          type: this.convertEsriFieldTypeToFLCType(
            records[0].feature.attributes[att]
          )
        };
      });
      formattedFields.push({ name: 'OBJECTID', type: 'oid' });

      const xAxisAgg = `${this.props.config.statsType}_${this.props.config.metricField}`;

      let yAxisFieldLabel = this.props.config.yAxisField;

      const seriesData = this.transformFeaturesToSeries(
        features,
        this.props.config.xAxisField,
        xAxisAgg,
        this.props.config.yAxisField,
        yAxisFieldLabel
      );

      const config = {
        id: this.props.id,
        config: this.props.config.set('seriesData', seriesData)
      };
      this.props.onSettingChange(config);

      return null;
    }
    return null;
  };

  handleDataSourceCreated = (ds: DataSource) => {
    this.setState({ selectedDataSource: ds });
  };

  render() {
    return (
      <div className="use-feature-layer-setting p-2">
        <SettingSection title="Select Data Source">
          <SettingRow>
            <DataSourceSelector
              types={this.supportedTypes}
              useDataSources={this.props.useDataSources}
              useDataSourcesEnabled={this.props.useDataSourcesEnabled}
              widgetId={this.props.id}
              onToggleUseDataEnabled={(useDataSourcesEnabled: boolean) => {
                this.props.onSettingChange({
                  id: this.props.id,
                  useDataSourcesEnabled
                });
              }}
              onChange={(useDataSources: UseDataSource[]) => {
                this.props.onSettingChange({
                  id: this.props.id,
                  useDataSources: useDataSources
                });
              }}
            />
          </SettingRow>
        </SettingSection>

        {this.props.useDataSourcesEnabled &&
          this.props.useDataSources &&
          this.props.useDataSources.length > 0 && (
            <>
              {/* Chart Title */}
              <SettingSection title="Chart Title">
                <SettingRow>
                  <TextInput
                    value={this.props.config.chartTitle}
                    onAcceptValue={(value: string) =>
                      this.onPropChange('chartTitle', value)
                    }
                  />
                </SettingRow>
              </SettingSection>

              {/* Where Clause */}
              <SettingSection title="Subset Data">
                <Label className="mt-4 w-75 d-inline-block font-dark-600">
                  Use Where Clause
                  <Switch
                    aria-label="test"
                    className="ml-2"
                    checked={this.props.config.useWhereClause}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                      checked: boolean
                    ) => this.onPropChange('useWhereClause', checked)}
                  />
                </Label>
                {!!this.props.config.useWhereClause && (
                  <SettingRow>
                    <Label className="w-75 d-inline-block font-dark-600">
                      Where Clause
                      <TextInput
                        placeholder="1=1"
                        value={this.props.config.whereClause}
                        onAcceptValue={(value: string) =>
                          this.onPropChange('whereClause', value)
                        }
                      />
                    </Label>
                  </SettingRow>
                )}
              </SettingSection>

              <SettingSection title="Select Metric to Chart">
                <SettingRow>
                  <FieldSelector
                    useDropdown={true}
                    useDataSources={this.props.useDataSources}
                    selectedFields={Immutable([this.props.config.metricField])}
                    onChange={(allSelectedFields: IMFieldSchema[]) =>
                      this.onPropChange(
                        'metricField',
                        allSelectedFields[0].jimuName
                      )
                    }
                  />
                </SettingRow>
                <Label className="mt-4 w-75 d-inline-block font-dark-600">
                  Use Statistics
                  <Switch
                    aria-label="test"
                    className="ml-2"
                    checked={this.props.config.useStats}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                      checked: boolean
                    ) => this.onPropChange('useStats', checked)}
                  />
                </Label>
                {!!this.props.config.useStats && (
                  <SettingRow>
                    <Label className="w-75 d-inline-block font-dark-600">
                      Statistic Type
                      <Select
                        value={this.props.config.statsType}
                        onChange={(evt: any) =>
                          this.onPropChange('statsType', evt.target.value)
                        }
                      >
                        <Option value="sum">SUM</Option>
                        <Option value="cnt">COUNT</Option>
                        <Option value="max">MAX</Option>
                        <Option value="min">MIN</Option>
                        <Option value="avg">AVG</Option>
                      </Select>
                    </Label>
                  </SettingRow>
                )}
              </SettingSection>

              <SettingSection title="Select Y Axis Field">
                <SettingRow>
                  <FieldSelector
                    useDropdown={true}
                    useDataSources={this.props.useDataSources}
                    selectedFields={Immutable([this.props.config.yAxisField])}
                    onChange={(allSelectedFields: IMFieldSchema[]) =>
                      this.onPropChange(
                        'yAxisField',
                        allSelectedFields[0].jimuName
                      )
                    }
                  />
                </SettingRow>
                <Label className="mt-4 w-75 d-inline-block font-dark-600">
                  Y-Axis Field for Label
                  <Switch
                    aria-label="test"
                    className="ml-2"
                    checked={this.props.config.useYAxisFieldLabel}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                      checked: boolean
                    ) => this.onPropChange('useYAxisFieldLabel', checked)}
                  />
                </Label>

                {!!this.props.config.useYAxisFieldLabel && (
                  <SettingRow>
                    <FieldSelector
                      useDropdown={true}
                      useDataSources={this.props.useDataSources}
                      selectedFields={Immutable([
                        this.props.config.yAxisFieldLabel
                      ])}
                      onChange={(allSelectedFields: IMFieldSchema[]) =>
                        this.onPropChange(
                          'yAxisFieldLabel',
                          allSelectedFields[0].jimuName
                        )
                      }
                    />
                  </SettingRow>
                )}
              </SettingSection>

              <SettingSection title="Select Date Field (x axis)">
                <SettingRow>
                  <FieldSelector
                    useDropdown={true}
                    useDataSources={this.props.useDataSources}
                    selectedFields={Immutable([this.props.config.xAxisField])}
                    onChange={(allSelectedFields: IMFieldSchema[]) =>
                      this.onPropChange(
                        'xAxisField',
                        allSelectedFields[0].jimuName
                      )
                    }
                  />
                </SettingRow>
              </SettingSection>

              <SettingSection title="Chart Style Options">
                <SettingRow>
                  <Label className="mt-4 w-75 d-inline-block font-dark-600">
                    Number of Classes
                    <NumericInput
                      value={this.props.config.numClasses}
                      onChange={(value: number) =>
                        this.onPropChange('numClasses', value)
                      }
                    />
                  </Label>
                </SettingRow>
                <SettingRow>
                  <Label className="mt-4 w-75 d-inline-block font-dark-600">
                    Color Ramp
                    <Select
                      value={this.props.config.selectedColorRamp}
                      // onChange={this.onColorRampChange}
                    >
                      {/* {this.state.availableColorRamps &&
                        this.state.availableColorRamps.map((ramp) => (
                          <Option value={ramp.name}>{ramp.name}</Option>
                        ))} */}
                    </Select>
                  </Label>
                </SettingRow>
                <SettingRow>
                  <Label className="mt-4 w-75 d-inline-block font-dark-600">
                    Use Data Labels
                    <Switch
                      aria-label="test"
                      className="ml-2"
                      checked={this.props.config.useDataLabels}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                        checked: boolean
                      ) => {
                        this.onPropChange('useDataLabels', checked);
                      }}
                    />
                  </Label>
                </SettingRow>
              </SettingSection>
              <DataSourceComponent
                useDataSource={this.props.useDataSources[0]}
                query={this.state.query && this.state.query}
                widgetId={this.props.id}
                queryCount
                onDataSourceCreated={this.handleDataSourceCreated}
              >
                {this.chartRender}
              </DataSourceComponent>
            </>
          )}
      </div>
    );
  }
}
