import React       from "react"
import DefaultYaml from "../../plugins/local-storage/petstore"
import PropTypes from "prop-types"

class DefaultManifestButton extends React.Component {
  static propTypes = {
    specActions: PropTypes.object.isRequired,
  }


  handleOpenDefaultManifest = () => {
    localStorage.removeItem("LAST_EDITING_FILE")
    localStorage.removeItem("LAST_EDITING_FILE_SHA")
    localStorage.setItem("swagger-editor-content", DefaultYaml)
    this.props.specActions.updateSpec(DefaultYaml)
  }

  render() {
    return <button className='button' onClick={this.handleOpenDefaultManifest} style={{
      position: "absolute",
      top: "10px",
      zIndex: 9999,
      color: "#fff",
      right: "345px",
    }}>
      Default manifest
    </button>
  }
}

export default DefaultManifestButton
