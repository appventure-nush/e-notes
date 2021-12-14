export interface VUFile {
    file: File
    readonly fileObject: boolean
    id: string | number
    size: number
    name: string
    type: string
    active: boolean
    error: string
    success: boolean
    putAction: string
    postAction: string
    headers: object
    data: object
    timeout: number
    response: object | string
    progress: string
    speed: number
    xhr: XMLHttpRequest
    iframe: Element
}