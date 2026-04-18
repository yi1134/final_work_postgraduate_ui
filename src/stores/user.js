import { defineStore } from 'pinia'
import { getLoginAdmin, adminLogout } from '../api/admin'

export const useUserStore = defineStore('user', {
    state: () => ({
        loginUser: null
    }),
    actions: {
        async fetchLoginUser() {
            const res = await getLoginAdmin()
            this.loginUser = res.data
            return res.data
        },
        clearLoginUser() {
            this.loginUser = null
        },
        async logout() {
            await adminLogout()
            this.clearLoginUser()
        }
    }
})