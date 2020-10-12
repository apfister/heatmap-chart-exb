import { React, AllWidgetProps, AllWidgetSettingProps } from 'jimu-core';

import Chart from 'react-apexcharts';
import { IMConfig } from '../config';

interface State {
  chartOptions: object;
  chartProps: Array<any>;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  State
> {
  // state: object;
  props: any;

  constructor(props) {
    super(props);

    this.state = {
      chartProps: [
        'useDataLabels',
        'colorRanges',
        'noDataLabel',
        'noDataColor',
        'dataLabelForeColor'
      ],
      chartOptions: {
        noData: {
          text: 'No records returned'
        },
        legend: {
          show: true,
          position: 'top'
        },
        chart: {
          type: 'heatmap',
          toolbar: {
            show: false,
            tools: {
              download: true,
              selection: true,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            },
            width: '100%'
          },
          events: {
            dataPointSelection: this.dataPointSelection
          }
        },
        plotOptions: {
          heatmap: {
            shadeIntensity: 1,
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
            trim: false,
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
  }

  componentDidMount() {
    console.log('componentDidMount', this.props.config.chartOptions);
    this.updateChartOptions();
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

    if (
      this.props.config.colorRanges !== prevProps.config.colorRanges ||
      this.props.config.noDataLabel !== prevProps.config.noDataLabel ||
      this.props.config.noDataColor !== prevProps.config.noDataColor ||
      this.props.config.noDataForeColor !== prevProps.config.noDataForeColor
    ) {
      this.updateChartOptions();
      // const ndl = this.props.config.noDataLabel;
      // const ndc = this.props.config.noDataColor;

      // const newRanges = [
      //   ...[{ name: ndl, from: 0, to: 0, color: ndc, foreColor: '#631a9d' }],
      //   ...this.props.config.colorRanges
      // ];

      // this.setState((prevState) => ({
      //   chartOptions: {
      //     ...prevState.chartOptions,
      //     plotOptions: {
      //       ...prevState.chartOptions.plotOptions,
      //       heatmap: {
      //         ...prevState.chartOptions.plotOptions.heatmap,
      //         colorScale: {
      //           ...prevState.chartOptions.plotOptions.heatmap.colorScale,
      //           ranges: newRanges
      //         }
      //       }
      //     }
      //   }
      // }));
    }
  }

  updateChartOptions() {
    const ndl = this.props.config.noDataLabel;
    const ndc = this.props.config.noDataColor;
    const dlfc = this.props.config.dataLabelForeColor;

    const newRanges = [
      ...[{ name: ndl, from: 0, to: 0, color: ndc, foreColor: dlfc }],
      ...this.props.config.colorRanges
    ];

    this.setState((prevState) => ({
      chartOptions: {
        ...prevState.chartOptions,
        plotOptions: {
          ...prevState.chartOptions.plotOptions,
          heatmap: {
            ...prevState.chartOptions.plotOptions.heatmap,
            colorScale: {
              ...prevState.chartOptions.plotOptions.heatmap.colorScale,
              ranges: newRanges
            }
          }
        }
      }
    }));
  }

  selection(chartContext, { xaxis, yaxis }) {
    // console.log('selection', chartContext, { xaxis, yaxis });
  }

  click(chartContext, { xaxis, yaxis }) {
    // console.log('click', chartContext, { xaxis, yaxis });
  }

  dataPointSelection(event, chartContext, config) {
    console.log('dataPointSelection', event, chartContext, config);
    const selectedName = config.w.config.series[config.seriesIndex].name;
    const selectedValue =
      config.w.config.series[config.seriesIndex].data[
        config.selectedDataPoints[config.seriesIndex][0]
      ];
    const selectedDate = selectedValue.x;
    console.log('you clicked on ', selectedName, selectedDate);
  }

  render() {
    const placeHolderStyle = {
      backgroundColor: 'rgb(227, 227, 227)',
      border: '1px solid rgb(139, 139, 139)'
    };

    if (
      this.props.useDataSources &&
      this.props.useDataSources.length === 1 &&
      this.props.config.xAxisField &&
      this.props.config.yAxisField &&
      this.props.config.metricField
    ) {
      return (
        <div
          className="p-4"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto'
          }}
        >
          <Chart
            options={this.state.chartOptions}
            series={this.props.config.seriesData}
            type="heatmap"
            width="100%"
            height="100%"
          />
        </div>
      );
    }

    // not configured yet
    return (
      <div
        className="jimu-widget-placeholder w-100 h-100 d-flex justify-content-center align-items-center"
        style={placeHolderStyle}
      >
        <div className="d-flex flex-column align-items-center">
          <div className="img-wrapper d-flex justify-content-center align-items-center">
            <svg
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              className="jimu-icon"
              style={{ color: 'rgb(54, 54, 54)' }}
            >
              <path
                d="M16 10.05v1.104L8 15l-8-3.846V10.05l8 3.833 8-3.833zm0-3.017v1.105l-8 3.846-8-3.846V7.033l8 3.833 8-3.833zM8 1l8 3.799-8 3.799-8-3.8L8 1zm0 1.118l-5.646 2.68L8 7.48l5.646-2.681L8 2.118z"
                fill="currentColor"
                fill-rule="nonzero"
              ></path>
            </svg>
          </div>
          <div className="message-div">Heatmap Chart</div>
          {/* <p>not properly configured. please select a datasource</p> */}
        </div>
      </div>
    );
  }
}
