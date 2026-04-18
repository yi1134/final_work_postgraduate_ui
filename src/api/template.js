import request from './request'

export function listTemplateByPage(data) {
    return request({
        url: '/template/list/page',
        method: 'post',
        data
    })
}

export function addTemplate(data) {
    return request({
        url: '/template/add',
        method: 'post',
        data
    })
}

export function updateTemplate(data) {
    return request({
        url: '/template/update',
        method: 'post',
        data
    })
}

export function deleteTemplate(id) {
    return request({
        url: `/template/delete?id=${id}`,
        method: 'post'
    })
}