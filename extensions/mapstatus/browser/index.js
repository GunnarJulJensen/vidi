/*
 * @author     Gunnar Jul Jensen <gjj@geopartner.dk>
 * @copyright  
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';
import React from 'react';

import CreateProjectForm from "./CreateProjectForm.js";
import DraggableBox from "./DraggableBox.js";
import EditDialog from './EditDialog.js';
import FeatureTable from "./FeatureTable.js";
import ProjectSelector from "./ProjectSelector.js";
import SelectedFeaturesManager from './SelectedFeaturesManager.js';
import styleObject from "./style.js";
import { convert as geojsonToWKT } from "terraformer-wkt-parser";




const MAPSTATUS_MODULE_NAME = `mapstatus`;

require("./style.js");

let backboneEvents;
let qstore = [];

let _self = false;
var cloud;
let drawControl = null;
let featuresManager = null;
let meta;
let sqlQuery;
var layerTree = require("./../../../browser/modules/layerTree");

var switchLayer = require("./../../../browser/modules/switchLayer");
var utils;

const _makeSearch = (wkt) => {
    try {
        const fullLayerName = _self.fullLayerName("ledning_drift");
        featuresManager?.clear();

        if (!wkt || !fullLayerName) {
            return;
        }
        new Promise((resolve, reject) => {
            sqlQuery.init(qstore, wkt, "4326", () => {
                if (qstore.length >= 1 && qstore[0].geoJSON) {
                    const promises = qstore[0].geoJSON.features.map(
                        feature =>
                            featuresManager?.addFeature(feature)
                    );
                    Promise.all(promises).then(resolve).catch(reject);
                } else {
                    resolve();
                }
            }, null, null, null, [fullLayerName], true, null, null);
        }).then(() => {
            featuresManager?.updateFeature(0);
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
        try {
            featuresManager = new SelectedFeaturesManager(cloud.get().map, backboneEvents, MAPSTATUS_MODULE_NAME);

        } catch (e) {
            alert("Error in MapStatus: " + e);
        }
        class MapStatus extends React.Component {

            constructor(props) {
                super(props);
                this.state = {
                    createProjectShow: false,
                    projectName: "",
                    projectDescription: "",
                    activeProject: this.createProjectData() || {},
                    projects: [],
                    //selectedProjectId: 0,
                    selectedRowIndex: -1,
                    showModal: false,
                    selectedFeatureId: 0,
                    selectedFeature: {},
                    isLoggedIn: false

                };

            }

            rowRefs = [];

            buildProjectList = () => {
                const skema = this.getSkema();
                featuresManager?.getAllProjects(skema)
                    .then((projectOptions) => {
                        this.setState({ projects: projectOptions });
                        this.setState({ isLoggedIn: true });
                    })
                    .catch((error) => {
                        this.setState({ isLoggedIn: false });
                        this.forceUpdate();
                    });
            };
            scrollToRow = () => {
                const row = this.rowRefs[this.state.selectedRowIndex];
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };

            componentDidMount() {
                $('.bi-layout-text-window').on('click', function () { });
                backboneEvents.get().on(`${MAPSTATUS_MODULE_NAME}:update`, () => {
                    this.forceUpdate();
                });
                backboneEvents.get().on(`${MAPSTATUS_MODULE_NAME}:updateSelected`, (selectedFeatureId) => {
                    if (!selectedFeatureId)
                        return;
                    const si = featuresManager?.getFeatures().findIndex(feature => feature.properties.id == selectedFeatureId);
                    this.state.selectedRowIndex = si;
                    this.setState({ selectedRowIndex: si });
                    this.scrollToRow();
                    featuresManager?.hilite(selectedFeatureId);
                    this.forceUpdate();

                });

                this.buildProjectList();

            };

            createProjectData() {
                return {
                    id: 0,
                    navn: 'Uden navn',
                    beskrivelse: '',
                    skema: ''
                };
            }

            componentDidUpdate(prevProps, prevState) { }

            featureRowClick(feature, index) {
                this.setState({ selectedRowIndex: index });
                this.setState({ selectedFeatureId: feature.properties.id });
                featuresManager?.zoomToFeature(feature);
                featuresManager?.updateFeature(feature.properties.id); // Opdaterer stilen for den valgte feature
            };

            showCreateProjectModal = (show) => {
                this.setState({ createProjectShow: show });
            };

            addProject = (projectName) => {
                const value = this.state.projects.length + 1;
                this.state.projects.push({ value, label: projectName });
                this.setState({ projectName: '' });
                this.setState({ projectDescription: '' });
                this.setState({ selectedProjectId: value });
                this.setState(prevState => ({ projektData: { ...prevState.projektData, navn: projectName } }));
                this.showCreateProjectModal(false)


                this.forceUpdate();
                alert("Projekt oprettet: " + projectName);
            };

            getSkema = () => {
                const words = window.location.pathname.split("/").filter(Boolean);
                return words.length > 0 ? words[words.length - 1] : '';
            }

            getProjectName = () => {
                let projectName = this.getSkema();
                projectName = projectName.replace('dd_', '');
                projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1)
                return projectName;
            }    


            handleProjectName = (event) => {
                this.setState({ projectName: event.target.value });
                this.state.projectName = event.target.value;
                this.forceUpdate();
            };

            handleProjectBem = (bemark) => {
                const editFeature = JSON.parse(JSON.stringify(this.state.selectedFeature));
                editFeature.properties.bem = bemark;
                this.setState({ selectedFeature: editFeature });
            };

            handleFeatureEdit = (save) => {
                if (save) {
                    const featureId = this.state.selectedFeature.properties.id;
                    const bemark = this.state.selectedFeature.properties.bem.trim();

                    if (featureId) {
                        featuresManager?.updateFeatureProperty(featureId, "bem", bemark); // selectedFeatureUpdate(featureId, "bem", bemark);
                        backboneEvents.get().trigger(`${MAPSTATUS_MODULE_NAME}:update`);
                    } else {
                        console.error("Feature not found with id: " + featureId);
                    }
                }
                this.setState({ showModal: false })
            };

            exportExcel = () => {
                const name = this.state.activeProject?.navn || this.state.projectName;
                featuresManager?.downloadExcel(name);
            };

            handleProjectSelect = (selectedProjectId) => {
                _self.active(true);
                featuresManager?.getProjectAsync(selectedProjectId, this.createProjectData())
                    .then((data) => {
                        this.setState({ activeProject: data });
                        this.setState({ projektData: data });
                        this.forceUpdate();
                    })
                    .catch((error) => {
                        console.error("Error fetching project:", error);
                    });
            };

            handleNewProjectStart = () => {
                this.setState({ createProjectShow: true });
                _self.active(true);
                this.setState({ activeProject: this.createProjectData() });
                this.setState({ selectedRowIndex: -1 });
                this.setState({ showModal: false });
                this.showCreateProjectModal(true)
                featuresManager?.clear();
            }


            render() {
                const { activeProject, createProjectShow, isLoggedIn, showModal, selectedFeature } = this.state;
                const isProjectSelected = activeProject.id !== 0;
                const getProjectName = this.getProjectName();
                return (
                    <div role="tabpanel">
                        <p className='h2' >{`Projekt: ${getProjectName}`  } </p> 
                        <div className="form-select mb-3" style={styleObject.noFormUrl}>
                            <div className="row flex">
                                <div className="col-sm-8">
                                    <ProjectSelector
                                        projects={this.state.projects}
                                        selectedProject={this.state.selectedProject}
                                        onSelectChange={this.handleProjectSelect}
                                        onCreateClick={this.handleNewProjectStart}
                                        onStartClick={this.buildProjectList}
                                    />
                                </div>
                                {isProjectSelected && (
                                    <div className="d-flex justify-content-between col-sm-4 h-50 d-inline-block" >
                                        <button className="btn btn-primary" onClick={() => this.exportExcel()}>
                                            Excel
                                        </button>
                                    </div>)}
                            </div>
                        </div>


                        {createProjectShow && (
                            <CreateProjectForm
                                projectName={this.state.projectName}
                                projectDescription={this.state.projectDescription}
                                onProjectNameChange={this.handleProjectName}
                                onProjectDescriptionChange={(e) => this.setState({ projectDescription: e.target.value })}
                                onClose={() => this.showCreateProjectModal(false)}
                                onSave={() => this.addProject(this.state.projectName)}
                            />
                        )}


                        {featuresManager && featuresManager.length() > 0 && (
                            <DraggableBox
                                style={styleObject.boxStyle}
                                headerText={`Underprojekt: ${this.state.activeProject.navn} Antal ledninger: ${featuresManager.length()}`}
                                onSave={() => {
                                    const skema = this.getSkema();
                                    featuresManager?.saveProjectAsync(skema, this.state.activeProject);
                                }}
                            >
                                <FeatureTable
                                    features={featuresManager.getFeatures()}
                                    selectedRowIndex={this.state.selectedRowIndex}
                                    onRowClick={(feature, index) => {
                                        this.setState({ selectedRowIndex: index, selectedFeatureId: feature.properties.id });
                                        featuresManager?.zoomToFeature(feature);
                                        featuresManager?.updateFeature(feature.properties.id);
                                    }}
                                    onCheckboxChange={(featureId, checked) => {
                                        this.setState({ selectedFeatureId: featureId });
                                        featuresManager?.updateFeatureProperty(featureId, "isSelected", checked);
                                    }}
                                    onEditClick={(id) => {
                                        const feature = featuresManager.byId(id);
                                        if (feature) this.setState({ showModal: true, selectedFeature: feature });
                                    }}
                                    rowRefs={this.rowRefs}
                                    styles={styleObject}
                                />
                            </DraggableBox>
                        )}
                        {this.state.showModal && (
                            <EditDialog
                                onBemChange={this.handleProjectBem}
                                onClose={() => this.handleFeatureEdit(false)}
                                onSave={() => this.handleFeatureEdit(true)}
                                feature={this.state.selectedFeature}
                                styles={styleObject}
                            />
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

        cloud.get().map.on('draw:editstop', function (e) {
            _self.startShapeSearch(e);
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