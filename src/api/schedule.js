import request from './request'

export function createScheduleTask(data) {
    return request({
        url: '/schedule/create',
        method: 'post',
        data
    })
}

export function prepareScheduleTask(taskId) {
    return request({
        url: `/schedule/prepare?taskId=${taskId}`,
        method: 'post'
    })
}

export function startScheduleTask(taskId) {
    return request({
        url: `/schedule/start?taskId=${taskId}`,
        method: 'post'
    })
}

export function nextScheduleCheckpoint(taskId) {
    return request({
        url: `/schedule/next?taskId=${taskId}`,
        method: 'post'
    })
}

export function getScheduleTaskDetail(taskId) {
    return request({
        url: `/schedule/detail?taskId=${taskId}`,
        method: 'get'
    })
}