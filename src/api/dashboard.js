import request from './request'

export function getDashboardSummary() {
    return request({
        url: '/dashboard/summary',
        method: 'get'
    })
}