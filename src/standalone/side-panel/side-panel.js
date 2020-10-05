import React from "react"
import PropTypes from "prop-types"
import {Octokit} from "@octokit/core"
import _ from "lodash"

export const REPO_OWNER = "rollun-com"
export const REPO_NAME = "openapi-manifests"

export default class SidePanel extends React.Component {

  static propTypes = {
    sidepanelSelectors: PropTypes.object.isRequired,
    sidepanelActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired
  }

  state = {
    branches: {},
    currentBranch: "master"
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

  async fetchBranches() {
    const {data: branches} = await this.githubOctokit.request("GET /repos/{owner}/{repo}/branches", {
      owner: REPO_OWNER,
      repo: REPO_NAME
    })

    const filterFiles = (tree, sectionName) => tree.filter(({type, path}) => type === "blob" && _.startsWith(path, sectionName) && _.endsWith(path, ".yml"))

    let branchesTrees = {}
    for (const {name} of branches) {
      const {data: {tree}} = await this.githubOctokit.request("GET /repos/{owner}/{repo}/git/trees/:sha?recursive=true", {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        sha: name
      })
      branchesTrees[name] = {
        components: filterFiles(tree, "components"),
        manifests: filterFiles(tree, "manifests")
      }
      // this.setBranches(branches)
      // console.log("data", tree)
    }
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

  render() {
    const {branches, currentBranch} = this.state
    const {getComponent, isOpen} = this.props

    const BranchTree = getComponent("BranchTree", true)

    if (!isOpen) return null

    return <div className='side-panel-root'>
        <section className='d-flex between section'>
          <h1 className='header'>Rollun OpenAPIs</h1>
          <button className='button'
                  style={{margin: "10px"}}
                  onClick={() => this.props.handleClose()}>
            Close
          </button>
        </section>
        <section className='section d-flex between'>
          <label htmlFor="select-branch" className='d-flex column'>
            <span>Select branch</span>
            <select name="select-branch" id="select-branch" value={currentBranch}
                    onChange={e => this.setState({currentBranch: e.target.value})}>
              {Object.keys(branches).map((branch => <option key={branch} value={branch}>{branch}</option>))}
            </select>
          </label>
          <button className='button'
                  style={{margin: "10px"}}
                  onClick={() => this.fetchBranches().then(branches => this.setBranches(branches))}>
            Force refetch tree
          </button>
        </section>
        <section className='section'>
          {branches[currentBranch] && <BranchTree tree={branches[currentBranch]} branch={currentBranch}/>}
        </section>
      </div>
  }
}
