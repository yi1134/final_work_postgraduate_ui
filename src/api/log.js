import request from './request'

export function listCheckpointLogByPage(data) {
    return request({
        url: '/log/checkpoint/list/page',
        method: 'post',
        data
    })
}