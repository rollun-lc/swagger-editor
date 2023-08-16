import {ROLLUN_SEMANTIC_ERROR_PREFIX} from "./index"
import {clearErrorsByType} from "../refs-util"
import {getTitleFromServerUrl, isPascalCase} from "./util"

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

  console.log("JSONSpec", JSONSpec)

  for(const path in JSONSpec.paths) {
    const pathClear = path.slice(1).split("/")[0].replace(/-/g, "").toLowerCase()

    for(const parametr in JSONSpec.paths[path]) {
      const specStr = specSelectors.specStr()
      const tags = JSONSpec.paths[path][parametr].tags
      console.log("tags", tags)
      console.log("pathClear", pathClear)
      for(let i = 0; i < tags.length; i++) {
        if(tags[i].toLowerCase() !== pathClear) {
          errActions.newThrownErr({
            message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-tags: ${tags[i]} must be same as ${pathClear}'!`,
            line: AST.getLineNumberForPath(specStr, ["paths", path, parametr, "tags", i])
          })
        }
      }
      
    }
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
  const ROLLUN_NET_OPENAPI_URL = "https://rollun.net/api/openapi/"

  clearErrorsByType(ROLLUN_SEMANTIC_ERROR_PREFIX + "-servers", errActions.clearBy)

  if (!JSONSpec.servers || JSONSpec.servers.length === 0) {
    return errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-servers: servers variable is required!`,
      line: 1
    })
  }

  const regex = new RegExp(`^https?://(l.)?[a-z-]{0,40}[a-z0-9-.]{0,20}:?[0-9]{0,6}/openapi/${JSONSpec.info.title || "EmptyTitle"}/v${JSONSpec.info.version}$`)
  const invalidServerIndex = JSONSpec.servers.findIndex(({url}, index) => {
    if(url.startsWith(ROLLUN_NET_OPENAPI_URL) && index > 0) {
      return false
    }
    return !regex.test(url)
  })
  const invalidServerProxyIndex = JSONSpec.servers.findIndex(({url}, index) => {
    if(url.startsWith(ROLLUN_NET_OPENAPI_URL) && index > 0) {
      const prevUrl = JSONSpec.servers[index - 1].url
      const prevPath = prevUrl.split("/openapi/")[1]
      if(ROLLUN_NET_OPENAPI_URL + prevPath === url) return false
      return true
    }
    return false
  })
  const invalidServerTitleIndex = JSONSpec.servers.findIndex(({ url }) => getTitleFromServerUrl(url) !== (JSONSpec.info.title || "EmptyTitle"))

  if (invalidServerIndex > -1) {
    const url = JSONSpec.servers[invalidServerIndex].url
    errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-servers: url [${url}] must pass regex - ${regex.toString()}`,
      line: AST.getLineNumberForPath(specSelectors.specStr(), ["servers", invalidServerIndex])
    })
  }

  if(invalidServerProxyIndex > -1) {
    const url = JSONSpec.servers[invalidServerProxyIndex].url
    const prevUrl = JSONSpec.servers[invalidServerProxyIndex - 1].url
    const prevPath = prevUrl.split("/openapi/")[1]
    const example = ROLLUN_NET_OPENAPI_URL + prevPath
    errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-servers: proxy url [${url}] after "/openapi/ part" must be same as - [${prevUrl}]. 
      Example: [${example}]`,
      line: AST.getLineNumberForPath(specSelectors.specStr(), ["servers", invalidServerProxyIndex])
    })
  }

  if (invalidServerTitleIndex > -1) {
    const url = JSONSpec.servers[invalidServerTitleIndex].url
    const title = getTitleFromServerUrl(url)
    errActions.newThrownErr({
      message: `${ROLLUN_SEMANTIC_ERROR_PREFIX}-servers: title path - [${title}] in [${url}] must be same as manifest title - [${JSONSpec.info.title || "EmptyTitle"}]`,
      line: AST.getLineNumberForPath(specSelectors.specStr(), ["servers", invalidServerTitleIndex])
    })
  }
}

