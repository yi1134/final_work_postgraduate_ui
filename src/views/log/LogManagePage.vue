<template>
  <div class="log-page">
    <div class="page-header">
      <h2 class="page-title">运行日志</h2>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务ID">
          <el-input-number v-model="searchForm.taskId" :min="1" placeholder="请输入任务ID" />
        </el-form-item>

        <el-form-item label="Checkpoint 编号">
          <el-input-number v-model="searchForm.checkpointNo" :min="1" placeholder="请输入编号" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="日志ID" width="90" />
        <el-table-column prop="taskId" label="任务ID" width="90" />
        <el-table-column prop="checkpointNo" label="CP编号" width="90" />
        <el-table-column prop="totalRequestCount" label="总请求数" width="100" />
        <el-table-column prop="newRequestCount" label="新增请求数" width="110" />
        <el-table-column prop="continuousRequestCount" label="持续请求数" width="110" />
        <el-table-column prop="edgeRequestCount" label="边缘处理数" width="110" />
        <el-table-column prop="cloudRequestCount" label="云端回退数" width="110" />
        <el-table-column prop="avgLatency" label="平均时延(ms)" width="130" />
        <el-table-column prop="coldStartCount" label="冷启动次数" width="110" />
        <el-table-column prop="reconfigurationCount" label="重配置次数" width="110" />
        <el-table-column prop="utilityValue" label="效用值" width="100" />
        <el-table-column prop="createTime" label="记录时间" min-width="180" />
      </el-table>

      <div class="pagination-box">
        <el-pagination
            v-model:current-page="searchForm.current"
            v-model:page-size="searchForm.pageSize"
            :total="total"
            layout="total, prev, pager, next, sizes"
            @current-change="loadData"
            @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { listCheckpointLogByPage } from '../../api/log'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const searchForm = reactive({
  current: 1,
  pageSize: 10,
  taskId: undefined,
  checkpointNo: undefined
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await listCheckpointLogByPage({
      current: searchForm.current,
      pageSize: searchForm.pageSize,
      taskId: searchForm.taskId,
      checkpointNo: searchForm.checkpointNo
    })
    tableData.value = res.data.records || []
    total.value = Number(res.data.total || 0)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchForm.current = 1
  loadData()
}

const handleSizeChange = () => {
  searchForm.current = 1
  loadData()
}

const resetSearch = () => {
  searchForm.current = 1
  searchForm.pageSize = 10
  searchForm.taskId = undefined
  searchForm.checkpointNo = undefined
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.log-page {
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

.search-card {
  margin-bottom: 16px;
}

.pagination-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>