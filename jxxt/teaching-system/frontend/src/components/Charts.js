import React from 'react';
import { Card, Spin, Empty } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

/**
 * ECharts 仪表盘图表组件集合
 * 所有图表支持暗色主题切换（通过 isDark 属性）
 */

// 默认颜色方案
const lightColors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];
const darkTextColor = '#e0e0e0';
const lightTextColor = '#333';

/**
 * 通用图表容器
 */
const ChartWrapper = ({ title, loading, error, isEmpty, emptyText, children, height }) => {
  if (loading) {
    return (
      <Card title={title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height || 300 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height || 300 }}>
          <Empty description={<span style={{ color: '#ff4d4f' }}>加载失败：{error}</span>} />
        </div>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card title={title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height || 300 }}>
          <Empty description={emptyText || '暂无数据'} />
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} bodyStyle={{ padding: '12px 0' }}>
      {children}
    </Card>
  );
};

/**
 * 饼图组件 - 用于课程/用户分布
 *
 * Props:
 *  - title: 图表标题
 *  - data: [{ name, value }]
 *  - isDark: 暗色主题
 *  - loading / error: 状态
 *  - height: 高度
 */
export const PieChart = ({
  title,
  data = [],
  isDark = false,
  loading = false,
  error = null,
  height = 300,
}) => {
  const isEmpty = !data || data.length === 0;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: isDark ? darkTextColor : lightTextColor },
    },
    color: lightColors,
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark ? '#1f1f1f' : '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data,
      },
    ],
  };

  return (
    <ChartWrapper title={title} loading={loading} error={error} isEmpty={isEmpty} height={height}>
      <ReactECharts option={option} style={{ height }} theme={isDark ? 'dark' : undefined} />
    </ChartWrapper>
  );
};

/**
 * 柱状图组件 - 用于作业统计
 *
 * Props:
 *  - title: 图表标题
 *  - data: [{ name, value }]
 *  - xKey: x轴字段名，默认 'name'
 *  - yKey: y轴字段名，默认 'value'
 *  - isDark: 暗色主题
 *  - loading / error: 状态
 *  - height: 高度
 *  - color: 柱状图颜色
 */
export const BarChart = ({
  title,
  data = [],
  xKey = 'name',
  yKey = 'value',
  isDark = false,
  loading = false,
  error = null,
  height = 300,
  color = '#1890ff',
}) => {
  const isEmpty = !data || data.length === 0;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item[xKey]),
      axisLabel: {
        color: isDark ? darkTextColor : lightTextColor,
        rotate: data.length > 6 ? 30 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: isDark ? darkTextColor : lightTextColor,
      },
      splitLine: {
        lineStyle: { color: isDark ? '#333' : '#eee' },
      },
    },
    series: [
      {
        name: title,
        type: 'bar',
        data: data.map((item) => item[yKey]),
        itemStyle: {
          color,
          borderRadius: [4, 4, 0, 0],
        },
        barMaxWidth: 50,
      },
    ],
  };

  return (
    <ChartWrapper title={title} loading={loading} error={error} isEmpty={isEmpty} height={height}>
      <ReactECharts option={option} style={{ height }} theme={isDark ? 'dark' : undefined} />
    </ChartWrapper>
  );
};

/**
 * 折线图组件 - 用于趋势
 *
 * Props:
 *  - title: 图表标题
 *  - data: [{ name, value }]
 *  - xKey: x轴字段名，默认 'name'
 *  - yKey: y轴字段名，默认 'value'
 *  - isDark: 暗色主题
 *  - loading / error: 状态
 *  - height: 高度
 *  - color: 折线颜色
 *  - areaStyle: 是否显示面积填充
 */
export const LineChart = ({
  title,
  data = [],
  xKey = 'name',
  yKey = 'value',
  isDark = false,
  loading = false,
  error = null,
  height = 300,
  color = '#1890ff',
  areaStyle = true,
}) => {
  const isEmpty = !data || data.length === 0;

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item[xKey]),
      axisLabel: {
        color: isDark ? darkTextColor : lightTextColor,
      },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: isDark ? darkTextColor : lightTextColor,
      },
      splitLine: {
        lineStyle: { color: isDark ? '#333' : '#eee' },
      },
    },
    series: [
      {
        name: title,
        type: 'line',
        data: data.map((item) => item[yKey]),
        smooth: true,
        lineStyle: { color, width: 3 },
        itemStyle: { color },
        areaStyle: areaStyle
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: `${color}40` },
                  { offset: 1, color: `${color}05` },
                ],
              },
            }
          : undefined,
      },
    ],
  };

  return (
    <ChartWrapper title={title} loading={loading} error={error} isEmpty={isEmpty} height={height}>
      <ReactECharts option={option} style={{ height }} theme={isDark ? 'dark' : undefined} />
    </ChartWrapper>
  );
};

/**
 * 带趋势箭头的统计卡片
 *
 * Props:
 *  - title: 卡片标题
 *  - value: 数值
 *  - prefix: 前缀图标（React 节点）
 *  - trend: 趋势值，正数上升，负数下降
 *  - trendLabel: 趋势描述，如 "较上月"
 *  - color: 数值颜色
 *  - loading: 加载状态
 */
export const StatCard = ({
  title,
  value,
  prefix,
  trend,
  trendLabel = '较上期',
  color = '#1890ff',
  loading = false,
}) => {
  const trendUp = trend > 0;
  const trendDown = trend < 0;
  const trendColor = trendUp ? '#52c41a' : trendDown ? '#ff4d4f' : '#999';

  return (
    <Card hoverable>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <Spin />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#999', fontSize: 14 }}>{title}</span>
            {prefix && (
              <span style={{ fontSize: 24, color }}>
                {prefix}
              </span>
            )}
          </div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color, lineHeight: 1.2 }}>
            {value ?? '-'}
          </div>
          {trend !== undefined && trend !== null && (
            <div style={{ marginTop: 8, fontSize: 13, color: trendColor }}>
              {trendUp ? <ArrowUpOutlined /> : trendDown ? <ArrowDownOutlined /> : null}
              <span style={{ marginLeft: 4 }}>
                {trendUp ? '+' : ''}{trend}{trendUp ? '%' : trendDown ? '%' : ''}
              </span>
              {trendLabel && (
                <span style={{ color: '#999', marginLeft: 6 }}>{trendLabel}</span>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
};