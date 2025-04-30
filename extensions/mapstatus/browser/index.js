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
import { convert as geojsonToWKT } from "terraformer-wkt-parser"

let sqlQuery;
let backboneEvents;
let active = false;
let state;
let bindEvent;
let drawControl = null;
let meta;
let searchOn = false;
let serializeLayers;
let drawnItems = new L.FeatureGroup();
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

const _makeSearch = function (wkt) {
    let qstore = [];
    const fullLayerName = _self.fullLayerName("ledning_drift");
    
    if (wkt && fullLayerName) {
        
        sqlQuery.init(qstore, wkt, "4326",(store) => {
            setTimeout(() => {
                if (store?.geoJSON) {
                    store.layer.eachLayer((feature) => {
                        const geoJson = feature.toGeoJSON();
                        console.log("feature " + feature);
                        console.log("feature " + JSON.stringify(geoJson));
                    })
                }
                backboneEvents.get().trigger(`${MAPSTATUS_MODULE_NAME}:update`);
            },200)},
            null, null, null, [fullLayerName]);
    }
    alert("qstore " + JSON.stringify(qstore));
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
        serializeLayers = o.serializeLayers;
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

        cloud.get().map.addLayer(drawnItems);
        store.layer = drawnItems;

        cloud.get().map.addLayer(drawnItems);
        utils.createMainTab(exId, utils.__("MapStatus", dict), utils.__("Info", dict), require('./../../../browser/modules/height')().max, "bi bi-layout-text-window");


        class MapStatus extends React.Component {
            constructor(props) {
                super(props);
                this.state = {

                };
            }

            componentDidMount() {
                $('.bi-layout-text-window').on('click', function () { });
                backboneEvents.get().on(`${MAPSTATUS_MODULE_NAME}:update`, () => {
                    alert("update 1");
                    this.forceUpdate(); // Trigger re-render når noget ændrer sig
                    alert("update 2");
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
                        {store.layer?.getLayers().length}
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
                                {store.layer?.getLayers().map((layer, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{layer.feature.properties.id}</td>
                                            <td>{layer.feature.properties.fra_brønd}</td>
                                            <td>{layer.feature.properties.til_brønd}</td>
                                            <td>{layer.feature.properties.status}</td>
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
        let drawnItems = serializeLayers.serializeDrawnItems(true);
        return { drawnItems };
    },
    recreateDrawnings: (parr, clear) => {
        alert("recreateDrawnings " + JSON.stringify(parr));
    },
    /**
     * Applies externally provided state
     */
    applyState: (newState) => {

        return new Promise((resolve) => {
            store.reset();
            alert("applyState " + JSON.stringify(newState));

            _self.startDrawControl(false);
            if (!isStarted) {
                setTimeout(() => {
                    _self.resetState();
                    backboneEvents.get().trigger(`${MAPSTATUS_MODULE_NAME}:update`);
                    isStarted = true;
                }, 0);
                resolve();
                return;
            }
            if (newState.drawnItems && newState.drawnItems.length > 0) {
                setTimeout(() => {
                    _self.recreateDrawnings(newState.drawnItems, false);
                    resolve();
                }, 100);
            } else {
                resolve();
            }
        });
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

        cloud.get().map.addLayer(drawnItems);

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