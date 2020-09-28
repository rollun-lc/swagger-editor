import qs         from "querystring-browser"
import {ERR_TYPE} from "./validate-rollun-semantic"

/**
 * Unescapes a JSON pointer.
 * @api public
 */
export function unescapeJsonPointerToken(token) {
  if (typeof token !== "string") {
    return token
  }
  return qs.unescape(token.replace(/~1/g, "/").replace(/~0/g, "~"))
}

/**
 * Escapes a JSON pointer.
 * @api public
 */
export function escapeJsonPointerToken(token) {
  return qs.escape(token.replace(/~/g, "~0").replace(/\//g, "~1"))
}

/**
 * removes error from swagger UI, by type,
 * type -  prefix of message followed by semicolon
 * example:
 *    error-type: Some error occurred
 * @param type
 * @param clearBy
 */

export function clearErrorsByType(type, clearBy) {
  clearBy((err) => {
    return !err._root.entries.find(([key, val]) => key === "message" && val.indexOf(type + ":") === 0)
  })
}

