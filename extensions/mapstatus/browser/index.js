/*
 * @author     Gunnar Jul Jensen <gjj@geopartner.dk>
 * @copyright  
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';



import { convert as geojsonToWKT } from "terraformer-wkt-parser";
import styleObject from "./style.js";
import React from 'react';


const MAPSTATUS_MODULE_NAME = `mapstatus`;
// This element contains the styling for the module
require("./style.js");

let backboneEvents;
let qstore = [];
const _geojson = {
    type: "FeatureCollection",
    features: [],
};
const _geojsonLayer = L.geoJSON;
let _self = false;
var cloud;
let drawControl = null;
let meta;
let sqlQuery;
var layerTree = require("./../../../browser/modules/layerTree");
let selectedFeatureId = 0;
var switchLayer = require("./../../../browser/modules/switchLayer");
var utils;


const selectedFeaturesClear = () => {
    _geojson.features = [];
};
const selectedFeaturesAdd = (feature) => {
    _geojson.features.push(feature);
};

const selectedFeaturesLength = () => {
    return _geojson.features.length;
};

const zoomToFeature = (feature) => {
    const map = cloud.get().map;
    const bounds = L.geoJSON(feature).getBounds();
    map.fitBounds(bounds, { maxZoom: 21 });
    map.setView(bounds.getCenter(), map.getZoom(), { animate: true });
};

const selectedFeaturesGet = () => {
    return _geojson.features;
};

const colorStyle = { color: '#ffd000', weight: 3 };
const hiliteStyle = { color: '#800080', weight: 4 };

const selectedFeaturesUpdate = (hiliteFeaureId) => {
    _geojsonLayer(_geojson, {
        style: function (feature) {
            if (hiliteFeaureId && feature.properties.id == hiliteFeaureId)
                return hiliteStyle;
            return colorStyle;
        },

        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.id) {
                // Zoom til feature i stedet for at vise popup
                layer.on('click', function () {
                    zoomToFeature(feature);
                    selectedFeatureId = feature.properties.id;
                    selectedFeaturesHilite(selectedFeatureId);
                    backboneEvents.get().trigger(`${MAPSTATUS_MODULE_NAME}:updateSelected`, selectedFeatureId);
                });
            }
        }
    }).addTo(cloud.get().map);
};

const selectedFeaturesHilite = (hiliteFeaureId) => {
    if (!hiliteFeaureId)
        return;

    for (let layerId in cloud.get().map._layers) {
        let layer = cloud.get().map._layers[layerId];
        if (layer instanceof L.GeoJSON) {
            layer.eachLayer(function (feature) {
                if (hiliteFeaureId && feature.feature.properties.id == hiliteFeaureId) {
                    feature.setStyle(hiliteStyle);
                } else {
                    feature.setStyle(colorStyle);
                }
            });
        }
    }
}


const _makeSearch = (wkt) => {
    try {
        const fullLayerName = _self.fullLayerName("ledning_drift");
        selectedFeaturesClear();

        if (!wkt || !fullLayerName) {
            return;
        }
        new Promise((resolve, reject) => {
            sqlQuery.init(qstore, wkt, "4326", () => {
                if (qstore.length >= 1 && qstore[0].geoJSON) {
                    const promises = qstore[0].geoJSON.features.map(feature => selectedFeaturesAdd(feature));
                    Promise.all(promises).then(resolve).catch(reject);
                } else {
                    resolve();
                }
            }, null, null, null, [fullLayerName], true, null, null);
        }).then(() => {
            selectedFeaturesUpdate(0);
            backboneEvents.get().trigger(`${MAPSTATUS_MODULE_NAME}:update`);
        });
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
        const dict = {};

        const ReactDOM = require('react-dom');


        backboneEvents.get().on(`reset:all reset:${MAPSTATUS_MODULE_NAME}`, () => {
            _self.reset();
        });

        utils.createMainTab(exId, utils.__("MapStatus", dict), utils.__("Info", dict), require('./../../../browser/modules/height')().max, "bi bi-layout-text-window");


        class MapStatus extends React.Component {

            constructor(props) {
                super(props);
                this.state = {
                    createProjectShow: false,
                    dragInfo: {
                        x: 100,
                        y: 100,
                        offsetX: 0,
                        offsetY: 0
                    },
                    isDragging: false,
                    projectName: "",
                    projectDescription: "",
                    projects: ["Vælg projekt", "Projekt 1. Indre Odense", "Projekt 2. Indre Odense", "Projekt 3. Indre Odense"],
                    selectedProject: "Vælg projekt",
                    selectedRowIndex: -1
                };
                this.boxRef = React.createRef();
            }

            rowRefs = [];

            handleMouseDown = (e) => {
                //const box = this.boxRef.current.getBoundingClientRect();
                const rect = this.boxRef.current.getBoundingClientRect();
                this.setState({
                    isDragging: true,
                    dragInfo: {
                        ...this.state.dragInfo,
                        offsetX: e.clientX - rect.left,
                        offsetY: e.clientY - rect.top,
                        x: rect.left,
                        y: rect.top
                    }

                });
                window.addEventListener("mousemove", this.handleMouseMove);
                window.addEventListener("mouseup", this.handleMouseUp);
            }

            handleMouseUp = () => {
                this.setState({ isDragging: false });
                window.removeEventListener("mousemove", this.handleMouseMove);
                window.removeEventListener("mouseup", this.handleMouseUp);
            }

            handleMouseMove = (e) => {
                if (!this.state.isDragging) return;

                this.setState({
                    dragInfo: {
                        ...this.state.dragInfo,
                        x: e.clientX - this.state.dragInfo.offsetX,
                        y: e.clientY - this.state.dragInfo.offsetY
                    }
                });
                if (this.boxRef.current) {
                    this.boxRef.current.style.position = 'absolute';
                    this.boxRef.current.style.left = `${this.state.dragInfo.x}px`;
                    this.boxRef.current.style.top = `${this.state.dragInfo.y}px`;
                }
            }

            scrollToRow = () => {
                const row = this.rowRefs[this.state.selectedRowIndex];
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }

            componentDidMount() {
                $('.bi-layout-text-window').on('click', function () { });
                backboneEvents.get().on(`${MAPSTATUS_MODULE_NAME}:update`, () => {
                    this.forceUpdate();
                });
                backboneEvents.get().on(`${MAPSTATUS_MODULE_NAME}:updateSelected`, (selectedFeatureId) => {
                    const si = selectedFeaturesGet().findIndex(feature => feature.properties.id == selectedFeatureId);
                    this.state.selectedRowIndex = si;
                    this.setState({ selectedRowIndex: si });
                    this.scrollToRow();
                    selectedFeaturesHilite(selectedFeatureId);
                    this.forceUpdate();

                });
            }


            componentDidUpdate(prevProps, prevState) {

            }

            featureRowClick(feature, index) {

                this.setState({ selectedRowIndex: index });
                zoomToFeature(feature);
                selectedFeaturesUpdate(feature.properties.id); // Opdaterer stilen for den valgte feature
            }
            showCreateProjectModal = (show) => {
                this.setState({ createProjectShow: show });
            }
            addProject = (projectName) => {
                this.state.projects.push(projectName);
                this.setState({ projectName: projectName });
                this.state.projectName = projectName;
                this.forceUpdate();
                alert("Projekt oprettet: " + projectName);

            }
            handleProjectName = (event) => {
                this.setState({ projectName: event.target.value });
                this.state.projectName = event.target.value;
                this.forceUpdate();
            }


            render() {
                const { projectName } = this.state;
                const isButtonEnabled = projectName.trim() !== "";
                const { projects, selectedProject } = this.state;

                return (
                    <div role="tabpanel">
                        <div className="form-select mb-3" style={{ '--bsFormSelectBgImg': 'none' }}>
                            <div className="m-2">
                                <p>Vælg projekt</p>
                                <select defaultValue="0" id="selectProject" onChange={() => _self.active(true)}>
                                    {projects.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-select mb-3" style={{ '--bsFormSelectBgImg': 'none' }}>
                            <p>Excel data</p>
                            <button
                                onClick={() => {
                                    alert("Download excel regneark med valgte ledninger");
                                }}
                                className="btn btn-primary text-nowrap"
                            >Hent data</button>
                        </div>
                        <div className="form-select" style={{ '--bsFormSelectBgImg': 'none' }}>
                            <p> Projekt oprettelse</p>
                            <div>
                                <button
                                    onClick={() => {
                                        this.showCreateProjectModal(true);
                                        _self.active(true);
                                    }}
                                    className="btn btn-primary text-nowrap"
                                >Opret nyt projekt</button>
                            </div>

                            <br />

                            {this.state.createProjectShow && (
                                <div>
                                    <div >
                                        <input
                                            type="text"
                                            placeholder="Projekt navn"
                                            defaultValue={projectName}
                                            className="w-100"
                                            onChange={this.handleProjectName} 
                                        />
                                    </div>
                                    <br />
                                    <div>
                                        {/* <p>Indtast projekt beskrivelse</p> */}
                                        <textarea
                                            className="w-100"
                                            placeholder="Projekt beskrivelse">
                                        </textarea>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-primary text-nowrap me-5"

                                            onClick={() => {
                                                this.showCreateProjectModal(false);
                                            }}
                                        >Luk
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn btn-primary text-nowrap"
                                            disabled={!isButtonEnabled}
                                            onClick={() => {
                                                this.showCreateProjectModal(false);
                                                this.addProject(projectName);
                                            }}
                                        >Gem</button>
                                    </div>


                                </div>

                            )}
                        </div>

                        {selectedFeaturesLength() > 0 && (
                            <div
                                style={styleObject.boxStyle}
                                ref={this.boxRef}>
                                <div onMouseDown={this.handleMouseDown}>
                                    <h5>Valgte ledninger : {selectedFeaturesLength()} </h5>
                                </div>
                                <div>
                                    <table id="featureLedningTableId" className="table table-striped table-hover table-sm" style={styleObject.tableStyle} >
                                        <thead style={styleObject.theadStyle}>
                                            <tr style={styleObject.rowStyle}>
                                                <th style={styleObject.cellStyleHeader} >Opstr.</th>
                                                <th style={styleObject.cellStyleHeader} >Nedstr.</th>
                                                <th style={styleObject.cellStyleHeader} >System</th>
                                                <th style={styleObject.cellStyleHeader} >Kategori</th>
                                                <th style={styleObject.cellStyleHeader} >Materiale</th>
                                                <th style={styleObject.cellStyleHeader} >Rør diameter</th>
                                                <th style={styleObject.cellStyleHeader} >Længde</th>
                                                <th style={styleObject.cellStyleHeader} >Fra kote</th>
                                                <th style={styleObject.cellStyleHeader} >Til kote</th>
                                                <th style={styleObject.cellStyleHeader} >Dybde</th>
                                                <th style={styleObject.cellStyleHeader} >Fysisk indeks</th>
                                                <th style={styleObject.cellStyleHeader} >Bemærkning</th>
                                            </tr>
                                        </thead>
                                        <tbody style={styleObject.tbodyStyle}>
                                            {selectedFeaturesGet().map((feature, index) => {
                                                return (
                                                    <tr
                                                        ref={(el) => this.rowRefs[index] = el}
                                                        onClick={() => this.featureRowClick(feature, index)} key={index}
                                                        style={{
                                                            cursor: 'pointer',
                                                            display: 'table',
                                                            width: '100%',
                                                            tableLayout: 'fixed',
                                                            border: this.state.selectedRowIndex === index ? '2px solid blue' : '1px solid gray',
                                                            fontWeight: this.state.selectedRowIndex === index ? '900' : 'normal',
                                                        }}>
                                                        <td>{feature.properties.fra_brønd}</td>
                                                        <td>{feature.properties.til_brønd}</td>
                                                        <td>{feature.properties.system}</td>
                                                        <td>{feature.properties.kategori}</td>
                                                        <td>{feature.properties.materiale}</td>
                                                        <td>{feature.properties.handelsmål}</td>
                                                        <td>{feature.properties.længde}</td>
                                                        <td>{feature.properties.fra_kote}</td>
                                                        <td>{feature.properties.til_kote}</td>
                                                        <td>MANGLER !</td>
                                                        <td>{feature.properties.fysiskindeks}</td>
                                                        <td>---</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
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
            // backboneEvents.get().trigger("sqlQuery:clear");
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