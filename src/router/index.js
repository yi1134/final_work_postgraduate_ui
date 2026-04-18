import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import LoginPage from '../views/admin/LoginPage.vue'
import RegisterPage from '../views/admin/RegisterPage.vue'
import BasicLayout from '../layout/BasicLayout.vue'
import DashboardPage from '../views/dashboard/DashboardPage.vue'
import UserManagePage from '../views/user/UserManagePage.vue'
import NodeManagePage from '../views/node/NodeManagePage.vue'
import ContainerManagePage from '../views/container/ContainerManagePage.vue'
import LogManagePage from '../views/log/LogManagePage.vue'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
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
        path: '/',
        component: BasicLayout,
        meta: {
            auth: true
        },
        children: [
            {
                path: '/dashboard',
                component: DashboardPage
            },
            {
                path: '/user',
                component: UserManagePage
            },
            {
                path: '/node',
                component: NodeManagePage
            },
            {
                path: '/container',
                component: ContainerManagePage
            },
            {
                path: '/log',
                component: LogManagePage
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    if (!to.meta?.auth && !(to.matched.some(item => item.meta?.auth))) {
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