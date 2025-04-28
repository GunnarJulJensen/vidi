/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2025 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud;

let sqlQuery;
let backboneEvents;
let active = false;
let state;
let bindEvent;
let drawControl = null;
let meta;
let searchOn = false;
let drawnItems = new L.FeatureGroup();
let _self = false;

/**
 *
 * @type {*|exports|module.exports}
 */
var layerTree = require("./../../../browser/modules/layerTree");
var switchLayer = require("./../../../browser/modules/switchLayer");
var layers = require("./../../../browser/modules/layers");
/**
 *
 * @type {*|exports|module.exports}
 */
var utils;

/**
 *
 * @type {string}
 */

const _makeSearch = () => {
    let primitive, layer;
    alert("make search");
    for (const prop in drawnItems._layers) {
        layer = drawnItems._layers[prop];
        break;
    }
    if (!layer) {
        return;
    }

    primitive = layer.toGeoJSON(GEOJSON_PRECISION);
    if (primitive) {
        const geom = turfBuffer(primitive, buffer, { units: 'meters' });
        const l = L.geoJson(geom, {
            "color": "#ff7800",
            "weight": 1,
            "opacity": 1,
            "fillOpacity": 0.1,
            "dashArray": '5,3'
        }).addTo(bufferItems);
        l._layers[Object.keys(l._layers)[0]]._vidi_type = "query_buffer";
        // Reset all SQL Query layers, in case another tools has
        // created a layer while this one was switch on
        sqlQuery.init(qstore, new wicket.Wkt().read(JSON.stringify(geom.geometry)).write(), "4326");
    }
};

const exId = "mapstatus";
module.exports = {
    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        cloud = o.cloud;
        utils = o.utils;
        sqlQuery = o.sqlQuery;
        backboneEvents = o.backboneEvents;
        state = o.state;
        bindEvent = o.bindEvent;
        meta = o.meta;
        layerTree = o.layerTree;
        switchLayer = o.switchLayer;
        layers = o.layers;

        _self = this;

        return this;
    },
    /**
    *
    */


    init: function () {
        var dict = {};
        /**
         *
         */
        var React = require('react');

        /**
         *
         */
        var ReactDOM = require('react-dom');

        backboneEvents.get().on(`reset:all reset:${exId}`, () => {
            _self.reset();
        });
        backboneEvents.get().on(`off:all`, () => {
            _self.off();
        });
        backboneEvents.get().on(`on:${exId}`, () => {
            _self.active(true);
        });
        // cloud.get().on("click", function (e) {
        //     alert("click on map");
        //     if (e.originalEvent.clickedOnFeature || blocked) {
        //         return;
        //     }

        //     // Reset all SQL Query layers
        //     backboneEvents.get().trigger("sqlQuery:clear");


        //     const event = new geocloud.clickEvent(e, cloud.get());
        //     if (clicktimer) {
        //         clearTimeout(clicktimer);
        //     } else {
        //         clicktimer = setTimeout(function () {
        //             clicktimer = undefined;
        //             let coords = event.getCoordinate(), wkt;
        //             wkt = "POINT(" + coords.x + " " + coords.y + ")";

        //             // Cross Multi select disabled unless embed is enabled or featureInfoTableOnMap is enabled
        //             if (!window.vidiConfig.crossMultiSelect) {
        //                 sqlQuery.init(qstore, wkt, "3857", null, null, [coords.lat, coords.lng], false, false, false, (layerId) => {
        //                     setTimeout(() => {
        //                         let parentLayer = cloud.get().map._layers[layerId];
        //                         let clearQueryResults = true;
        //                         if (parentLayer && parentLayer.editor && parentLayer.editor.enabled()) clearQueryResults = false;
        //                         if (clearQueryResults) backboneEvents.get().trigger("sqlQuery:clear");
        //                     }, 100);
        //                 }, () => {
        //                 }, "", true);
        //                 // Cross Multi select enabled
        //             } else {
        //                 let coord3857 = utils.transform("EPSG:4326", "EPSG:3857", [e.latlng.lng, e.latlng.lat]);
        //                 let intersectingFeatures = [];
        //                 const distance = 10 * getResolutions(window.vidiConfig.crs)[cloud.get().getZoom()];
        //                 const clickFeature = turfBuffer(turfPoint([e.latlng.lng, e.latlng.lat]), distance, { units: 'meters' });
        //                 let mapObj = cloud.get().map;
        //                 for (let l in mapObj._layers) {
        //                     let overlay = mapObj._layers[l];
        //                     if (overlay._layers) {
        //                         for (let f in overlay._layers) {
        //                             if (!overlay._layers[f]?.feature?.geometry || overlay?.id?.startsWith('HL:')) {
        //                                 continue;
        //                             }
        //                             let featureForChecking = overlay._layers[f];
        //                             let feature = turfFeature(featureForChecking.feature.geometry);
        //                             try {
        //                                 if (turfIntersects(clickFeature, feature) && overlay.id) {
        //                                     const layerId = overlay.id.split(":")[1];
        //                                     try {
        //                                         const zoom = mapObj.getZoom();
        //                                         const parsedMeta = JSON.parse(meta.getMetaByKey(layerId).meta);
        //                                         const minZoom = parseInt(parsedMeta.vector_min_zoom);
        //                                         const maxZoom = parseInt(parsedMeta.vector_max_zoom);
        //                                         if (minZoom > zoom || maxZoom < zoom) {
        //                                             console.log(layerId + " is out of min/max zoom")
        //                                             continue;
        //                                         }
        //                                     } catch (e) {
        //                                         console.error(e)
        //                                     }
        //                                     intersectingFeatures.push({
        //                                         feature: featureForChecking.feature,
        //                                         layer: featureForChecking,
        //                                         layerKey: layerId,
        //                                         vector: true
        //                                     })
        //                                 }
        //                             } catch (e) {
        //                                 console.log(e);
        //                             }
        //                         }
        //                     }
        //                 }
        //                 let activelayers = _layers.getMapLayers() ? _layers.getLayers().split(",") : [];
        //                 let activeTilelayers = activelayers.filter(e => {
        //                     if (e.split(':').length === 1) {
        //                         const m = meta.getMetaByKey(e)
        //                         if (m?.not_querable !== true) {
        //                             return true;
        //                         }
        //                     }
        //                 })
        //                 if (activeTilelayers.length > 0) {
        //                     const t = sqlQuery.init(qstore, wkt, "3857", (store) => {
        //                         setTimeout(() => {
        //                             if (store?.geoJSON) {
        //                                 sqlQuery.prepareDataForTableView(LAYER.VECTOR + ':' + store.key, store.geoJSON.features);
        //                                 store.layer.eachLayer((layer) => {
        //                                     intersectingFeatures.push({
        //                                         feature: layer.feature,
        //                                         layer: layer,
        //                                         layerKey: store.key
        //                                     });
        //                                 })
        //                                 _layers.decrementCountLoading("_vidi_sql_" + store.id);
        //                                 backboneEvents.get().trigger("doneLoading:layers", "_vidi_sql_" + store.id);
        //                             }
        //                             if (_layers.getCountLoading() === 0) {
        //                                 layerTree.displayAttributesPopup(intersectingFeatures, e);
        //                             }
        //                         }, 200)
        //                     }, null, [coord3857[0], coord3857[1]]);
        //                 } else
        //                     layerTree.displayAttributesPopup(intersectingFeatures, e);
        //             }
        //         }, 250);
        //     }
        // });

        utils.createMainTab(exId, utils.__("MapStatus", dict), utils.__("Info", dict), require('./../../../browser/modules/height')().max, "bi bi-layout-text-window");


        class MapStatus extends React.Component {
            constructor(props) {
                super(props);
                this.state = {

                };
            }

            componentDidMount() {
                $('.bi-layout-text-window').on('click', function () {
                    if (_self) {
                        _self.active(true);
                    }
                });
            }

            componentDidUpdate(prevProps) {
                alert("componentDidUpdate")
            }


            render() {
                return (
                    <div role="tabpanel">
                        <p>GET TO WORK</p>

                    </div>
                );
            }
        }
        try {
            ReactDOM
                .render(
                    <MapStatus />,
                    document
                        .getElementById(exId)
                )
                ;
        } catch
        (e) {

        }

    },
    off: () => {
        console.log("off");
    },
    on: () => {
        console.log("on");
    },
    reset: () => {
        console.log("reset");
    },
    active: (active) => {
        try {
            _self.turnOnLayer('ledning_drift');
            _self.startDrawControl();
        }
        catch (e) {
            alert("error " + e);
            console.error(e);
        }
    },

    turnOnLayer: (layerId) => {
        if (!layerId) {
            return;
        }
        const activeLayers = layerTree.getActiveLayers(false);
        const layerSearch = `.${layerId}`.toLowerCase();
        const layerIsOn = activeLayers.some(str => str.endsWith(layerSearch));

        if (layerIsOn) {
            return;
        }

        const metaData = meta.getMetaData();
        const layer = metaData.data.find(f => f.f_table_name == layerId);

        if (layer) {
            switchLayer.init(`${layer.f_table_schema}.${layer.f_table_name}`, true);
        } else {
            console.error("Layer not found in metadata: " + layerId);
        }
    },

    startDrawControl: () => {
        backboneEvents.get().trigger(`off:infoClick`);
        if (drawControl) {
            return
        }
        drawControl = _self.createDrawControl();
        cloud.get().map.addControl(drawControl);
        // searchOn = true;
        // _self.unbindEvents();
        // Bind events
        cloud.get().map.on('draw:created', function (e) {
            e.layer._vidi_type = "query_draw";
            alert("draw:created");
            if (e.layerType === 'marker') {
                e.layer._vidi_marker = true;
            }
            drawnItems.addLayer(e.layer);
        });
        cloud.get().map.on('draw:drawstart', function () {
            // Clear all SQL query layers
            alert("draw:drawstart");
            backboneEvents.get().trigger("sqlQuery:clear");
        });
        cloud.get().map.on('draw:drawstop', function () {
            alert("draw:drawstop");
            _makeSearch();
        });
        cloud.get().map.on('draw:editstop', function () {
            alert("draw:editstop");
            _makeSearch();
        });
        cloud.get().map.on('draw:editstart', function () {
            alert("draw:editstart");
            bufferItems.clearLayers();
        });
        const po = $('.leaflet-draw-toolbar-top').popover({
            content: __("Brug værktøjet til at tegne polygoner, linjer og punkter på kortet. Du kan også redigere og slette eksisterende objekter."),
            trigger: "manual",
            placement: "left",
            customClass: "d-none d-lg-inline"
        });
        po.popover("show");
        setTimeout(function () {
            po.popover("hide");
        }, 2500);
    },

    createDrawControl: () => {
        backboneEvents.get().trigger("mapstatus:turnedOn");
        return new L.Control.Draw({
            position: 'topright',
            draw: {
                polygon: {
                    title: 'Tegn en polygon!',
                    allowIntersection: true,
                    drawError: {
                        color: '#b00b00',
                        timeout: 1000
                    },
                    shapeOptions: {
                        color: '#662d91',
                        fillOpacity: 0
                    },
                    showArea: true
                },
                polyline: {
                    metric: true,
                    shapeOptions: {
                        color: '#662d91',
                        fillOpacity: 0
                    }
                },
                circle: {
                    shapeOptions: {
                        color: '#662d91',
                        fillOpacity: 0
                    }
                },
                rectangle: {
                    shapeOptions: {
                        color: '#662d91',
                        fillOpacity: 0
                    }
                },
                marker: true,
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems,
                remove: false
            }
        });
    },
    unbindEvents: () => {
        cloud.get().map.off('draw:created');
        cloud.get().map.off('draw:drawstart');
        cloud.get().map.off('draw:drawstop');
        cloud.get().map.off('draw:editstart');
        cloud.get().map.off('draw:editstop');
        cloud.get().map.off('draw:deletestart');
        cloud.get().map.off('draw:deletestop');
        cloud.get().map.off('draw:deleted');
        cloud.get().map.off('draw:edited');
    }

};