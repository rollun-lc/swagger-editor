import React from "react"
import PropTypes from "prop-types"

CloseButton.propTypes = {
  onClose: PropTypes.func
}

CloseButton.defaultProps = {
  onClose: () => {
  }
}

export function CloseButton({onClose}) {
  return <button className='button'
                 style={{margin: "10px"}}
                 onClick={() => onClose()}>
    Close
  </button>
}
