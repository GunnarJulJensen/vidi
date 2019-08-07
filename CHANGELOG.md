# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [CalVer](https://calver.org/).

## [Unreleased]
### Added
- Embed script for easy embedding of Vidi in web pages using a snap-shot token.
- A corresponding UTFGrid layer is now switch on when a raster tile layer is switch on. The UTFGrid layer is providing mouse over on features. Which fields are displayed in mouse over is set in GC2 field properties.
- Download drawings as GeoJSON

### Changed
- Layers which have been switch off, will not be removed from legend.
- No re-load of legend if its not necessary.
- `embed.tmpl` is now a minimal template for embedding in web pages.
- Home button on `embed.tmpl` will set the map to the initial extent if a snapshot-state is invoked.
- Use file based sessions instead of memory based, so sessions can be shared between nodes in a cluster.

### Fixed
- Better wrapping of layer tools when side panel is narrow.
- Snapping bugs.
- SELECT statements like `SELECT * FROM foo WHERE bar LIKE '%foo'` will not longer give problems.

## [2019.1.0.rc2] - 2019-01-03
### Added
- Tentative support of WebGL layer type added.
- Support of MVT base layers.

### Changed
- Optimized rendering of layer tree. Implemented lazy rendering of layer groups and tools. 
- Hide login button if session module is disabled.

## [2019.1.0.rc1] - 2019-14-02
### Added
- Fall back mechanism for base layers. If the current base layer responses with error codes the next one is switched no.
- Touch drag enabled in layer tree.
- Config `activateMainTab` added, which tells Vidi to activate a tab on startup.
- Visual grouping of map tools in GUI.
- Tentative support of Mapbox Vector Tiles (MVT). Needs latest version of GC2 with MVT support. 
- Cross hair cursor when info click is on.
- When drawing or editing with the Editor module, snapping to other vector layers is added.
- Unify filter methods for vector and tile layers.
- After a query with the sqlQuery module is made, its now possible to store the query as a new "virtual" layer. The new layer is a vector layer, which acts like any other vector layer.

### Changed
- State shots are now stored in GC2 database using the new keyvalue API.
- Protected WMS layers requests result in `401` being routed through the WMS backend. A authentication is implemented in order to request protected WMS layers correctly.
- One click activation scheme where the module is activated when clicking the Tab. All others modules will be reset. A typical module should look like this:
- Google API files are no longer requested locally, because things break when Google makes updates. The files are requested remotely and are not cached in Service Workers due to CORS issues. The Google API doesn't work offline anyway. Google API must be set in GC2 config (App.php) with the kay ``
```javascript
module.exports = {
   set: function (o) {},
   init: function () {
     // Reset state and clear any effects of the module
     backboneEvents.get().on("reset:all", () => {});
 
     // Stop listening to any events, deactivate controls, but
     // keep effects of the module until they are deleted manually or reset:all is emitted
     backboneEvents.get().on("deactivate:all", () => {});
 
     // Activates module
     backboneEvents.get().on("on:myModule", () => {});
 
     // Deactivates module
     backboneEvents.get().on("off:myModule", () => {});
   }
 }
 ```

## [2018.2.0.rc1] - 2018-07-12
### Added
- New mode for double base-layers: Overlay base-layers, where the opacity of the top one can be changed
- Filters for WMS single tile layers. Predefine filters in GC2 Meta, which will be displayed as checkboxes in a layertree panel. For now only supports QGIS layers.

### Changed
- Vector filters can now be applied before switching a vector layer on.
- Table view are moved inside the layer tree, which makes it possible to see more than one table at a time.
- Table view clicks now pan to feature - not zooming.
- Popups for raster and vectors are now similar.

### Fixed
- When clicking in a table with points, panning now works.
- Workaround missing Service Workers features in Edge 17/18.
- Filters work in Edge 17/18.
- A lot of smaller issues were fixed.

## [2018.1] - 2018-07-12
### Added
- Specific vector layers can be set to offline. If offline the cached version of the vector layer is always used. Also if browser is reloaded.
- Control to switch all vector layers on and off. See above.
- Vector layers can now be set to two different load strategies: Static and Dynamic. The former is default and will load the entire layer at once. The latter will load only whats inside the view port (plus a buffer) and fetch new data when needed (when zoom/pan occurs). The load strategy is controlled by the GC2 `load_strategy` meta setting. Can be either `s` or `d`.  
- New map controls: Reset zoom, set previous/next extent and box-zoom. The latter now has a button, before this could only be achieved by holding shift down and drag the zoom box. 
- Opacity slider for all tile layers.

### Fixed
- Preset base layer in URL will not longer change to `undefined` when resizing browser during refresh.
- System field with prefix `gc2_` is no longer displayed in Editor attribute form.
- Stalling of print is fixed. 


## [2018.1.0.RC1] - 2018-10-9
### Added
- Drag'n'drop sorting of layers in layer tree. Sorting can be done between layers in a group and groups between groups. Sorting sticks after refresh of browser.
- Third level in layer tree. The third sub-group is set with the `vidi_sub_group` Meta property in GC2.
- Vector layers are now treated equally with tile layers. With the `vidi_layer_type` Meta property set GC2 a layer can be displayed as either tile or vector. Its also possible to switch between tile and vector directly in the layer tree.
- Vector layers can be filtered. An arbitrary number of filter expressions can be applied. 
- Table view of vector layers. See the attributes and link to the geometry on the map.
- Service Workers. Vidi is becoming a Progressive Web App (PWA).
    - Vidi starts without network. And always starts quick.
    - Vector layers are cached, so they can be used without network.
    - A change in source code will generated a new version hash, which will trigger the Service Workers to re-install the application.
    - Offline base layers. Base layers can be partial caches in browser for use without network.
    - Editor. Both tile and vector layers can be edited. Edits can be done without network.
- Side-by-side base layers. Swipe between two base layers.
- Save, restore and share projects. A project comprises the extent of the map, which background map is visible and which layers are turned on, which filters are applied as well as your drawings. You can share a project by sharing a URL. If you are not logged in, projects will be linked to the browser you are using. Otherwise, they will be stored under your user login. It is possible to transfer projects from browser to login.  
- New Kepler.gl module. Select layers in Vidi and start Kepler.gl with them. Kepler.gl is embedded in Vidi.
- Proper implementation of non-tiled layers, which is well suited for layer with live data and heat- and cluster maps. 

### Changed
- New user interface layout in default template. Where are now more space for the module dialogs.
- Leaflet.js updated to newest.
- Print now uses Puppeteer instead of Wkhtmltopdf. Puppeteer can be installed and updated with npm as any other module and its easier to debug.
- Is fully supported only in browsers with Service Workers.

### Deprecated

### Removed
- Layers Search module. This function is now moved to the contrib module vidiSearch.

### Fixed
- Calculation of area on drawing module now works.

### Security
- A lot of modules where updated.

