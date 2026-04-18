<template>
  <div class="node-page">
    <div class="page-header">
      <h2 class="page-title">节点管理</h2>
      <el-button type="primary" @click="openAddModal">新增节点</el-button>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="节点名称">
          <el-input v-model="searchForm.nodeName" placeholder="请输入节点名称" clearable />
        </el-form-item>

        <el-form-item label="节点类型">
          <el-select v-model="searchForm.nodeType" placeholder="请选择节点类型" clearable style="width: 160px">
            <el-option label="云节点" value="CLOUD" />
            <el-option label="边缘节点" value="EDGE" />
          </el-select>
        </el-form-item>

        <el-form-item label="节点状态">
          <el-select v-model="searchForm.status" placeholder="请选择节点状态" clearable style="width: 160px">
            <el-option label="在线" value="ONLINE" />
            <el-option label="离线" value="OFFLINE" />
            <el-option label="维护中" value="MAINTAIN" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nodeName" label="节点名称" min-width="140" />
        <el-table-column prop="nodeCode" label="节点编码" min-width="180" />
        <el-table-column prop="nodeType" label="节点类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.nodeType === 'CLOUD' ? 'warning' : 'success'">
              {{ scope.row.nodeType === 'CLOUD' ? '云节点' : '边缘节点' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" min-width="140" />
        <el-table-column prop="port" label="端口" width="90" />
        <el-table-column prop="region" label="区域" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cpuTotal" label="CPU" width="90" />
        <el-table-column prop="memoryTotal" label="内存(MB)" width="110" />
        <el-table-column prop="storageTotal" label="存储(GB)" width="110" />
        <el-table-column prop="bandwidth" label="带宽(Mbps)" width="120" />
        <el-table-column prop="currentInstanceCount" label="实例数" width="90" />
        <el-table-column prop="currentRequestCount" label="请求数" width="90" />
        <el-table-column label="操作" fixed="right" width="340">
          <template #default="scope">
            <el-button link type="success" @click="handleTestConnect(scope.row)">测试连接</el-button>
            <el-button link type="primary" @click="openEditModal(scope.row)">编辑</el-button>
            <el-button link type="warning" @click="changeStatus(scope.row, 'ONLINE')">上线</el-button>
            <el-button link type="info" @click="changeStatus(scope.row, 'MAINTAIN')">维护</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
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

    <el-dialog v-model="modalVisible" :title="isEdit ? '编辑节点' : '新增节点'" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="节点名称" prop="nodeName">
          <el-input v-model="form.nodeName" placeholder="请输入节点名称" />
        </el-form-item>

        <el-form-item label="节点类型" prop="nodeType">
          <el-select v-model="form.nodeType" placeholder="请选择节点类型" style="width: 100%">
            <el-option label="云节点" value="CLOUD" />
            <el-option label="边缘节点" value="EDGE" />
          </el-select>
        </el-form-item>

        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>

        <el-form-item label="端口" prop="port">
          <el-input-number v-model="form.port" :min="1" :max="65535" style="width: 100%" />
        </el-form-item>

        <el-form-item label="区域" prop="region">
          <el-input v-model="form.region" placeholder="请输入区域" />
        </el-form-item>

        <el-form-item label="节点状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="在线" value="ONLINE" />
            <el-option label="离线" value="OFFLINE" />
            <el-option label="维护中" value="MAINTAIN" />
          </el-select>
        </el-form-item>

        <el-form-item label="CPU总量" prop="cpuTotal">
          <el-input-number v-model="form.cpuTotal" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="内存总量" prop="memoryTotal">
          <el-input-number v-model="form.memoryTotal" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="存储总量" prop="storageTotal">
          <el-input-number v-model="form.storageTotal" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="带宽" prop="bandwidth">
          <el-input-number v-model="form.bandwidth" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addNode,
  deleteNode,
  listNodeByPage,
  testNodeConnect,
  updateNode,
  updateNodeStatus
} from '../../api/node'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const searchForm = reactive({
  current: 1,
  pageSize: 10,
  nodeName: '',
  nodeType: '',
  status: ''
})

const initForm = () => ({
  id: undefined,
  nodeName: '',
  nodeType: 'EDGE',
  ipAddress: '',
  port: 9001,
  region: '',
  status: 'ONLINE',
  cpuTotal: 4,
  memoryTotal: 8192,
  storageTotal: 100,
  bandwidth: 100,
  description: ''
})

const form = reactive(initForm())

const rules = {
  nodeName: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
  nodeType: [{ required: true, message: '请选择节点类型', trigger: 'change' }],
  ipAddress: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'change' }],
  status: [{ required: true, message: '请选择节点状态', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await listNodeByPage({ ...searchForm })
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
  searchForm.nodeName = ''
  searchForm.nodeType = ''
  searchForm.status = ''
  loadData()
}

const resetForm = () => {
  Object.assign(form, initForm())
  formRef.value?.clearValidate?.()
}

const openAddModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

const openEditModal = (row) => {
  isEdit.value = true
  resetForm()
  Object.assign(form, {
    id: row.id,
    nodeName: row.nodeName,
    nodeType: row.nodeType,
    ipAddress: row.ipAddress,
    port: row.port,
    region: row.region,
    status: row.status,
    cpuTotal: row.cpuTotal,
    memoryTotal: row.memoryTotal,
    storageTotal: row.storageTotal,
    bandwidth: row.bandwidth,
    description: row.description
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()

  if (isEdit.value) {
    await updateNode({ ...form })
    ElMessage.success('更新成功')
  } else {
    await addNode({ ...form })
    ElMessage.success('新增成功')
  }

  modalVisible.value = false
  loadData()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除节点【${row.nodeName}】吗？`, '提示', {
    type: 'warning'
  })
  await deleteNode(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const changeStatus = async (row, status) => {
  await updateNodeStatus({
    id: row.id,
    status
  })
  ElMessage.success('状态更新成功')
  loadData()
}

const handleTestConnect = async (row) => {
  const res = await testNodeConnect({
    ipAddress: row.ipAddress,
    port: row.port
  })
  if (res.data.success) {
    ElMessage.success(res.data.message || '连接成功')
  } else {
    ElMessage.error(res.data.message || '连接失败')
  }
}

const formatStatus = (status) => {
  if (status === 'ONLINE') return '在线'
  if (status === 'OFFLINE') return '离线'
  if (status === 'MAINTAIN') return '维护中'
  return status
}

const getStatusTagType = (status) => {
  if (status === 'ONLINE') return 'success'
  if (status === 'OFFLINE') return 'danger'
  if (status === 'MAINTAIN') return 'warning'
  return ''
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.node-page {
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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