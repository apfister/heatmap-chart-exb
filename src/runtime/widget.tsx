import {
  React,
  AllWidgetProps,
  IMDataSourceInfo,
  DataSource,
  DataSourceStatus,
  DataSourceComponent
  // DataSourceManager,
  // FeatureLayerQueryParams,
} from 'jimu-core';

import Chart from 'react-apexcharts';
// import FeatureLayer = require('esri/layers/FeatureLayer');
import { IMConfig } from '../config';

interface State {
  chartLabel: string;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  State
> {
  state = {
    query: null,
    chartLabel: 'my chart',
    flipColors: false,
    aggFeatureLayer: null,
    rendererClass: null,
    symbolUtils: null,
    numClasses: 4,
    selectedScheme: 'Blue 23',
    colorSchemes: [],
    showDataLabels: false,
    options: {
      chart: {
        type: 'heatmap',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          },
          width: '100%'
        },
        events: {
          selection: function (chartContext, { xaxis, yaxis }) {
            console.log('selection', chartContext, { xaxis, yaxis });
          },
          click: function (chartContext, { xaxis, yaxis }) {
            console.log('click', chartContext, { xaxis, yaxis });
          },
          dataPointSelection: function (event, chartContext, config) {
            console.log('dataPointSelection', event, chartContext, config);
          }
        }
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.1,
          useFillColorAsStroke: false,
          radius: 0,
          colorScale: {
            ranges: []
          }
        }
      },
      dataLabels: { enabled: false, style: { colors: ['#104c6d'] } },
      xaxis: {
        labels: {
          show: true,
          rotate: -45,
          rotateAlways: true,
          trim: true,
          maxHeight: 120,
          // datetimeFormatter: {
          //   year: 'yyyy',
          //   month: 'MMM \'yy',
          //   day: 'dd MMM',
          //   hour: 'HH:mm'
          // },
          // tickPlacement: "between",
          // formatter: (value, timestamp, index) => {
          //   // console.log('formatter',timestamp, parseInt(value));
          //   return this.formatDataItemKey(value);
          // },
          style: {
            colors: [],
            fontSize: '12px',
            cssClass: 'apexcharts-xaxis-label'
          },
          offsetX: 0,
          offsetY: 0
        }
      },
      selection: {
        enabled: true
      }
    },
    series: []
  };

  props: any;

  componentDidMount() {
    // this.query();
    console.log('componentDidMount');
  }

  // query = () => {
  //   if (!this.isDsConfigured()) {
  //     return;
  //   }

  //   let where = '1=1';
  //   if (this.props.config.useWhereClause) {
  //     where = this.props.config.whereClause;
  //   }

  //   const orderByFields = [`${this.props.config.yAxisField} ASC`];

  //   let query = {
  //     where,
  //     orderByFields
  //   };

  //   if (this.props.config.useStats) {
  //     const outStatistics = [
  //       {
  //         statisticType: this.props.config.statsType,
  //         onStatisticField: this.props.config.metricField,
  //         outStatisticFieldName: `${this.props.config.statsType}_${this.props.config.metricField}`
  //       }
  //     ];
  //     let groupByFieldsForStatistics = [
  //       this.props.config.xAxisField,
  //       this.props.config.yAxisField
  //     ];
  //     if (
  //       this.props.config.useYAxisFieldLabel &&
  //       this.props.config.yAxisFieldLabel &&
  //       this.props.config.yAxisFieldLabel !== ''
  //     ) {
  //       groupByFieldsForStatistics.push(this.props.config.yAxisFieldLabel);
  //     }
  //     query['outStatistics'] = outStatistics;
  //     query['groupByFieldsForStatistics'] = groupByFieldsForStatistics;
  //   } else {
  //     query['outFields'] = [
  //       this.props.config.xAxisField,
  //       this.props.config.yAxisField
  //     ];

  //     if (
  //       this.props.config.useYAxisFieldLabel &&
  //       this.props.config.yAxisFieldLabel &&
  //       this.props.config.yAxisFieldLabel !== ''
  //     ) {
  //       query['outFields'].push(this.props.config.yAxisFieldLabel);
  //     }
  //   }

  //   console.log('query', query);

  //   this.setState({ query });
  // };

  // isDsConfigured = () => {
  //   console.log('isDsConfigured ===>');
  //   if (
  //     this.props.useDataSources &&
  //     this.props.useDataSources?.length === 1 &&
  //     this.props.config.xAxisField &&
  //     this.props.config.yAxisField
  //   ) {
  //     console.log('configured!');
  //     const dId = this.props.useDataSources[0].dataSourceId;
  //     const ds = DataSourceManager.getInstance().getDataSource(dId);
  //     let label = ds.getLabel();
  //     if (ds.parentDataSource) {
  //       const parentLabel = ds.parentDataSource.getLabel();
  //       label = `${parentLabel} - ${label}`;
  //     }
  //     this.setState({ chartLabel: label });
  //     return true;
  //   }
  //   console.log('NOT configured!');
  //   return false;
  // };

  // formatDataItemKey(invalue) {
  //   const dte = new Date(invalue);
  //   return `${dte.getDate() + 1}-${dte.getMonth() + 1}-${dte.getFullYear()}`;
  // }

  // transformFeaturesToSeries(
  //   features,
  //   xAxisField,
  //   xAxisAgg,
  //   yAxisField,
  //   yAxisLabelField
  // ) {
  //   let pivoted = {};
  //   features.forEach((feature) => {
  //     if (!pivoted[feature.attributes[yAxisField]]) {
  //       pivoted[feature.attributes[yAxisField]] = {
  //         data: [],
  //         label: feature.attributes[yAxisLabelField]
  //       };
  //     }
  //     pivoted[feature.attributes[yAxisField]].data.push({
  //       [feature.attributes[xAxisField]]: feature.attributes[xAxisAgg]
  //     });
  //   });
  //   return Object.keys(pivoted).map((key) => ({
  //     name: pivoted[key].label,
  //     data: pivoted[key].data.map((dataItem) => {
  //       const dataItemKey = Object.keys(dataItem)[0];
  //       return {
  //         x: this.formatDataItemKey(parseInt(dataItemKey, 0)),
  //         y: dataItem[dataItemKey]
  //       };
  //     })
  //   }));
  // }

  // convertEsriGeomTypeToFLCType(geometryType) {
  //   switch (geometryType) {
  //     case 'esriGeometryPoint':
  //       return 'point';
  //     case 'esriGeometryMultipoint':
  //       return 'multipoint';
  //     case 'esriGeometryPolygon':
  //       return 'polygon';
  //     case 'esriGeometryPolyline':
  //       return 'line';
  //     default:
  //       return 'point';
  //   }
  // }

  // convertEsriFieldTypeToFLCType(sampleValue) {
  //   switch (typeof sampleValue) {
  //     case 'number':
  //       return Number.isInteger(sampleValue) ? 'integer' : 'double';
  //     case 'string':
  //       return 'string';
  //     default:
  //       return 'string';
  //   }
  // }

  // convertRecordsToFeatures(records) {
  //   return records.map((rec, i) => {
  //     let feature = JSON.parse(JSON.stringify(rec.feature));
  //     feature.attributes['oid'] = i + 1;
  //     return feature;
  //   });
  // }

  // chartRender = (ds: DataSource, info: IMDataSourceInfo) => {
  //   console.log('chartRender');
  //   const xAxisField = this.props.config.xAxisField;
  //   const yAxisField = this.props.config.yAxisField;

  //   let records = [];
  //   if (ds && ds.getStatus() === DataSourceStatus.Loaded) {
  //     records = ds.getRecords();

  //     const features = this.convertRecordsToFeatures(records);
  //     const formattedFields: Array<Object> = Object.keys(
  //       records[0].feature.attributes
  //     ).map((att) => {
  //       return {
  //         name: att,
  //         alias: att,
  //         type: this.convertEsriFieldTypeToFLCType(
  //           records[0].feature.attributes[att]
  //         )
  //       };
  //     });
  //     formattedFields.push({ name: 'OBJECTID', type: 'oid' });

  //     const xAxisAgg = `${this.props.config.statsType}_${this.props.config.metricField}`;
  //     let yAxisFieldLabel = this.props.config.yAxisField;
  //     if (
  //       this.props.config.useYAxisFieldLabel &&
  //       this.props.config.yAxisFieldLabel &&
  //       this.props.config.yAxisFieldLabel !== ''
  //     ) {
  //       yAxisFieldLabel = this.props.config.yAxisFieldLabel;
  //     }
  //     const seriesData = this.transformFeaturesToSeries(
  //       features,
  //       this.props.config.xAxisField,
  //       xAxisAgg,
  //       this.props.config.yAxisField,
  //       yAxisFieldLabel
  //     );

  //     this.setState({ series: seriesData });

  //     // const ramps = [{ name: 'test' }, { name: 'hello' }, { name: 'world' }];

  //     return (
  //       <>
  //         <Chart
  //           options={this.state.options}
  //           series={this.state.series}
  //           type="heatmap"
  //           width="100%"
  //           height="100%"
  //         />
  //         {this.props.config && <div>{JSON.stringify(this.props.config)}</div>}
  //       </>
  //     );
  //   }

  //   return <div>unable to query data layer</div>;
  // };

  // createOutputDs(useDs: DataSource) {
  //   if (!this.props.outputDataSources) {
  //     return;
  //   }
  //   const outputDsId = this.props.outputDataSources[0];
  //   const dsManager = DataSourceManager.getInstance();
  //   if (dsManager.getDataSource(outputDsId)) {
  //     if (
  //       dsManager.getDataSource(outputDsId).getDataSourceJson()
  //         .originDataSources[0].dataSourceId !== useDs.id
  //     ) {
  //       dsManager.destroyDataSource(outputDsId);
  //     }
  //   }
  //   dsManager.createDataSource(outputDsId).then((ods) => {
  //     ods.setRecords(useDs.getRecords());
  //   });
  // }

  chartRender = (ds: DataSource, info: IMDataSourceInfo) => {
    if (ds && ds.getStatus() === DataSourceStatus.Loaded) {
      let records = ds.getRecords();

      return (
        <>
          <Chart
            options={this.props.config.chartOptions}
            series={this.props.config.chartSeries}
            type="heatmap"
            width="100%"
            height="100%"
          />
          {this.props.config && <div>{JSON.stringify(this.props.config)}</div>}
        </>
      );
    }
  };

  render() {
    // if (!this.isDsConfigured()) {
    //   return (
    //     <h3>
    //       To use this widget, you must first connect to and configure a Data
    //       Source
    //     </h3>
    //   );
    // }
    return (
      <div
        className="widget-use-feature-layer"
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '800px',
          overflow: 'auto'
        }}
      >
        {/* {this.props.useDataSources &&
          this.props.useDataSources.length === 1 &&
          this.props.useDataSources[0] &&
          this.state.chartLabel} */}

        {/* <DataSourceComponent
          useDataSource={this.props.useDataSources[0]}
          query={this.state.query}
          widgetId={this.props.id}
          queryCount
        >
          {this.chartRender}
        </DataSourceComponent> */}

        {/* <Chart
          options={this.props.config.chartOptions}
          series={this.props.config.chartSeries}
          type="heatmap"
          width="100%"
          height="100%"
        /> */}
        {this.props.config && <div>{JSON.stringify(this.props.config)}</div>}
      </div>
    );
  }
}
