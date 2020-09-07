import {hashFnv32a, immutableBlockFooter, immutableBlockHeader} from "./utils"

export const validateImmutableBlock = (spec) => (system) => {

  const errType = "immutable-block-error"

  const errorReporter = (msg, line) => {
    system.errActions.newThrownErr({
      message: `${errType}: ${msg}`,
      line: line + 1
    })
  }

  system.errActions.clearBy((err) => {
    return !err._root.entries.find(([key, val]) => key === "message" && val.indexOf(errType) === 0)
  })

  const lines = spec.split("\n")

  let immutableBlockHeaderLine = -1
  for (let i = 0, len = lines.length; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(immutableBlockHeader)) {
      if (immutableBlockHeaderLine !== -1) {
        errorReporter("Not closed immutableBlockHeader!", immutableBlockHeaderLine)
        break
      }
      immutableBlockHeaderLine = i
    } else if (line.includes(immutableBlockFooter)) {
      if (immutableBlockHeaderLine === -1) {
        errorReporter("immutableBlockFooter must have immutableBlockHeader before!", i)
        break
      } else {
        const hash = hashFnv32a(lines.slice(immutableBlockHeaderLine, i).join("").replace(/\s/g, ""), true)
        const hashInFooterMatch = line.match(/checksum: ([a-z0-9]+)/i)
        if (hashInFooterMatch) {
          const [, hashInFooter] = hashInFooterMatch
          if (hashInFooter !== hash) {
            errorReporter(`invalid checksum, found - ${hashInFooter}, actual - ${hash}!`, i)
            break
          }
        }
      }
      immutableBlockHeaderLine = -1
    }
    if (i + 1 === len && immutableBlockHeaderLine !== -1) {
      errorReporter("Not closed immutableBlockHeader", immutableBlockHeaderLine)
    }
  }

}

export const validateImmutableBlockWrap = (ori, system) => (...args) => {
  ori(...args)
  const [spec] = args
  system.specActions.validateImmutableBlock(spec)
}
