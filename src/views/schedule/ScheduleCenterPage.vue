<template>
  <div class="schedule-page">
    <div class="page-header">
      <h2 class="page-title">调度运行中心</h2>
    </div>

    <el-card shadow="never" class="card-block">
      <template #header>
        <span>创建调度任务</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="Checkpoint 数量" prop="checkpointCount">
          <el-input-number v-model="form.checkpointCount" :min="1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="启用特殊情况检测" prop="enableSpecialCase">
          <el-switch v-model="form.enableSpecialCase" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="参与边缘节点" prop="selectedNodeIds">
          <el-checkbox-group v-model="form.selectedNodeIds">
            <el-checkbox v-for="item in edgeNodeOptions" :key="item.id" :label="item.id">
              {{ item.nodeName }}（{{ item.ipAddress }}:{{ item.port }}）
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleCreateTask">创建任务</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="card-block" v-if="currentTask.id">
      <template #header>
        <span>当前任务</span>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务编码">{{ currentTask.taskCode }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
        <el-descriptions-item label="任务状态">{{ currentTask.taskStatus }}</el-descriptions-item>
        <el-descriptions-item label="总Checkpoint">{{ currentTask.checkpointCount }}</el-descriptions-item>
        <el-descriptions-item label="当前Checkpoint">{{ currentTask.currentCheckpoint }}</el-descriptions-item>
      </el-descriptions>

      <div class="action-row">
        <el-button type="warning" @click="handlePrepareTask">准备任务</el-button>
        <el-button type="success" @click="handleStartTask">启动任务</el-button>
        <el-button @click="handleRefreshTask">刷新状态</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// import { onMounted, reactive, ref } from 'vue'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listNodeByPage } from '../../api/node'
import {
  createScheduleTask,
  getScheduleTaskDetail,
  nextScheduleCheckpoint,
  prepareScheduleTask,
  startScheduleTask
} from '../../api/schedule'

const formRef = ref()
const edgeNodeOptions = ref([])
const currentTask = ref({})
let pollTimer = null

const form = reactive({
  taskName: '在线调度任务',
  checkpointCount: 5,
  enableSpecialCase: 0,
  selectedNodeIds: []
})

const rules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  checkpointCount: [{ required: true, message: '请输入checkpoint数量', trigger: 'change' }],
  selectedNodeIds: [{ required: true, message: '请选择参与节点', trigger: 'change' }]
}

const loadEdgeNodes = async () => {
  const res = await listNodeByPage({
    current: 1,
    pageSize: 100,
    nodeType: 'EDGE',
    status: 'ONLINE'
  })
  edgeNodeOptions.value = res.data.records || []
}

const handleCreateTask = async () => {
  await formRef.value.validate()
  const res = await createScheduleTask({ ...form })
  currentTask.value = res.data
  ElMessage.success('任务创建成功')
}

const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(async () => {
    if (!currentTask.value.id) return
    await handleRefreshTask()

    const status = currentTask.value.taskStatus
    if (status === 'FINISHED' || status === 'FAILED' || status === 'STOPPED') {
      stopPolling()
    }
  }, 2000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const handlePrepareTask = async () => {
  await prepareScheduleTask(currentTask.value.id)
  ElMessage.success('任务准备成功')
  await handleRefreshTask()
}

const handleStartTask = async () => {
  await startScheduleTask(currentTask.value.id)
  ElMessage.success('任务启动成功，系统将自动执行全部 checkpoint')
  await handleRefreshTask()
  startPolling()
}

const handleNextCheckpoint = async () => {
  await nextScheduleCheckpoint(currentTask.value.id)
  ElMessage.success('本轮 checkpoint 执行完成')
  await handleRefreshTask()
}

const handleRefreshTask = async () => {
  const res = await getScheduleTaskDetail(currentTask.value.id)
  currentTask.value = res.data
}

onBeforeUnmount(() => {
  stopPolling()
})

onMounted(() => {
  loadEdgeNodes()
})
</script>

<style scoped>
.schedule-page {
  min-height: 100%;
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.card-block {
  margin-bottom: 16px;
}

.action-row {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>