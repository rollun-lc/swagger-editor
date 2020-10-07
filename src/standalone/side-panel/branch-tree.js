import React                   from "react"
import PropTypes               from "prop-types"
import {Octokit}               from "@octokit/core"
import {REPO_NAME, REPO_OWNER} from "./manifests-list"
import isJsonObject            from "is-json"
import YAML                    from "js-yaml"

export default class BranchTree extends React.Component {

  static propTypes = {
    tree: PropTypes.object.isRequired,
    sidepanelSelectors: PropTypes.object.isRequired,
    branch: PropTypes.string.isRequired,
    specActions: PropTypes.string.isRequired,
    specSelectors: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onFileDelete: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      fileSHA: localStorage.getItem("LAST_EDITING_FILE_SHA"),
      fileName: localStorage.getItem("LAST_EDITING_FILE"),
      searchText: ""
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
      path,
      headers: {
        // force disable cache
        "If-None-Match": ""
      }
    })
      .then(({data: {content, sha}}) => {
        this.setFile(path, sha)
        const decodedContent = atob(content)
        const preparedContent = isJsonObject(decodedContent) ? YAML.safeDump(YAML.safeLoad(decodedContent)) : decodedContent
        this.props.specActions.updateSpec(preparedContent)
        this.props.onSelect()
      })
  }

  handleFileDelete(path, branch, sha) {
    if (!path) return
    this.githubOctokit.request("DELETE /repos/:owner/:repo/contents/:path", {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: prompt(`Optional: enter commit message`) || `Delete ${path}`,
      branch,
      sha
    })
      .then(() => {
        this.props.onFileDelete(path, branch)
      })
  }

  filterManifests(manifests, inputText) {
    if (!manifests || manifests.length === 0) return []
    const trimmed = inputText.trim().toLowerCase()
    if (!trimmed) return manifests
    return manifests.filter(({path}) => path.toLowerCase().includes(trimmed))
  }

  render() {

    const {tree, branch} = this.props
    const {searchText} = this.state

    const filteredFiles = this.filterManifests(tree, searchText)

    return <div>
      <input className='search-input'
             value={searchText}
             onChange={e => this.setState({searchText: e.target.value})}
             type="text"
             placeholder='Start typing manifest name to search...'/>
      <div className='section even-children-darker'>
        {filteredFiles.length === 0
          ? <h4>Empty</h4>
          : filteredFiles.map(({path, sha}) => {
            return <div className='d-flex between'>
              <h3 key={path}>{path}</h3>
              <div className='d-flex' style={{background: "transparent"}}>
                <button style={{margin: "10px 0"}}
                        onClick={() => {
                          this.setFile(path, sha)
                          this.handleFileSelect(path, branch)
                        }}
                        className='button'>
                  Use
                </button>
                <button style={{margin: "10px 0"}}
                        onClick={() => {
                          if (confirm(`
     Are You sure, You want to delete manifest?
     You will be able to restore deleted file, via git later
                            `)) {
                            this.setFile(path, sha)
                            this.handleFileDelete(path, branch, sha)
                          }
                        }}
                        className='button danger'>
                  Delete
                </button>
              </div>
            </div>
          })}
      </div>
    </div>
  }
}
