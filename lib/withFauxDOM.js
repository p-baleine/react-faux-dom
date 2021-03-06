var React = require('react')
var createReactClass = require('create-react-class')
var Element = require('./Element')
var mapValues = require('./utils/mapValues')

function withFauxDOM (WrappedComponent) {
  var WithFauxDOM = createReactClass({
    componentWillMount: function () {
      this.connectedFauxDOM = {}
      this.animateFauxDOMUntil = 0
    },
    componentWillUnmount: function () {
      this.stopAnimatingFauxDOM()
    },
    connectFauxDOM: function (node, name, discardNode) {
      if (!this.connectedFauxDOM[name] || discardNode) {
        this.connectedFauxDOM[name] = typeof node !== 'string' ? node : new Element(node)
        setTimeout(this.drawFauxDOM)
      }
      return this.connectedFauxDOM[name]
    },
    drawFauxDOM: function () {
      var virtualDOM = mapValues(this.connectedFauxDOM, function (n) {
        return n.toReact()
      })
      this.setState(virtualDOM)
    },
    animateFauxDOM: function (duration) {
      this.animateFauxDOMUntil = Math.max(Date.now() + duration, this.animateFauxDOMUntil)
      if (!this.fauxDOMAnimationInterval) {
        this.fauxDOMAnimationInterval = setInterval(function () {
          if (Date.now() < this.animateFauxDOMUntil) {
            this.drawFauxDOM()
          } else {
            this.stopAnimatingFauxDOM()
          }
        }.bind(this), 16)
      }
    },
    stopAnimatingFauxDOM: function () {
      this.fauxDOMAnimationInterval = clearInterval(this.fauxDOMAnimationInterval)
      this.animateFauxDOMUntil = 0
    },
    isAnimatingFauxDOM: function () {
      return !!this.fauxDOMAnimationInterval
    },
    render: function () {
      var props = Object.assign({}, this.props, this.state, {
        connectFauxDOM: this.connectFauxDOM,
        animateFauxDOM: this.animateFauxDOM,
        stopAnimatingFauxDOM: this.stopAnimatingFauxDOM,
        isAnimatingFauxDOM: this.isAnimatingFauxDOM
      })
      return React.createElement(WrappedComponent, props)
    }
  })
  WithFauxDOM.displayName = 'WithFauxDOM(' + getDisplayName(WrappedComponent) + ')'
  return WithFauxDOM
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

module.exports = withFauxDOM
