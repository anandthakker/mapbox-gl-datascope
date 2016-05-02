[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Scope your vector tile data.

## Install

    npm install mapbox-gl-datascope

## Usage

```js
mapboxgl.datascope(map, {
  layers: layers,
  properties: { 'road_density': 'Road Density (km/km2)' },
  popup: new mapboxgl.Popup({ closeButton: false }).addTo(map)
})
```

See also [example.html](https://anandthakker.github.com/mapbox-gl-datascope/example.html).

## API

### datascope

Scope your data

**Parameters**

-   `map` **[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)** Mapbox GL map instance
-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.layers` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** List of layers to query for data.
    -   `options.properties` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Object mapping feature property keys to a string label, or just `true` to use the key itself.  Only these properties will be shown.
    -   `options.summaries` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)=** Object mapping property keys to aggregation function name from [geojson-polygon-aggregate](https://github.com/developmentseed/geojson-polygon-aggregate) or 'reducer' function `(accumulator, clippedFeature) -> accumulator`
    -   `options.popup` **Popup=** A mapbox-gl-js Popup control; if supplied, the popup will be populated with the rendered property data.
    -   `options.event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)=** Mouse event to use (mousemove, click) (optional, default `'mousemove'`)
    -   `options.radius` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** Feature query radius (optional, default `0`)
    -   `options.filter` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)=** Optional feature filter.

Returns **DOMNode** DOM node that is kept updated with rendered property data.
