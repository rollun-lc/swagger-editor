import React from "react"
import PropTypes from "prop-types"
import ManifestsList from "./manifests-list"
import BranchTree from "./branch-tree"
import SaveManifest from "./save-manifest"
import DefaultManifestButton from "./open-default-manifest"

class SidePanelContainer extends React.Component {

  state = {
    isOpen: false
  }

  static propTypes = {
    specActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
  }

  render() {
    const {getComponent} = this.props

    const ManifestsList = getComponent("ManifestsList", true)
    const SaveManifest = getComponent("SaveManifest", true)
    const DefaultManifestButton = getComponent("DefaultManifestButton", true)

    // swagger-editor-standalone class is required to other less classes work
    return <div className='swagger-editor-standalone'>
      <DefaultManifestButton/>
      <ManifestsList/>
      <SaveManifest/>
    </div>
  }
}

export default function SidePanelPlugin() {
  return {
    statePlugins: {
      sidepanel: {
        actions: {
          setGithubAuthToken: (token) => ({
            type: "SET_GITHUB_TOKEN",
            token
          })
        },
        reducers: {SET_GITHUB_TOKEN: (state, {token}) => state.setIn("githubToken", token)},
        selectors: {getGithubAuthToken: state => state.getIn("githubToken")}
      }
    },
    components: {
      SidePanelContainer,
      ManifestsList,
      BranchTree,
      SaveManifest,
      DefaultManifestButton
    }
  }
}
