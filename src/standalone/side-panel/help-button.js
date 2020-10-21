import React from "react"

export function HelpButton() {
  return <button className='button'
                 style={{margin: "10px"}}
                 onClick={() => {
                   window.open("https://github.com/rollun-com/openapi-manifests#openapi-manifests-for-our-apis")
                 }}>
    Help
  </button>
}
