import { React, AllWidgetProps, AllWidgetSettingProps } from 'jimu-core';

import Chart from 'react-apexcharts';
import { IMConfig } from '../config';

interface State {
  chartLabel: string;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  State
> {
  state: object;
  props: any;

  constructor(props) {
    super(props);
    this.state = {
      chartOptions: {
        noData: {
          text: 'No records returned'
        },
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
              // console.log('selection', chartContext, { xaxis, yaxis });
            },
            click: function (chartContext, { xaxis, yaxis }) {
              // console.log('click', chartContext, { xaxis, yaxis });
            },
            dataPointSelection: function (event, chartContext, config) {
              console.log('dataPointSelection', event, chartContext, config);
              const selectedName =
                config.w.config.series[config.seriesIndex].name;
              const selectedValue =
                config.w.config.series[config.seriesIndex].data[
                  config.selectedDataPoints[config.seriesIndex][0]
                ];
              const selectedDate = selectedValue.x;
              console.log('you clicked on ', selectedName, selectedDate);
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
        dataLabels: {
          enabled: this.props.config.useDataLabels,
          style: { colors: ['#104c6d'] }
        },
        xaxis: {
          labels: {
            show: true,
            // rotate: -45,
            // rotateAlways: true,
            trim: false,
            // maxHeight: 120,
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
          },
          type: 'datetime',
          datetimeFormatter: {
            year: 'yyyy',
            month: "MMM 'yy",
            day: 'dd MMM',
            hour: 'HH:mm'
          }
        },
        selection: {
          enabled: true
        }
      }
    };

    // this.myRef = React.createRef();
  }

  componentDidUpdate(prevProps: AllWidgetSettingProps<IMConfig>) {
    if (this.props.config.useDataLabels !== prevProps.config.useDataLabels) {
      // console.log('setting data labels');
      this.setState((prevState) => ({
        chartOptions: {
          ...prevState.chartOptions,
          dataLabels: {
            ...prevState.chartOptions.dataLabels,
            enabled: this.props.config.useDataLabels
          }
        }
      }));
    }
    if (this.props.config.colorRanges !== prevProps.config.colorRanges) {
      this.setState((prevState) => ({
        chartOptions: {
          ...prevState.chartOptions,
          plotOptions: {
            ...prevState.chartOptions.plotOptions,
            heatmap: {
              ...prevState.chartOptions.plotOptions.heatmap,
              colorScale: {
                ...prevState.chartOptions.plotOptions.heatmap.colorScale,
                ranges: this.props.config.colorRanges
              }
            }
          }
        }
      }));
    }
  }

  render() {
    return (
      <div
        className="widget-use-feature-layer p-4"
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '800px',
          overflow: 'auto'
        }}
      >
        <h3 className="font-h3 text-center">{this.props.config.chartTitle}</h3>
        {this.props.useDataSources && this.props.useDataSources.length === 1 ? (
          <Chart
            options={this.state.chartOptions}
            series={this.props.config.seriesData}
            type="heatmap"
            width="100%"
            height="100%"
          />
        ) : (
          <div>
            <p>not properly configured. please select a datasource</p>
          </div>
        )}
        {/* {console.log('this.props.config in the render!', this.props.config)} */}
      </div>
    );
  }
}
