import React from "react"
import PropTypes from "prop-types"
import {Octokit} from "@octokit/core"
import _ from "lodash"
import {CloseButton} from "./close-button"
import {HelpButton} from "./help-button"

export const REPO_OWNER = "rollun-com"
export const REPO_NAME = "openapi-manifests"

export default class ManifestsList extends React.Component {

  static propTypes = {
    sidepanelSelectors: PropTypes.object.isRequired,
    sidepanelActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  state = {
    branches: {},
    currentBranch: "master",
    isOpen: false,
    errorMessage: "",
    hasLoadedSuccessfully: false,
    uncommonFiles: []
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.cacheGithubAuthToken()
    const cachedBranches = localStorage.getItem("GITHUB_TREE")
    if (cachedBranches) {
      this.setBranches(JSON.parse(cachedBranches))
    } else {
      this.fetchBranches().then(branches => this.setBranches(branches))
    }
  }

  setBranches(branches) {
    this.setState(({branches}))
    localStorage.setItem("GITHUB_TREE", JSON.stringify(branches))
  }

  handleFileDelete(fileName, branch) {
    this.setBranches({
      ...this.state.branches,
      [branch]: this.state.branches[branch].filter(({path}) => path !== fileName)
    })
  }

  async fetchBranches() {
    this.setState({errorMessage: "", hasLoadedSuccessfully: false})
    const {data: branches} = await this.githubOctokit.request("GET /repos/{owner}/{repo}/branches", {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      headers: {
        // force disable cache
        "If-None-Match": ""
      }
    })

    const filterFiles = (tree) => tree.filter(({type, path}) => type === "blob" && _.endsWith(path, ".yml"))
    const filterUncommonFiles = (tree) => tree.filter(
      ({type, path}) =>
        !(type === "tree" || 
          _.endsWith(path, ".yml") || 
          _.endsWith(path, ".png") || 
          _.endsWith(path, ".md") || 
          _.endsWith(path, ".json")
      )
    )

    let branchesTrees = {}
    const uncommonFiles = []
    for (const {name} of branches) {
      const {data: {tree}} = await this.githubOctokit.request("GET /repos/{owner}/{repo}/git/trees/:sha?recursive=true", {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        sha: name,
        headers: {
          // force disable cache
          "If-None-Match": ""
        }
      })
      branchesTrees[name] = filterFiles(tree, "components")
      uncommonFiles.push(...filterUncommonFiles(tree))
    }
    this.setState(({uncommonFiles}))
    return branchesTrees
  }

  cacheGithubAuthToken() {
    let token = this.props.sidepanelSelectors.getGithubAuthToken()
    if (!token) {
      let cachedToken = localStorage.getItem("GITHUB_AUTH_TOKEN")
      if (!cachedToken) {
        cachedToken = prompt(`
         Enter Your github auth token.
         If You don't have one, it can be generated at
         https://github.com/settings/tokens.
      `)
        localStorage.setItem("GITHUB_AUTH_TOKEN", cachedToken)
      }
      this.props.sidepanelActions.setGithubAuthToken(cachedToken)
      token = cachedToken
    }
    this.githubOctokit = new Octokit({
      auth: token
    })
  }

  togglePanel() {
    this.setState(({isOpen}) => ({isOpen: !isOpen}))
  }

  branchModeMap = {
    master: "production",
    develop: "draft"
  }

  branchToMode(branch) {
    return this.branchModeMap[branch]
  }

  modeToBranch(mode) {
    return Object.entries(this.branchModeMap).find(([, value]) => mode === value)[0]
  }

  render() {
    const {branches, currentBranch, isOpen} = this.state
    const {getComponent} = this.props

    const BranchTree = getComponent("BranchTree", true)

    if (!isOpen) return <button className='button manifests-list-toggle'
                                onClick={() => this.togglePanel()}>
      Open manifest
    </button>

    return <div className='manifests-modal'>
      <section className='d-flex between section'>
        <h1 className='header'>Rollun OpenAPI Manifests</h1>
        <div className='d-flex '>
          <CloseButton onClose={() => this.togglePanel()}/>
          <HelpButton/>
        </div>
      </section>
      {this.state.hasLoadedSuccessfully && !this.state.errorMessage && 
        <section className="section">
          <h1>Manifest cache was successfuly updated</h1>
        </section>
      }
      {this.state.errorMessage && 
        <section className="section">
          <h1>Error: {this.state.errorMessage}</h1>
        </section>
      }
      {!!this.state.uncommonFiles.length &&
        <section className="section">
          <h1>
            Some unusual files founded in repo: 
          </h1>
          <p style={{
            fontSize: 14,
          }}>
            {this.state.uncommonFiles
              .map(({path}) => path).join(", ")
            }
          </p>
        </section>
      }
      <section className='section d-flex between'>
        <label htmlFor="select-branch" className='d-flex column'>
          <span>Select mode</span>
          <select name="select-branch" id="select-branch" value={this.branchToMode(currentBranch)}
                  onChange={e => this.setState({currentBranch: this.modeToBranch(e.target.value)})}>
            <option value='production'>Production</option>
            <option value='draft'>Drafts</option>
          </select>
        </label>
        <button className='button'
                style={{margin: "10px"}}
                onClick={
                  () => this.fetchBranches()
                  .then(branches => {
                    this.setBranches(branches)
                    this.setState({hasLoadedSuccessfully: true})
                  })
                  .catch(err => {
                    this.setState({errorMessage: err.message})
                  })
                }>
          Refresh manifests cache
        </button>
      </section>
      <section className='section'>
        <BranchTree tree={branches[currentBranch]}
                    onFileDelete={(file, branch) => this.handleFileDelete(file, branch)}
                    onSelect={() => this.togglePanel()}
                    branch={currentBranch}/>
      </section>
    </div>
  }
}
