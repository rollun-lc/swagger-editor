import React from "react"
import PropTypes from "prop-types"
import SplitPane from "react-split-pane"
import qs from "qs"
import { copyToClipboard } from "rollun-ts-utils"

const MODE_KEY = ["split-pane-mode"]
const MODE_LEFT = "left"
const MODE_RIGHT = "right"
const MODE_BOTH = "both" // or anything other than left/right

export default class SplitPaneMode extends React.Component {

  static propTypes = {
    threshold: PropTypes.number,

    children: PropTypes.array,

    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
  };

  static defaultProps = {
    threshold: 100, // in pixels
    children: [],
  };

  state = {
    buttonHovered: false,
    buttonActive: false,
    copiedTimestamp: Date.now(),
  }

  initializeComponent = (c) => {
    this.splitPane = c
  }

  onDragFinished = () => {
    let { threshold, layoutActions } = this.props
    let { position, draggedSize } = this.splitPane.state
    this.draggedSize = draggedSize

    let nearLeftEdge = position <= threshold
    let nearRightEdge = draggedSize <= threshold

    layoutActions
      .changeMode(MODE_KEY, (
        nearLeftEdge
        ? MODE_RIGHT : nearRightEdge
        ? MODE_LEFT : MODE_BOTH
      ))
  }

  sizeFromMode = (mode, defaultSize) => {
    if(mode === MODE_LEFT) {
      this.draggedSize = null
      return "0px"
    } else if (mode === MODE_RIGHT) {
      this.draggedSize = null
      return "100%"
    }
    // mode === "both"
    return this.draggedSize || defaultSize
  }

  addCopyButtonToLink(hgroup, params) {
    const button = document.createElement("button")
    const copyImage = document.createElement("img")

    button.id = "copy-link"
    button.style.borderRadius = "99999px"
    button.style.backgroundColor = "white"
    button.style.border = "none"
    button.style.color = "white"
    button.style.width = "30px"
    button.style.height = "30px"

    button.onclick = (e) => {
      copyToClipboard(params.url)
      const copiedTimestamp = Date.now()

      this.setState({ copiedTimestamp })

      if (this.state.copiedTimestamp + 2000 > copiedTimestamp) {
        const copiedText = document.querySelector("#copied-text") || document.createElement("h2")
        copiedText.innerText = "Copied"
        copiedText.id = "copied-text"

        e.srcElement.parentNode.parentNode.appendChild(copiedText)
        setTimeout(() => {
          document.querySelector("#copied-text")?.remove()
          this.setState({ copiedTimestamp: 0 })
        }, 2000)
      }
    }

    copyImage.src = "https://img.icons8.com/ios-glyphs/30/000000/copy.png"

    button.appendChild(copyImage)
    hgroup.appendChild(button)
  }

  render() {
    let { children, layoutSelectors } = this.props
    const [, queryParams] = window.location.href.split("?")
    const params = qs.parse(queryParams)
    const previewSize = params.hideEditor === "true" ? "100%" : "50%"
    const copyButton = document.querySelector("#copy-link")
    const hgroup = document.querySelector("hgroup")

    if (!copyButton && hgroup) {
      this.addCopyButtonToLink(hgroup, params)
    }

    const mode = layoutSelectors.whatMode(MODE_KEY)
    const left = mode === MODE_RIGHT ? <noscript/> : children[0]
    const right = mode === MODE_LEFT ? <noscript/> : children[1]
    const size = this.sizeFromMode(mode, previewSize)

    return (
      <SplitPane
        disabledClass={""}
        ref={this.initializeComponent}
        split='vertical'
        defaultSize={previewSize}
        primary="second"
        minSize={0}
        size={size}
        onDragFinished={this.onDragFinished}
        allowResize={mode !== MODE_LEFT && mode !== MODE_RIGHT }
        resizerStyle={{"flex": "0 0 auto", "position": "relative", "background": "#000", "opacity": ".2", "width": "11px", "cursor": "col-resize"}}
      >
        { left }
        { right }
      </SplitPane>
    )
  }

}
