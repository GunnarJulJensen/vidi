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
const MAPSTATUS_MODULE_NAME = `mapstatus`;
import _ from "lodash";
import { convert as geojsonToWKT } from "terraformer-wkt-parser"

let backboneEvents;
let draw;
let qstore = [];
const _geojson = {
    type: "FeatureCollection",
    features: [],
};
let drawControl = null;
let drawnItems = new L.FeatureGroup();
let meta;
let serializeLayers;
let sqlQuery;
let state;
const store = new geocloud.sqlStore({
    clickable: true
});
let _self = false;

/**
 *
 * @type {*|exports|module.exports}
 */
var layerTree = require("./../../../browser/modules/layerTree");
var switchLayer = require("./../../../browser/modules/switchLayer");
var layers = require("./../../../browser/modules/layers");
const { func } = require("prop-types");
/**
 *
 * @type {*|exports|module.exports}
 */
var utils;

/**
 *
 * @type {string}
 */

const selectedFeaturesClear = () => {
    _geojson.features = [];
};
const selectedFeaturesAdd = (feature) => {
    _geojson.features.push(feature);
};

const selectedFeaturesLength = () => {
    return _geojson.features.length;
};

const selectedFeaturesGet = () => {
    return _geojson.features;
};

const setSelectedStyle = () => {
    const colorStyle = { color: '#ffd000' };    
    for (let layerId in cloud.get().map._layers) {
        let layer = cloud.get().map._layers[layerId];
        if (layer instanceof L.GeoJSON) {
            layer.setStyle(colorStyle);

            layer.eachLayer(function(feature) {
                feature.options.style = colorStyle;
            });
        }
    }
};

const _makeSearch = (wkt) => {
    try {
        const fullLayerName = _self.fullLayerName("ledning_drift");
        selectedFeaturesClear();

        if (!wkt || !fullLayerName) {
            return;
        }

        sqlQuery.init(qstore, wkt, "4326", () => {
            if (qstore.length >= 1 && qstore[0].geoJSON) {

                for (const feature of qstore[0].geoJSON.features) {
                    selectedFeaturesAdd(feature);
                }
                backboneEvents.get().trigger(`${MAPSTATUS_MODULE_NAME}:update`);
            }
        }, null, null, null, [fullLayerName], true, null, null);

    } catch (e) {
        console.error("Error in _makeSearch:", e);
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

        backboneEvents = o.backboneEvents;
        bindEvent = o.bindEvent;
        cloud = o.cloud;
        draw = o.draw;
        layers = o.layers;
        layerTree = o.layerTree;
        meta = o.meta;
        serializeLayers = o.serializeLayers;
        sqlQuery = o.sqlQuery;
        state = o.state;
        switchLayer = o.switchLayer;
        utils = o.utils;

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

        backboneEvents.get().on(`reset:all reset:${MAPSTATUS_MODULE_NAME}`, () => {
            _self.reset();
        });

        utils.createMainTab(exId, utils.__("MapStatus", dict), utils.__("Info", dict), require('./../../../browser/modules/height')().max, "bi bi-layout-text-window");


        class MapStatus extends React.Component {
            constructor(props) {
                super(props);
                this.state = {};
            }

            componentDidMount() {
                $('.bi-layout-text-window').on('click', function () { });
                backboneEvents.get().on(`${MAPSTATUS_MODULE_NAME}:update`, () => {
                    this.forceUpdate(); // Trigger re-render når noget ændrer sig
                    setSelectedStyle();
                });
            }

            componentDidUpdate(prevProps) { }


            render() {
                return (
                    <div role="tabpanel">
                        <p>GET TO WORK</p>
                        <button
                            onClick={() => _self.active(true)}
                            className="btn btn-outline-secondary"
                        >Start</button>
                        
                        <p>Antal: {selectedFeaturesLength()}</p>
                        
                        <table className="table table-striped table-hover table-sm">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Opstr.</th>
                                    <th scope="col">Nedstr.</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody id="mapstatus-table">
                                {selectedFeaturesGet().map((feature, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{feature.properties.id}</td>
                                            <td>{feature.properties.fra_brønd}</td>
                                            <td>{feature.properties.til_brønd}</td>
                                            <td>{feature.properties.status}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            }
        }
        try {
            ReactDOM.render(<MapStatus />, document.getElementById(exId));
        } catch
        (e) {
            console.error("Error in MapStatus:", e);
        }

    },
    clickDraw() {
        _self.active(true);
    },
    off: () => {
        if (drawControl) {
            cloud.get().map.removeControl(drawControl);
            drawControl = null;
        }
    },
    on: () => {
        _self.startDrawControl(true);
    },
    reset: () => {
        console.log("reset");
    },
    active: (active) => {
        try {
            _self.turnOnLayer('ledning_drift');
            _self.startDrawControl(active);
        }
        catch (e) {
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
        const fullLayerName = _self.fullLayerName(layerId);

        if (fullLayerName) {
            switchLayer.init(fullLayerName, true);
        } else {
            console.error("Layer not found in metadata: " + layerId);
        }
    },
    fullLayerName: (layerId) => {
        const metaData = meta.getMetaData();
        const layer = metaData.data.find(f => f.f_table_name == layerId);
        if (layer) {
            return `${layer.f_table_schema}.${layer.f_table_name}`;
        } else {
            console.error("Layer not found in metadata: " + layerId);
            return '';
        }
    },
    getState: () => {

        return {};
    },
    recreateDrawnings: (parr, clear) => {
        alert("recreateDrawnings " + JSON.stringify(parr));
    },


    startDrawControl: (enable) => {
        _self.bindDrawEvents();
        if (drawControl || !enable) {
            return
        }

        drawControl = _self.createDrawControl();
        cloud.get().map.addControl(drawControl);
        searchOn = true;


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
    startShapeSearch: (drawEvent) => {
        try {
            var layer = drawEvent.layer;
            var geojson = layer.toGeoJSON();
            var wkt = geojsonToWKT(geojson.geometry);
            _makeSearch(wkt);
        } catch (e) {
            console.error("Error in draw:created event:", e);
        }
    },
    bindDrawEvents: () => {
        backboneEvents.get().trigger(`drawing:turnedOn`);


        cloud.get().map.on('draw:created', function (e) {
            _self.startShapeSearch(e);
            backboneEvents.get().trigger(`${MAPSTATUS_MODULE_NAME}:update`)
        });
        cloud.get().map.on('draw:drawstart', function () {
            // Clear all SQL query layers
            backboneEvents.get().trigger("sqlQuery:clear");
        });
        cloud.get().map.on('draw:drawstop', function (e) {

        });
        cloud.get().map.on('draw:editstop', function (e) {
            _self.startShapeSearch(e);
        });
        cloud.get().map.on('draw:editstart', function () {
            // bufferItems.clearLayers();
        });
    },
    createDrawControl: () => {
        if (drawControl) {
            return drawControl;
        }
        L.drawLocal = require('../../../browser/modules/drawLocales/draw.js');
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
                rectangle: {
                    shapeOptions: {
                        color: '#662d91',
                        fillOpacity: 0
                    }
                },
                marker: false,
                circlemarker: false,

            },
            edit: {
                featureGroup: drawnItems,
                remove: true
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