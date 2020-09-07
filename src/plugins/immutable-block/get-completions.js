import {hashFnv32a, immutableBlockHeader, immutableBlockFooter} from "./utils"

export default function getCompletions(editor, session, pos, prefix, cb) {
  const {row} = pos

  const lines = editor.getValue().split("\n").slice(0, row)

  let openImmutableHeader = false
  let openImmutableHeaderLine = -1
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (line.includes(immutableBlockHeader)) {
      openImmutableHeaderLine = i
      openImmutableHeader = true
    }
    if (line.includes(immutableBlockFooter)) {
      openImmutableHeader = false
    }
  }

  return cb(null, [
    {
      name: "Start of Predefined block in OAS, that cannot be modified.",
      value: immutableBlockHeader + "\n",
      score: 15,
      meta: "test1"
    }]
    .concat(openImmutableHeader ? {
      name: "test2",
      value: immutableBlockFooter + hashFnv32a(lines.slice(openImmutableHeaderLine, row).join("").replace(/\s/g, ""), true) + "\n",
      score: 14,
      meta: "test2"
    } : []))
}
