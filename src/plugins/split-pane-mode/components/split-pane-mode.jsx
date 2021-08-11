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
    copied: false,
    copiedTimestamp: Date.now()
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

  render() {
    let { children, layoutSelectors } = this.props
    const [, queryParams] = window.location.href.split("?")
    const params = qs.parse(queryParams)
    const previewSize = params.hideEditor === "true" ? "100%" : "50%"

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
        <div>
          <button
            onClick={() => {
              copyToClipboard(params.url)
              if (this.state.copiedTimestamp + 2000 < Date.now()) {
                this.setState({ copied: true, copiedTimestamp: Date.now() })
                setTimeout(() => this.setState({ copied: false }), 2000)
              }
            }}
            onMouseEnter={() => this.setState({ buttonHovered: true })}
            onMouseLeave={() => this.setState({ buttonHovered: false })}
            onMouseDown={() => this.setState({ buttonActive: true })}
            onMouseUp={() => this.setState({ buttonActive: false })}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: 5,
              margin: "10px 0 0 10px",
              backgroundColor: "black",
              color: "white",
              width: 200,
              ...(this.state.buttonHovered ? {
                transform: "translate(5px, -5px)",
                boxShadow: "-5px 5px 5px #ffea00",
                animation: "transform 1s ease-in",
              } : {}),
              ...(this.state.buttonActive ? {
                transform: "translate(2px, -2px)",
                boxShadow: "-2px 2px 5px #ffea00",
                opacity: 0.8,
                animation: "opacity 1s ease-in",
              } : {})
          }}>Copy manifest link</button>
          {this.state.copied && <div>Copied</div>}
          { right }
        </div>
      </SplitPane>
    )
  }

}
