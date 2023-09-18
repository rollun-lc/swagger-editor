import {
  validateForbiddenKeys,
  validateTags,
  validateVersion,
  validateTitle,
  validateServers
}                                   from "./validators"
import {updateJsonSpec, updateSpec} from "./actions"

export const ROLLUN_SEMANTIC_ERROR_PREFIX = "rollun-semantic"

const urlParams = new URLSearchParams(window.location.search);
const ignoreRollunSemanticErrors = urlParams.get('ignoreRollunSemanticErrors');

console.log(urlParams, ignoreRollunSemanticErrors);

const actions = ignoreRollunSemanticErrors === 'true' ? {} : {
  validateForbiddenKeys,
  validateTags,
  validateVersion,
  validateTitle,
  validateServers
};
const wrapActions = ignoreRollunSemanticErrors === 'true' ? {} : {
  updateSpec,
  updateJsonSpec
};

export default function () {
  return {
    statePlugins: {
      spec: {
        actions,
        wrapActions,
      }
    }
  }
}
