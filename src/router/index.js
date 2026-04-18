import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import LoginPage from '../views/admin/LoginPage.vue'
import RegisterPage from '../views/admin/RegisterPage.vue'
import HomePage from '../views/HomePage.vue'

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/login',
        component: LoginPage
    },
    {
        path: '/register',
        component: RegisterPage
    },
    {
        path: '/home',
        component: HomePage,
        meta: {
            auth: true
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    if (!to.meta?.auth) {
        next()
        return
    }

    if (userStore.loginUser) {
        next()
        return
    }

    try {
        await userStore.fetchLoginUser()
        next()
    } catch (e) {
        next('/login')
    }
})

export default router