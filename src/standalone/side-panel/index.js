import React from "react"
import PropTypes from "prop-types"
import SidePanel from "./side-panel"
import BranchTree from "./branch-tree"

class SidePanelContainer extends React.Component {

  state = {
    isOpen: false
  }

  static propTypes = {
    specActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
  }

  togglePanel() {
    this.setState(({isOpen}) => ({isOpen: !isOpen}))
  }


  render() {
    const {getComponent} = this.props
    const {isOpen} = this.state

    const SidePanel = getComponent("SidePanel", true)

    if (isOpen) {
      // render btn
    }

    // swagger-editor-standalone class is required to other less classes work
    return <div className='swagger-editor-standalone'>
      {!isOpen && <button className='button menu-toggle-button'
                          onClick={() => this.togglePanel()}>
        Open menu
      </button>}
      <SidePanel isOpen={isOpen} handleClose={() => this.togglePanel()}/>
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
      SidePanel,
      BranchTree
    }
  }
}
