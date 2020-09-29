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
      ]
    };
  }

  componentDidUpdate(prevProps: AllWidgetSettingProps<IMConfig>) {
    // if (this.props.config.useWhereClause !== prevProps.config.useWhereClause) {
    //   console.log('go query!!');
    // } else {
    //   console.log("don't query!!");
    // }

    const props = this.state.checkProps;
    for (let i = 0; i < props.length; i++) {
      if (this.props.config[props[i]] !== prevProps.config[props[i]]) {
        console.log('found a break! re-query!');
        break;
      }
    }

    // if (this.props.useDataSourcesEnabled !== prevProps.useDataSourcesEnabled) {
    //   const checked = this.props.useDataSourcesEnabled;

    //   let functionConfig = Immutable(this.props.config.functionConfig);

    //   if (checked) {
    //     if (
    //       this.props.config.functionConfig.imgSourceType ===
    //       ImgSourceType.ByStaticUrl
    //     ) {
    //       functionConfig = functionConfig.set(
    //         'imgSourceType',
    //         ImgSourceType.ByDynamicUrl
    //       );
    //     }
    //   } else {
    //     if (
    //       this.props.config.functionConfig.imgSourceType ===
    //       ImgSourceType.ByDynamicUrl
    //     ) {
    //       functionConfig = functionConfig.set(
    //         'imgSourceType',
    //         ImgSourceType.ByStaticUrl
    //       );
    //     }
    //   }

    //   this.props.onSettingChange({
    //     id: this.props.id,
    //     config: this.props.config.set('functionConfig', functionConfig)
    //   });
    // }
  }

  // onFieldChange = (allSelectedFields: IMFieldSchema[]) => {
  //   this.props.onSettingChange({
  //     id: this.props.id,
  //     useDataSources: [
  //       {
  //         ...this.props.useDataSources[0],
  //         ...{ fields: allSelectedFields.map((f) => f.jimuName) }
  //       }
  //     ]
  //   });
  // };

  onXAxisFieldChange = (allSelectedFields: IMFieldSchema[]) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('xAxisField', allSelectedFields[0].jimuName)
    };
    this.props.onSettingChange(config);
  };

  onYAxisFieldChange = (allSelectedFields: IMFieldSchema[]) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('yAxisField', allSelectedFields[0].jimuName)
    };
    this.props.onSettingChange(config);
  };

  onMetricFieldChange = (allSelectedFields: IMFieldSchema[]) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set(
        'metricField',
        allSelectedFields[0].jimuName
      )
    };
    this.props.onSettingChange(config);
  };

  onUseStatsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('useStats', checked)
    };
    this.props.onSettingChange(config);
  };

  onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSourcesEnabled
    });
  };

  onStatsTypeChange = (evt: any, item?: React.Element<DropdownItemProps>) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('statsType', evt.target.value)
    };
    this.props.onSettingChange(config);
  };

  onUseWhereChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('useWhereClause', checked)
    };
    // save to config file
    this.props.onSettingChange(config);
    // update state
    // this.setState({ useWhereClause: checked }, this.query);
  };

  handleWhereClauseChange = (value: string) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('whereClause', value)
    };
    this.props.onSettingChange(config);
  };

  onUseYAxisFieldLabelChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('useYAxisFieldLabel', checked)
    };
    this.props.onSettingChange(config);
  };

  onYAxisFieldLabelChange = (allSelectedFields: IMFieldSchema[]) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set(
        'yAxisFieldLabel',
        allSelectedFields[0].jimuName
      )
    };
    this.props.onSettingChange(config);
  };

  onDataSourceChange = (useDataSources: UseDataSource[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: useDataSources
    });
  };

  onNumClassesChange = (value: number) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('numClasses', value)
    };
    this.props.onSettingChange(config);
  };

  onColorRampChange = (evt: any, item?: React.Element<DropdownItemProps>) => {
    const config = {
      id: this.props.id,
      config: this.props.config.set('selectedColorRamp', evt.target.value)
    };
    this.props.onSettingChange(config);
  };

  // START -- FROM widget.tsx
  isDsConfigured = () => {
    console.log('isDsConfigured ===>');
    if (
      this.props.useDataSources &&
      this.props.useDataSources?.length === 1 &&
      this.props.config.xAxisField &&
      this.props.config.yAxisField
    ) {
      console.log('configured!');
      const dId = this.props.useDataSources[0].dataSourceId;
      const ds = DataSourceManager.getInstance().getDataSource(dId);
      let label = ds.getLabel();
      if (ds.parentDataSource) {
        const parentLabel = ds.parentDataSource.getLabel();
        label = `${parentLabel} - ${label}`;
      }
      this.setState({ chartLabel: label });
      return true;
    }
    console.log('NOT configured!');
    return false;
  };

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
    return <div>unable to query</div>;
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
              onToggleUseDataEnabled={this.onToggleUseDataEnabled}
              onChange={this.onDataSourceChange}
              widgetId={this.props.id}
            />
          </SettingRow>
        </SettingSection>

        {this.props.useDataSourcesEnabled &&
          this.props.useDataSources &&
          this.props.useDataSources.length > 0 && (
            <>
              <SettingSection title="Subset Data">
                <Label className="mt-4 w-75 d-inline-block font-dark-600">
                  Use Where Clause
                  <Switch
                    aria-label="test"
                    className="ml-2"
                    onChange={this.onUseWhereChange}
                    checked={this.props.config.useWhereClause}
                  />
                </Label>
                {!!this.props.config.useWhereClause && (
                  <SettingRow>
                    <Label className="w-75 d-inline-block font-dark-600">
                      Where Clause
                      <TextInput
                        placeholder="1=1"
                        onAcceptValue={this.handleWhereClauseChange}
                        value={this.props.config.whereClause}
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
                    onChange={this.onMetricFieldChange}
                    selectedFields={Immutable([this.props.config.metricField])}
                  />
                </SettingRow>
                <Label className="mt-4 w-75 d-inline-block font-dark-600">
                  Use Statistics
                  <Switch
                    aria-label="test"
                    className="ml-2"
                    onChange={this.onUseStatsChange}
                    checked={this.props.config.useStats}
                  />
                </Label>
                {!!this.props.config.useStats && (
                  <SettingRow>
                    <Label className="w-75 d-inline-block font-dark-600">
                      Statistic Type
                      <Select
                        value={this.props.config.statsType}
                        onChange={this.onStatsTypeChange}
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
                    onChange={this.onYAxisFieldChange}
                    selectedFields={Immutable([this.props.config.yAxisField])}
                  />
                </SettingRow>
                <Label className="mt-4 w-75 d-inline-block font-dark-600">
                  Y-Axis Field for Label
                  <Switch
                    aria-label="test"
                    className="ml-2"
                    onChange={this.onUseYAxisFieldLabelChange}
                    checked={this.props.config.useYAxisFieldLabel}
                  />
                </Label>

                {!!this.props.config.useYAxisFieldLabel && (
                  <SettingRow>
                    <FieldSelector
                      useDropdown={true}
                      useDataSources={this.props.useDataSources}
                      onChange={this.onYAxisFieldLabelChange}
                      selectedFields={Immutable([
                        this.props.config.yAxisFieldLabel
                      ])}
                    />
                  </SettingRow>
                )}
              </SettingSection>

              <SettingSection title="Select Date Field (x axis)">
                <SettingRow>
                  <FieldSelector
                    useDropdown={true}
                    useDataSources={this.props.useDataSources}
                    onChange={this.onXAxisFieldChange}
                    selectedFields={Immutable([this.props.config.xAxisField])}
                  />
                </SettingRow>
              </SettingSection>

              <SettingSection title="Chart Style Options">
                <SettingRow>
                  <Label className="mt-4 w-75 d-inline-block font-dark-600">
                    Number of Classes
                    <NumericInput
                      size="lg"
                      onChange={this.onNumClassesChange}
                      value={this.props.config.numClasses}
                    />
                  </Label>
                </SettingRow>
                <SettingRow>
                  <Label className="mt-4 w-75 d-inline-block font-dark-600">
                    Color Ramp
                    <Select
                      value={this.props.config.selectedColorRamp}
                      onChange={this.onColorRampChange}
                    >
                      {/* {this.state.availableColorRamps &&
                        this.state.availableColorRamps.map((ramp) => (
                          <Option value={ramp.name}>{ramp.name}</Option>
                        ))} */}
                    </Select>
                  </Label>
                </SettingRow>
              </SettingSection>
              <DataSourceComponent
                useDataSource={this.props.useDataSources[0]}
                query={this.state && this.state.query && this.state.query}
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
