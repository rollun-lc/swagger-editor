export const isPascalCase = str => /^[A-Z][A-Za-z0-9]+$/.test(str)
export const isCamelCase = str => /^[a-z][A-Za-z0-9]+$/.test(str)

export const getTitleFromServerUrl = (str) => {
    const regex = /\/openapi\/([^/]+)/
    const match = str.match(regex)
    return match ? match[1] : null
}