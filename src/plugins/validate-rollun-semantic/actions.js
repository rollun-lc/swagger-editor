export const updateSpec = (ori, {specActions}) => (...args) => {
  ori(...args)
  const [spec] = args
  specActions.validateForbiddenKeys(spec)
  specActions.validateVersion(spec)
}

export const updateJsonSpec = (ori, {specActions}) => (...args) => {
  ori(...args)
  const [spec] = args
  specActions.validateTags(spec)
}
