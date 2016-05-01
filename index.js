'use strict'

var yo = require('yo-yo')

module.exports = datascope

/**
 * Scope your data
 * @param {Map} map Mapbox GL map instance
 * @param {object} options
 * @param {Array<string>} options.layers List of layers to query for data.
 * @param {object} options.properties Object mapping feature property keys to a string label, or just `true` to use the key itself.  Only these properties will be shown.
 * @param {Popup} [options.popup] A mapbox-gl-js Popup control; if supplied, the popup will be populated with the rendered property data.
 * @param {string} [options.event='mousemove'] Mouse event to use (mousemove, click)
 * @param {number} [options.radius=0] Feature query radius
 * @param {Array} [options.filter] Optional feature filter.
 *
 * @returns {DOMNode} DOM node that is kept updated with rendered property data.
 */
function datascope (map, options) {
  options = Object.assign({
    event: 'mousemove',
    layers: [],
    filter: [],
    radius: 0,
    properties: null,
    popup: null
  }, options)

  var container = yo`<div class="mapboxgl-datascope"></div>`
  map.on(options.event, showDataAtPoint)
  return container

  function showDataAtPoint (e) {
    var features = map.queryRenderedFeatures(e.point, {
      radius: options.radius,
      layers: options.layers
    })

    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
    if (!features.length) {
      if (options.popup) { options.popup.remove() }
      return
    }

    yo.update(container, yo`
     <div class="mapboxgl-datascope">
      ${formatProperties(options.properties, features[0]).map((row) => (yo`
        <tr><td>${row[0]}</td><td>${row[1]}</tr>
      `))}
     </div>
    `)

    if (options.popup) {
      options.popup.setDOMContent(container)
      options.popup.setLngLat(e.lngLat)
      options.popup.addTo(map)
    }
  }
}

function formatProperties (format, feature) {
  return Object.keys(format || feature.properties)
  .map((k) => [
    typeof format[k] === 'string' ? format[k] : k,
    feature.properties[k]
  ])
}
