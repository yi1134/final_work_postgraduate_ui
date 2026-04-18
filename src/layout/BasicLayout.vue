<template>
  <div class="layout-container">
    <el-container class="full-container">
      <el-aside width="220px" class="aside">
        <div class="logo-box">
          <div class="logo-title">边缘卸载管理系统</div>
          <div class="logo-subtitle">Edge Control System</div>
        </div>

        <el-menu
            :default-active="activeMenu"
            class="menu"
            router
            background-color="#001529"
            text-color="#c0c4cc"
            active-text-color="#ffffff"
        >
          <el-menu-item index="/dashboard">
            <span>首页仪表盘</span>
          </el-menu-item>

          <el-menu-item index="/node">
            <span>节点管理</span>
          </el-menu-item>

          <el-menu-item index="/container">
            <span>容器管理</span>
          </el-menu-item>

          <el-menu-item index="/schedule">
            <span>调度运行中心</span>
          </el-menu-item>

          <el-menu-item index="/log">
            <span>运行日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-left">
            <span class="system-name">云边协同自适应容器服务卸载管理系统</span>
          </div>

          <div class="header-right">
            <span class="admin-info" v-if="userStore.loginUser">
              {{ userStore.loginUser.nickname }}（{{ userStore.loginUser.username }}）
            </span>
            <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
          </div>
        </el-header>

        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleLogout = async () => {
  await userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.full-container {
  height: 100%;
}

.aside {
  background: #001529;
  color: #fff;
}

.logo-box {
  height: 64px;
  padding: 12px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.logo-subtitle {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.menu {
  border-right: none;
}

.header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.system-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-info {
  color: #606266;
  font-size: 14px;
}

.main {
  background: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}
</style>