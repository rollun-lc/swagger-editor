import {validateForbiddenKeys, validateTags} from "./validators"
import {updateJsonSpec, updateSpec}          from "./actions"

export const ERR_TYPE = "rollun-semantic"

export default function () {
  return {
    statePlugins: {
      spec: {
        actions: {
          validateForbiddenKeys,
          validateTags
        },
        wrapActions: {
          updateSpec,
          updateJsonSpec
        }
      }
    }
  }
}
