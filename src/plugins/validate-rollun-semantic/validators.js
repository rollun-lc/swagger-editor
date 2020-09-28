import {ERR_TYPE}          from "./index"
import {clearErrorsByType} from "../refs-util"

export const validateForbiddenKeys = (spec) => ({errActions}) => {

  clearErrorsByType(ERR_TYPE, errActions.clearBy)

  let error = null

  const lines = spec.split("\n")
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i]
    if (line.trim().indexOf("operationId") === 0) {
      error = {
        message: `${ERR_TYPE}: 'operationId' is forbidden to use!`,
        line: i + 1
      }
      break
    }
  }
  if (error) {
    errActions.newThrownErr(error)
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
