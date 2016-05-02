'use strict'

var yo = require('yo-yo')
var Draw = require('mapbox-gl-draw')
var extent = require('turf-extent')
var aggregate = require('geojson-polygon-aggregate')
var throttle = require('lodash.throttle')

module.exports = datascope

/**
 * Scope your data
 * @param {Map} map Mapbox GL map instance
 * @param {object} options
 * @param {Array<string>} options.layers List of layers to query for data.
 * @param {object} options.properties Object mapping feature property keys to { name, format } where `format` is an optional format function for the property value.  Only these properties will be shown.
 * @param {object} [options.summaries] Object mapping property keys to aggregation function name from [geojson-polygon-aggregate](https://github.com/developmentseed/geojson-polygon-aggregate) or 'reducer' function `(accumulator, clippedFeature) -> accumulator`
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
    summaries: null,
    popup: null
  }, options)

  var container = yo`<div class="mapboxgl-datascope"></div>`
  map.on(options.event, showDataAtPoint)

  var draw
  var summaryData = {}
  var selectedAreas = []
  var updateSummaries = throttle(_updateSummaries, 50)
  if (options.summaries) {
    draw = Draw({ controls: { line_string: false, point: false } })
    map.addControl(draw)

    for (var k in options.summaries) {
      var fn = options.summaries[k]
      if (typeof fn === 'string') {
        options.summaries[k] = aggregate.reducers[fn](k)
      }
    }

    // selection management
    map.on('draw.modechange', function (e) {
      if (e.mode === 'simple_select') {
        updateSelectedAreas(e.opts)
      }
    })

    map.on('draw.simple_select.selected.start', function (e) {
      // this is weird because gl-draw is putting selected ids directly onto
      // the payload object instead of into an array
      var added = Object.keys(e).filter((i) => !isNaN(i)).map((i) => e[i])
        .filter((id) => selectedAreas.indexOf(id) < 0) // filter out already selected
      updateSelectedAreas(selectedAreas.concat(added))
    })

    map.on('draw.simple_select.selected.end', function (e) {
      // this is weird because gl-draw is putting selected ids directly onto
      // the payload object instead of into an array
      var removed = Object.keys(e).filter((i) => !isNaN(i)).map((i) => e[i])
      updateSelectedAreas(selectedAreas.filter((id) => removed.indexOf(id) < 0))
    })

    map.on('draw.changed', function (e) {
      updateSummaries()
    })
  }

  return container

  function updateSelectedAreas (ids) {
    selectedAreas = ids || []
    if (!selectedAreas.length) { return }
    updateSummaries()
  }

  function _updateSummaries () {
    if (!selectedAreas.length) { return }
    var groups = selectedAreas.map((id) => Object.assign(draw.get(id), {
      properties: { id: id }
    }))
    var bbox = extent({type: 'FeatureCollection', features: groups})
    bbox = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]].map(map.project.bind(map))
    var features = map.queryRenderedFeatures(bbox, { layers: options.layers })
    var stats = aggregate.groups(groups, features, options.summaries)
    stats.features.forEach(function (feat) {
      summaryData[feat.properties.id] = feat.properties
    })
  }

  function showDataAtPoint (e) {
    var features = map.queryRenderedFeatures(e.point, {
      radius: options.radius,
      layers: options.layers.concat([
        'gl-draw-active-polygon.hot',
        'gl-draw-active-polygon.cold',
        'gl-draw-polygon.hot',
        'gl-draw-polygon.cold'
      ])
    })

    // prefer drawn features
    var drawFeatures = features.filter(isDrawnFeature)
    features = drawFeatures.length ? drawFeatures : features

    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
    if (!features.length) {
      if (options.popup) { options.popup.remove() }
      return
    }

    var properties = drawFeatures.length
      ? summaryData[features[0].properties.id] : features[0].properties
    update({ tableData: formatProperties(options.properties, properties) })

    if (options.popup) {
      options.popup.setDOMContent(container)
      options.popup.setLngLat(e.lngLat)
      options.popup.addTo(map)
    }
  }

  function update (state) {
    yo.update(container, yo`
     <div class="mapboxgl-datascope">
      ${state.tableData.map((row) => (yo`
        <tr><td>${row[0]}</td><td>${row[1]}</tr>
      `))}
     </div>
    `)
  }
}

function formatProperties (format, properties) {
  return Object.keys(properties)
  .filter((k) => (defined(properties, k) && defined(format, k)))
  .map((k) => [
    format[k].name,
    format[k].format ? format[k].format(properties[k]) : properties[k]
  ])
}

function isDrawnFeature (feature) {
  return feature.layer && feature.layer.id.startsWith('gl-draw')
}

function defined (obj, k) {
  return obj && typeof obj[k] !== 'undefined'
}

