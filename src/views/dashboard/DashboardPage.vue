<template>
  <div class="dashboard-page">
    <h2 class="page-title">首页仪表盘</h2>

    <el-row :gutter="16" class="card-row">
      <el-col :span="6" v-for="item in summaryCards" :key="item.label">
        <el-card shadow="hover" class="summary-card">
          <div class="card-label">{{ item.label }}</div>
          <div class="card-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>节点资源使用情况</span>
          </template>
          <div ref="nodeResourceChartRef" class="chart-box"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>云边请求分配比例</span>
          </template>
          <div ref="requestDistributionChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span>系统运行趋势</span>
          </template>
          <div ref="trendChartRef" class="chart-box large-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span>当前检查点运行摘要</span>
          </template>

          <el-descriptions :column="3" border>
            <el-descriptions-item label="当前检查点编号">
              {{ checkpointSummary.currentCheckpoint }}
            </el-descriptions-item>
            <el-descriptions-item label="本轮新增请求数">
              {{ checkpointSummary.newRequestCount }}
            </el-descriptions-item>
            <el-descriptions-item label="持续活跃请求数">
              {{ checkpointSummary.activeRequestCount }}
            </el-descriptions-item>
            <el-descriptions-item label="本轮新部署副本数">
              {{ checkpointSummary.newInstanceCount }}
            </el-descriptions-item>
            <el-descriptions-item label="本轮复用副本数">
              {{ checkpointSummary.reuseInstanceCount }}
            </el-descriptions-item>
            <el-descriptions-item label="本轮回退云端请求数">
              {{ checkpointSummary.cloudFallbackCount }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { getDashboardSummary } from '../../api/dashboard'

const nodeResourceChartRef = ref()
const requestDistributionChartRef = ref()
const trendChartRef = ref()

let nodeResourceChart = null
let requestDistributionChart = null
let trendChart = null
let pollTimer = null

const summaryCards = ref([])
const checkpointSummary = ref({
  currentCheckpoint: 0,
  newRequestCount: 0,
  activeRequestCount: 0,
  newInstanceCount: 0,
  reuseInstanceCount: 0,
  cloudFallbackCount: 0
})

const nodeResourceChartData = ref({
  nodeNames: [],
  cpuUsageList: [],
  memoryUsageList: [],
  storageUsageList: []
})

const requestDistributionData = ref({
  edgeRequestCount: 0,
  cloudRequestCount: 0
})

const trendChartData = ref({
  checkpointLabels: [],
  requestCountList: [],
  avgLatencyList: [],
  coldStartCountList: [],
  reconfigurationCountList: []
})

const loadDashboardSummary = async () => {
  const res = await getDashboardSummary()
  const data = res.data || {}

  summaryCards.value = data.summaryCards || []
  checkpointSummary.value = data.checkpointSummary || {
    currentCheckpoint: 0,
    newRequestCount: 0,
    activeRequestCount: 0,
    newInstanceCount: 0,
    reuseInstanceCount: 0,
    cloudFallbackCount: 0
  }

  nodeResourceChartData.value = data.nodeResourceChart || {
    nodeNames: [],
    cpuUsageList: [],
    memoryUsageList: [],
    storageUsageList: []
  }

  requestDistributionData.value = data.requestDistribution || {
    edgeRequestCount: 0,
    cloudRequestCount: 0
  }

  trendChartData.value = data.trendChart || {
    checkpointLabels: [],
    requestCountList: [],
    avgLatencyList: [],
    coldStartCountList: [],
    reconfigurationCountList: []
  }

  renderCharts()
}

const renderNodeResourceChart = () => {
  if (!nodeResourceChartRef.value) return
  if (!nodeResourceChart) {
    nodeResourceChart = echarts.init(nodeResourceChartRef.value)
  }

  nodeResourceChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['CPU使用率', '内存使用率', '存储使用率']
    },
    xAxis: {
      type: 'category',
      data: nodeResourceChartData.value.nodeNames
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'bar',
        data: nodeResourceChartData.value.cpuUsageList
      },
      {
        name: '内存使用率',
        type: 'bar',
        data: nodeResourceChartData.value.memoryUsageList
      },
      {
        name: '存储使用率',
        type: 'bar',
        data: nodeResourceChartData.value.storageUsageList
      }
    ]
  })
}

const renderRequestDistributionChart = () => {
  if (!requestDistributionChartRef.value) return
  if (!requestDistributionChart) {
    requestDistributionChart = echarts.init(requestDistributionChartRef.value)
  }

  requestDistributionChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0
    },
    series: [
      {
        name: '请求分配',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: requestDistributionData.value.edgeRequestCount, name: '边缘侧处理' },
          { value: requestDistributionData.value.cloudRequestCount, name: '云端回退处理' }
        ],
        label: {
          formatter: '{b}\n{d}%'
        }
      }
    ]
  })
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  trendChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['请求数', '平均时延', '冷启动次数', '副本重配置次数']
    },
    xAxis: {
      type: 'category',
      data: trendChartData.value.checkpointLabels
    },
    yAxis: [
      {
        type: 'value',
        name: '请求/次数'
      },
      {
        type: 'value',
        name: '时延(ms)'
      }
    ],
    series: [
      {
        name: '请求数',
        type: 'line',
        smooth: true,
        data: trendChartData.value.requestCountList
      },
      {
        name: '平均时延',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: trendChartData.value.avgLatencyList
      },
      {
        name: '冷启动次数',
        type: 'line',
        smooth: true,
        data: trendChartData.value.coldStartCountList
      },
      {
        name: '副本重配置次数',
        type: 'line',
        smooth: true,
        data: trendChartData.value.reconfigurationCountList
      }
    ]
  })
}

const renderCharts = () => {
  renderNodeResourceChart()
  renderRequestDistributionChart()
  renderTrendChart()
}

const resizeCharts = () => {
  nodeResourceChart?.resize()
  requestDistributionChart?.resize()
  trendChart?.resize()
}

const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      await loadDashboardSummary()
    } catch (e) {
      console.warn('仪表盘轮询失败', e)
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(async () => {
  await nextTick()
  await loadDashboardSummary()
  startPolling()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  stopPolling()
  window.removeEventListener('resize', resizeCharts)
  nodeResourceChart?.dispose()
  requestDistributionChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
}

.page-title {
  margin-bottom: 16px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.card-row,
.chart-row {
  margin-bottom: 16px;
}

.summary-card {
  min-height: 96px;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.chart-box {
  width: 100%;
  height: 320px;
}

.large-chart {
  height: 360px;
}
</style>