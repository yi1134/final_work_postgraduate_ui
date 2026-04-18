<template>
  <div class="home-page">
    <div class="home-card">
      <h2>系统首页</h2>
      <p v-if="userStore.loginUser">
        当前登录管理员：{{ userStore.loginUser.nickname }}（{{ userStore.loginUser.username }}）
      </p>
      <div style="margin-top: 20px">
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = async () => {
  await userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px;
}

.home-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
</style>