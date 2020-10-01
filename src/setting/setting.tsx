import {
  React,
  Immutable,
  IMFieldSchema,
  UseDataSource,
  IMDataSourceInfo,
  DataSource,
  DataSourceStatus,
  DataSourceComponent,
  DataRecord
} from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { ArcGISDataSourceTypes, loadArcGISJSAPIModules } from 'jimu-arcgis';
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
  TextInput,
  NumericInput
} from 'jimu-ui';

import { IMConfig } from '../config';

import _ = require('lodash');

import FeatureLayer = require('esri/layers/FeatureLayer');
import colorRendererCreator = require('esri/smartMapping/renderers/color');
import colorSchemes = require('esri/smartMapping/symbology/color');
import FeatureSet = require('esri/tasks/support/FeatureSet');
import Query = require('esri/tasks/support/Query');

interface IState {
  query: Query;
  selectedDataSource: DataSource;
  chartProps: Array<string>;
  checkProps: Array<string>;
  aggFeatureLayer: FeatureLayer;
}
export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<IMConfig>,
  IState
> {
  supportedTypes = Immutable([ArcGISDataSourceTypes.FeatureLayer]);
  props: any;
  state: any;

  constructor(props) {
    super(props);

    this.state = {
      selectedDataSource: null,
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
        'selectedColorRamp'
      ],
      chartProps: ['useDataLabels'],
      aggFeatureLayer: null,
      query: null
    };
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
        const query = this.getQueryObject();
        this.setState({ query }, this.query);
        break;
      }
    }

    console.log('componentDidUpdate :: configured??', this.isDsConfigured());
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
    if (
      this.props.useDataSources &&
      this.props.useDataSources?.length === 1 &&
      this.props.config.xAxisField &&
      this.props.config.yAxisField
    ) {
      console.log('ds IS configured!');
      return true;
    }
    console.log('ds IS NOT configured!');
    return false;
  };

  formatDataItemKey(invalue) {
    const dte = new Date(invalue);
    return `${dte.getDate() + 1}-${dte.getMonth() + 1}-${dte.getFullYear()}`;
  }

  transformFeaturesToSeries(features) {
    const dteField = this.props.config.xAxisField;
    const groupByField = this.props.config.yAxisField;
    let metricField = this.props.config.metricField;
    if (this.props.config.useStats) {
      metricField = `${this.props.config.statsType}_${this.props.config.metricField}`;
    }

    let allDates = [];

    return (
      _.chain(features)
        // collect all the dates
        .forEach((feature) => {
          if (!allDates.includes(feature.attributes[dteField])) {
            allDates.push(feature.attributes[dteField]);
          }
        })
        .groupBy(`attributes.${groupByField}`)
        .map((value, key) => {
          const data = _.map(value, (feature) => {
            return {
              x: feature.attributes[dteField],
              y: feature.attributes[metricField]
            };
          });
          return { name: key, data };
        })
        .each((item) => {
          const dtes = _.map(item.data, 'x');
          const diff = _.difference(allDates, dtes);
          _.each(diff, (dte) => {
            item.data.push({
              x: dte,
              y: 0
            });
            item.data.sort((a, b) => {
              const result = new Date(a.x) > new Date(b.x) ? 1 : -1;
              return result;
            });
          });
        })
        .value()
    );
  }

  transformFeaturesToSeries2(
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
        // console.log(dataItemKey, Date.parse(dataItemKey));
        return {
          // x: this.formatDataItemKey(parseInt(dataItemKey, 0)),
          x: parseInt(dataItemKey),
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

  getQueryObject = () => {
    console.log('query!!!');

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

    // console.log('query', query);

    // this.setState({ query });
    return query;
  };

  updateSeriesData = (seriesData: Array<any>) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('seriesData', seriesData)
    };
    this.props.onSettingChange(config);
  };

  getColorScheme(csName) {
    return this.props.config.availableColorRamps.filter(
      (s) => s.name === csName
    )[0];
  }

  updateRenderer(layer) {
    const xAxisAgg = `${this.props.config.statsType}_${this.props.config.metricField}`;

    let params = {
      layer: layer,
      field: xAxisAgg,
      // classificationMethod: 'standard-deviation',
      numClasses: this.props.config.numClasses
    };

    if (this.props.config.selectedColorRamp) {
      params.colorScheme = this.getColorScheme(
        this.props.config.selectedColorRamp
      );
    }

    colorRendererCreator.createClassBreaksRenderer(params).then((response) => {
      const cbInfos = response.renderer.classBreakInfos;

      let colors = cbInfos.map((i) => i.symbol.color.toHex());
      // if (this.state.flipColors) {
      //   colors = colors.reverse();
      // }
      const colorRanges = cbInfos.map((info, i) => ({
        name: info.label,
        from: info.minValue,
        to: info.maxValue,
        color: colors[i]
      }));

      const config = {
        id: this.props.id,
        config: this.props.config.set('colorRanges', colorRanges)
      };
      this.props.onSettingChange(config);
    });
  }

  query = () => {
    console.log('query', '===> querying for data ..');
    if (
      this.state.selectedDataSource &&
      this.state.selectedDataSource.getStatus() === DataSourceStatus.Loaded
    ) {
      let records: DataRecord[] = this.state.selectedDataSource.getRecords();
      if (records.length === 0) {
        this.updateSeriesData([]);
        return;
      }

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

      // const xAxisAgg = `${this.props.config.statsType}_${this.props.config.metricField}`;
      // let yAxisFieldLabel = this.props.config.yAxisField;

      // const seriesData = this.transformFeaturesToSeries(
      //   features,
      //   this.props.config.xAxisField,
      //   xAxisAgg,
      //   this.props.config.yAxisField,
      //   yAxisFieldLabel
      // );

      const seriesData = this.transformFeaturesToSeries(features);

      seriesData.sort((a, b) => b.name.localeCompare(a.name));
      // console.log(seriesData);

      this.updateSeriesData(seriesData);

      // reset renderer
      const url = `${this.state.selectedDataSource.layer.url}/${this.state.selectedDataSource.layer.layerId}`;
      const fl = new FeatureLayer({ url });
      console.log('feature layer!', url);

      fl.queryFeatures(this.state.query).then((response: FeatureSet) => {
        response.features.forEach((feature, i) => {
          feature.attributes['OBJECTID'] = i + 1;
        });
        response.fields.push({ name: 'OBJECTID', type: 'oid', alias: 'oid' });

        const createdFL = new FeatureLayer({
          source: response.features,
          fields: response.fields,
          spatialReference: { wkid: 4326 },
          objectIdField: 'OBJECTID',
          geometryType: response.geometryType
        });

        const schemes = colorSchemes
          .getSchemesByTag({
            geometryType: response.geometryType,
            theme: 'high-to-low',
            includedTags: ['sequential', 'oranges', 'reds']
          })
          .sort((a, b) => {
            return a.name < b.name ? 1 : -1;
          });

        const config = {
          id: this.props.id,
          config: this.props.config.set('availableColorRamps', schemes)
        };
        this.props.onSettingChange(config);

        this.updateRenderer(createdFL);
      });
    }
  };

  handleDataSourceCreated = (ds: DataSource) => {
    console.log('handleDataSourceCreated :: ds created');
    if (!this.state.selectedDataSource) {
      this.setState(
        {
          selectedDataSource: ds
        },
        () => {
          if (this.isDsConfigured()) {
            const query = this.getQueryObject();
            this.setState({ query: query }, this.query);
          }
        }
      );
    }
  };

  handleDataSourceInfoChange = (info: IMDataSourceInfo) => {
    if (info.status === DataSourceStatus.Loaded && this.isDsConfigured()) {
      console.log('handleDataSourceInfoChange :: ds loaded. querying..', info);
      const query = this.getQueryObject();
      this.setState({ query }, this.query);
    }
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

              {/* Select Metric */}
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
                        <Option value="sum">Sum</Option>
                        <Option value="count">Count</Option>
                        <Option value="max">Max</Option>
                        <Option value="min">Min</Option>
                        <Option value="avg">Average</Option>
                        <Option value="stddev">Standard Deviation</Option>
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
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        this.onPropChange(
                          'selectedColorRamp',
                          event.target.value
                        )
                      }
                    >
                      {this.props.config.availableColorRamps &&
                        this.props.config.availableColorRamps.map((sc) => (
                          <Option value={sc.name}>
                            {/* {sc.name} */}
                            <div style={{ display: 'flex' }}>
                              {sc.colors &&
                                sc.colors.map((color, i) => {
                                  return (
                                    <div
                                      key={`${color.id}-${i}`}
                                      style={{
                                        backgroundColor: `rgb(${color.r},${color.g}, ${color.b})`,
                                        height: 20,
                                        width: 20
                                      }}
                                    ></div>
                                  );
                                })}
                            </div>
                          </Option>
                        ))}
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
                query={this.state && this.state.query}
                widgetId={this.props.id}
                onDataSourceCreated={this.handleDataSourceCreated}
                onDataSourceInfoChange={this.handleDataSourceInfoChange}
              ></DataSourceComponent>
            </>
          )}
      </div>
    );
  }
}
