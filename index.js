'use strict'

var yo = require('yo-yo')

module.exports = datascope

function datascope (map, options) {
  options = Object.assign({
    event: 'mousemove',
    layers: [],
    filter: [],
    radius: 0,
    properties: null
  }, options)

  var container = yo`<div class="mapboxgl-datascope"></div>`
  if (options.popup) {
    options.popup.setDOMContent(container)
  }

  map.on(options.event, showDataAtPoint)

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
