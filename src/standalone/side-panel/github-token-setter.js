import React from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import {REPO_NAME, REPO_OWNER} from "./manifests-list"
import {Octokit} from "@octokit/core"

export default class ResetGithubToken extends React.Component {

  static propTypes = {
    sidepanelActions: PropTypes.object.isRequired,
    sidepanelSelectors: PropTypes.object.isRequired,
  }


  componentDidMount() {
    this.githubOctokit = new Octokit({
      auth: this.props.sidepanelSelectors.getGithubAuthToken()
    })
  }

  handleResetToken() {
    const token = prompt("Enter Your github token")
    localStorage.setItem("GITHUB_AUTH_TOKEN", token)
    this.props.sidepanelActions.setGithubAuthToken(token)
    this.githubOctokit = new Octokit({
      auth: token
    })
  }

  render() {
    const token = this.props.sidepanelSelectors.getGithubAuthToken()

    return <button className='button reset-github-token-btn'
      type='button'
      onClick={() => this.handleResetToken()}
    >
      Reset github token
    </button>
  }
}
