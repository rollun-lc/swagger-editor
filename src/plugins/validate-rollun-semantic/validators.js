import {ERR_TYPE} from "./index"
import {clearErrorsByType} from "../refs-util"

export const validateForbiddenKeys = (spec) => ({errActions}) => {

  clearErrorsByType(ERR_TYPE + "-forbidden-keys", errActions.clearBy)

  const forbiddenKeys = ["operationId"]

  const lines = spec.split("\n")
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i]
    const forbiddenKey = forbiddenKeys.find(key => line.trim().indexOf(key) === 0)
    if (forbiddenKey) {
      errActions.newThrownErr({
        message: `${ERR_TYPE}-forbidden-keys: '${forbiddenKey}' is forbidden to use!`,
        line: i + 1
      })
      break
    }
  }
}

export const validateTags = (JSONSpec) => ({errActions}) => {
  const validateTag = tag => !/^[A-Z][A-Za-z0-9]+$/.test(tag)

  clearErrorsByType(ERR_TYPE + "-tags", errActions.clearBy)

  if (JSONSpec && JSONSpec.tags) {
    const invalidTag = JSONSpec.tags.find(({name}) => validateTag(name))
    if (invalidTag) {
      errActions.newThrownErr({
        message: `${ERR_TYPE}-tags: tag [${invalidTag.name}] must be in 'PascalCase'!`
      })
    }
  }
}


export const validateVersion = (specStr) => (props) => {
  const {errActions, specSelectors, fn: {AST}} = props

  clearErrorsByType(ERR_TYPE + "-version", errActions.clearBy)

  const version = specSelectors.version().toString()
  if (version) {
    if (!/^[1-9][0-9]{0,3}$/.test(version)) {
      errActions.newThrownErr({
        message: `${ERR_TYPE}-version: Version must be a valid integer, instead got [${version}]!`,
        line: AST.getLineNumberForPath(specStr, ["info", "version"])
      })
    }
  }
}
