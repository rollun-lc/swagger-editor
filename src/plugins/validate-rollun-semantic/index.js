import {
  validateForbiddenKeys,
  validateTags,
  validateVersion,
  validateTitle,
  validateServers
}                                   from "./validators"
import {updateJsonSpec, updateSpec} from "./actions"

export const ROLLUN_SEMANTIC_ERROR_PREFIX = "rollun-semantic"

export default function () {
  return {
    statePlugins: {
      spec: {
        actions: {
          validateForbiddenKeys,
          validateTags,
          validateVersion,
          validateTitle,
          validateServers
        },
        wrapActions: {
          updateSpec,
          updateJsonSpec
        }
      }
    }
  }
}
