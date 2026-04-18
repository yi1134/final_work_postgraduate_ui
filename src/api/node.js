import request from './request'

export function listNodeByPage(data) {
    return request({
        url: '/node/list/page',
        method: 'post',
        data
    })
}

export function addNode(data) {
    return request({
        url: '/node/add',
        method: 'post',
        data
    })
}

export function updateNode(data) {
    return request({
        url: '/node/update',
        method: 'post',
        data
    })
}

export function deleteNode(id) {
    return request({
        url: `/node/delete?id=${id}`,
        method: 'post'
    })
}

export function updateNodeStatus(data) {
    return request({
        url: '/node/status/update',
        method: 'post',
        data
    })
}

export function testNodeConnect(data) {
    return request({
        url: '/node/test/connect',
        method: 'post',
        data
    })
}