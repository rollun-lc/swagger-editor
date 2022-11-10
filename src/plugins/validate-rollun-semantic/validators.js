import {ROLLUN_SEMANTIC_ERROR_PREFIX} from "./index"
import {clearErrorsByType}            from "../refs-util"
import {isPascalCase}                 from "./util"

export const validateForbiddenKeys = (spec) => ({errActions}) => {

  clearErrorsByType(ROLLUN_SEMANTIC_ERROR_PREFIX + "-forbidden-keys", errActions.clearBy)

  const forbiddenKeys = []

  const lines = spec.split("\n")
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i]
    const forbiddenKey = forbiddenKeys.find(key => line.trim().indexOf(key) === 0)
    if (forbiddenKey) {
      errActions.newThrownErr({
        message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-forbidden-keys: '${forbiddenKey}' is forbidden to use!`,
        line: i + 1
      })
      break
    }
  }
}

const findInvalidTag = JSONSpec => {
  if (JSONSpec.tags) {
    const invalidTagIndex = JSONSpec.tags.findIndex(({name}) => !isPascalCase(name))
    if (invalidTagIndex > -1) return {tag: JSONSpec.tags[invalidTagIndex].name, path: ["tags", invalidTagIndex]}
  }

  if (!JSONSpec.paths) return {tag: null}

  const paths = Object.entries(JSONSpec.paths)
  for (const [path, methods] of paths) {
    const methodsEntries = Object.entries(methods)
    for (const [method, props] of methodsEntries) {
      if (props.tags) {
        const invalidTagIndex = props.tags.findIndex(tag => !isPascalCase(tag))
        if (invalidTagIndex > -1) {
          return {tag: props.tags[invalidTagIndex], path: ["paths", path, method, "tags", invalidTagIndex]}
        }
      }
    }
  }

  return {tag: null}
}

export const validateTags = (JSONSpec) => ({errActions, specSelectors, fn: {AST}}) => {

  clearErrorsByType(ROLLUN_SEMANTIC_ERROR_PREFIX + "-tags", errActions.clearBy)

  const {tag, path} = findInvalidTag(JSONSpec)

  if (tag) {
    const specStr = specSelectors.specStr()
    errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-tags: tag [${tag}] must be in 'PascalCase'!`,
      line: AST.getLineNumberForPath(specStr, path)
    })
  }
}


export const validateVersion = (specStr) => ({errActions, specSelectors, fn: {AST}}) => {

  clearErrorsByType(ROLLUN_SEMANTIC_ERROR_PREFIX + "-version", errActions.clearBy)

  const version = specSelectors.version().toString()

  if (version) {
    if (!/^[1-9][0-9]{0,3}$/.test(version)) {
      errActions.newThrownErr({
        message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-version: Version must be a valid integer (1-999), instead got [${version}]!`,
        line: AST.getLineNumberForPath(specStr, ["info", "version"])
      })
    }
  }
}

export const validateTitle = (specStr) => ({errActions, specSelectors, fn: {AST}}) => {

  clearErrorsByType(ROLLUN_SEMANTIC_ERROR_PREFIX + "-title", errActions.clearBy)

  const info = specSelectors.info().toJS()
  const titleExists = info && info.title

  if (titleExists && !isPascalCase(info.title)) {
    errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-title: [${info.title}] must be in 'PascalCase' using characters and numbers!`,
      line: AST.getLineNumberForPath(specStr, ["info", "title"])
    })
  }
}

export const validateServers = (JSONSpec) => ({errActions, specSelectors, fn: {AST}}) => {

  clearErrorsByType(ROLLUN_SEMANTIC_ERROR_PREFIX + "-servers", errActions.clearBy)

  if (!JSONSpec.servers || JSONSpec.servers.length === 0) {
    return errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-servers: servers variable is required!`,
      line: 1
    })
  }

  const regex = new RegExp(`^https?://[a-z][a-z0-9-]{0,20}/openapi/${JSONSpec.info.title || "EmptyTitle"}/v${JSONSpec.info.version}$`)
  const invalidTagIndex = JSONSpec.servers.findIndex(({url}) => {
    return !regex.test(url)
  })

  if (invalidTagIndex > -1) {
    const url = JSONSpec.servers[invalidTagIndex].url
    errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-servers: url [${url}] must pass regex - ${regex.toString()}`,
      line: AST.getLineNumberForPath(specSelectors.specStr(), ["servers", invalidTagIndex])
    })
  }
}

