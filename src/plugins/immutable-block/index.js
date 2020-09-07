import * as wrapActions from "./wrap-actions"
import {validateImmutableBlock, validateImmutableBlockWrap} from "./validate-immutable-block"


export default function EditorAutosuggestPlugin() {
  return {
    statePlugins: {
      editor: {
        wrapActions
      },
      spec: {
        actions: {
          validateImmutableBlock: validateImmutableBlock
        },
        wrapActions: {
          updateSpec: validateImmutableBlockWrap
        }
      }
    }
  }
}
