// Base validate plugin that provides a placeholder `validateSpec` that fires
// after `updateJsonSpec` is dispatched.

export const updateSpec = (ori, {specActions}) => (...args) => {
  ori(...args)
  const [spec] = args
  specActions.validateSpec(spec)
}

export const validateRollunSemantic = (spec) => ({errActions}) => {
  const errType = "rollun-semantic"

  errActions.clearBy((err) => {
    return !err._root.entries.find(([key, val]) => key === "message" && val.indexOf(errType) === 0)
  })

  let error = null

  const lines = spec.split("\n")
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i]
    if (line.toLocaleLowerCase().trim().indexOf("operationId") === 0) {
      error = {
        message: `${errType}: 'operationId' is forbidden to use!`,
        line: i + 1
      }
      break
    }
  }
  if (error) {
    errActions.newThrownErr(error)
  }
}

export default function () {
  return {
    statePlugins: {
      spec: {
        actions: {
          validateRollunSemantic,
        },
        wrapActions: {
          updateSpec
        }
      }
    }
  }
}
