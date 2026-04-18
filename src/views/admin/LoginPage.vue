<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="title">云边协同容器服务卸载管理系统</h2>
      <p class="sub-title">管理员登录</p>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>

        <div class="bottom-actions">
          <span>还没有账号？</span>
          <el-button link type="primary" @click="goRegister">去注册</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { adminLogin } from '../../api/admin'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    const res = await adminLogin(form)
    userStore.loginUser = res.data
    ElMessage.success('登录成功')
    router.push('/home')
  } catch (e) {}
}

const goRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.login-card {
  width: 420px;
  padding: 36px 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 24px;
  color: #303133;
}

.sub-title {
  text-align: center;
  margin-bottom: 24px;
  color: #909399;
}

.bottom-actions {
  text-align: center;
  margin-top: 8px;
}
</style>