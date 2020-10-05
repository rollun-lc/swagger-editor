import React from "react"
import PropTypes from "prop-types"
import {Octokit} from "@octokit/core"
import {REPO_NAME, REPO_OWNER} from "./side-panel"
import isJsonObject from "is-json"
import YAML from "js-yaml"

export default class BranchTree extends React.Component {

  static propTypes = {
    tree: PropTypes.object.isRequired,
    sidepanelSelectors: PropTypes.object.isRequired,
    branch: PropTypes.string.isRequired,
    specActions: PropTypes.string.isRequired,
    specSelectors: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      fileSHA: localStorage.getItem("LAST_EDITING_FILE_SHA"),
      fileName: localStorage.getItem("LAST_EDITING_FILE")
    }
  }

  setFile(fileName, fileSHA) {
    this.setState({fileName, fileSHA})
    localStorage.setItem("LAST_EDITING_FILE", fileName)
    localStorage.setItem("LAST_EDITING_FILE_SHA", fileSHA)
  }

  githubOctokit = new Octokit({
    auth: this.props.sidepanelSelectors.getGithubAuthToken()
  })

  handleFileSelect(path, branch) {
    this.githubOctokit.request("GET /repos/:owner/:repo/contents/:path?ref=" + branch, {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path
    })
      .then(({data: {content, sha}}) => {
        this.setFile(path, sha)
        const decodedContent = atob(content)
        const preparedContent = isJsonObject(decodedContent) ? YAML.safeDump(YAML.safeLoad(decodedContent)) : decodedContent
        this.props.specActions.updateSpec(preparedContent)
      })
  }

  handleFileSave(path, branch) {
    if (!path) return
    this.githubOctokit.request("PUT /repos/:owner/:repo/contents/:path", {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: prompt(`Optional: enter commit message`) || `Update ${path}`,
      branch,
      content: btoa(this.props.specSelectors.specStr().toString()),
      sha: this.state.fileSHA
    })
      .then(({data: {commit: {sha}}}) => {
        this.setFile(path, sha)
      })
  }

  render() {

    const {tree, branch} = this.props
    const {fileName} = this.state

    return <div>
      <button className='button' onClick={() => this.handleFileSave(fileName, branch)}>
        Save {fileName || "<select file first>"} file
      </button>
      {Object.entries(tree).map(([name, files]) => {
        return <div key={name}>
          <h2>{name}</h2>
          <div className='section'>
            {files.length === 0
              ? <h4>Empty</h4>
              : files.map(({path, sha}) => <h4 key={path}><a href="" onClick={e => {
                e.preventDefault()
                this.setFile(path, sha)
                this.handleFileSelect(path, branch)
              }}>{path.replace(name + "/", "")}</a></h4>)}
          </div>
        </div>
      })}
    </div>
  }
}
