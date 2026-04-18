import request from './request'

export function adminRegister(data) {
    return request({
        url: '/admin/register',
        method: 'post',
        data
    })
}

export function adminLogin(data) {
    return request({
        url: '/admin/login',
        method: 'post',
        data
    })
}

export function getLoginAdmin() {
    return request({
        url: '/admin/get/login',
        method: 'get'
    })
}

export function adminLogout() {
    return request({
        url: '/admin/logout',
        method: 'post'
    })
}