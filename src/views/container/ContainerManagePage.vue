<template>
  <div class="container-page">
    <div class="page-header">
      <h2 class="page-title">容器管理</h2>
      <el-button type="primary" @click="openAddModal">新增容器</el-button>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="容器名称">
          <el-input v-model="searchForm.containerName" placeholder="请输入容器名称" clearable />
        </el-form-item>

        <el-form-item label="服务类型">
          <el-input v-model="searchForm.serviceType" placeholder="请输入服务类型" clearable />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 160px">
            <el-option label="启用" value="ENABLED" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-alert
          title="当前页面维护的是云端支持的容器目录。运行中的实例状态后续会在调度运行中心、节点详情和日志中展示。"
          type="info"
          :closable="false"
          show-icon
          class="tip-alert"
      />

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="containerName" label="容器名称" min-width="140" />
        <el-table-column prop="templateCode" label="容器编码" min-width="180" />
        <el-table-column prop="serviceType" label="服务类型" min-width="120" />
        <el-table-column prop="imageName" label="镜像名称" min-width="160" />
        <el-table-column prop="imageVersion" label="镜像版本" width="120" />
        <el-table-column prop="requiredCpu" label="CPU" width="90" />
        <el-table-column prop="requiredMemory" label="内存(MB)" width="110" />
        <el-table-column prop="requiredStorage" label="存储(GB)" width="110" />
        <el-table-column prop="coldStartDelay" label="平均冷启动时延(ms)" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ENABLED' ? 'success' : 'info'">
              {{ scope.row.status === 'ENABLED' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="scope">
            <el-button link type="primary" @click="openEditModal(scope.row)">编辑</el-button>
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

    <el-dialog v-model="modalVisible" :title="isEdit ? '编辑容器' : '新增容器'" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="容器名称" prop="containerName">
          <el-input v-model="form.containerName" placeholder="请输入容器名称" />
        </el-form-item>

        <el-form-item label="服务类型" prop="serviceType">
          <el-input v-model="form.serviceType" placeholder="请输入服务类型" />
        </el-form-item>

        <el-form-item label="镜像名称" prop="imageName">
          <el-input v-model="form.imageName" placeholder="请输入镜像名称" />
        </el-form-item>

        <el-form-item label="镜像版本" prop="imageVersion">
          <el-input v-model="form.imageVersion" placeholder="请输入镜像版本" />
        </el-form-item>

        <el-form-item label="所需CPU" prop="requiredCpu">
          <el-input-number v-model="form.requiredCpu" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="所需内存" prop="requiredMemory">
          <el-input-number v-model="form.requiredMemory" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="所需存储" prop="requiredStorage">
          <el-input-number v-model="form.requiredStorage" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="平均冷启动时延" prop="coldStartDelay">
          <el-input-number v-model="form.coldStartDelay" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="ENABLED" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
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
  addTemplate,
  deleteTemplate,
  listTemplateByPage,
  updateTemplate
} from '../../api/template'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const searchForm = reactive({
  current: 1,
  pageSize: 10,
  containerName: '',
  serviceType: '',
  status: ''
})

const initForm = () => ({
  id: undefined,
  containerName: '',
  serviceType: '',
  imageName: '',
  imageVersion: 'latest',
  requiredCpu: 1,
  requiredMemory: 1024,
  requiredStorage: 10,
  coldStartDelay: 500,
  status: 'ENABLED',
  description: ''
})

const form = reactive(initForm())

const rules = {
  containerName: [{ required: true, message: '请输入容器名称', trigger: 'blur' }],
  serviceType: [{ required: true, message: '请输入服务类型', trigger: 'blur' }],
  imageName: [{ required: true, message: '请输入镜像名称', trigger: 'blur' }],
  imageVersion: [{ required: true, message: '请输入镜像版本', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await listTemplateByPage({ ...searchForm })
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
  searchForm.containerName = ''
  searchForm.serviceType = ''
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
    containerName: row.containerName,
    serviceType: row.serviceType,
    imageName: row.imageName,
    imageVersion: row.imageVersion,
    requiredCpu: row.requiredCpu,
    requiredMemory: row.requiredMemory,
    requiredStorage: row.requiredStorage,
    coldStartDelay: row.coldStartDelay,
    status: row.status,
    description: row.description
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()

  if (isEdit.value) {
    await updateTemplate({...form})
    ElMessage.success('更新成功')
  } else {
    await addTemplate({...form})
    ElMessage.success('新增成功')
  }

  modalVisible.value = false
  loadData()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除容器【${row.containerName}】吗？`, '提示', {
    type: 'warning'
  })
  await deleteTemplate(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.container-page {
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

.tip-alert {
  margin-bottom: 16px;
}

.pagination-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>