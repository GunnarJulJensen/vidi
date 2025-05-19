import { name } from 'mustache';

const XLSX = require('xlsx');
export default class SelectedFeaturesManager {
  constructor(mapRef, backboneEvents, MAPSTATUS_MODULE_NAME) {
    this._geojson = { type: "FeatureCollection", features: [] };
    this._geojsonLayer = null;
    this.map = mapRef;
    this.selectedFeatureId = null;
    this.backboneEvents = backboneEvents;
    this.MAPSTATUS_MODULE_NAME = MAPSTATUS_MODULE_NAME;

    this.colorStyle = { color: '#ffd000', weight: 12, opacity: 0.4 };
    this.hiliteStyle = { color: '#800080', weight: 20, opacity: 0.25 };
  }


  clear() {
    try {
      if (this._geojsonLayer && this._geojsonLayer.clearLayers) {
        this._geojsonLayer.clearLayers();
      }
      this._geojson.features = [];
    } catch (e) {
      console.error("Error in selectedFeaturesClear: " + e);
    }
  }

  addFeature(feature) {
    Object.keys(feature.properties).forEach(key => {
      if (!feature.properties[key]) {
        feature.properties[key] = '';
      }
    });
    this._geojson.features.push(feature);
  }

  length() {
    return this._geojson.features.length;
  }

  addExtraProperties() {
    if (!this._geojson.features.length) return;

    this._geojson.features.forEach(feature => {
      if (!feature.properties.hasOwnProperty("isSelected")) {
        feature.properties.isSelected = true;
      }
      if (!feature.properties.hasOwnProperty("bem")) {
        feature.properties.bem = "...";
      }
    });
  }

  zoomToFeature(feature) {
    const bounds = L.geoJSON(feature).getBounds();
    this.map.fitBounds(bounds, { maxZoom: 21 });
    this.map.setView(bounds.getCenter(), this.map.getZoom(), { animate: true });
  }

  getFeatures() {
    return this._geojson.features;
  }

  updateFeature(hiliteFeatureId = null) {
    this.addExtraProperties();

    if (this._geojsonLayer) {
      this._geojsonLayer.clearLayers();
    }

    this._geojsonLayer = L.geoJSON(this._geojson, {
      style: (feature) => {
        if (hiliteFeatureId && feature.properties.id === hiliteFeatureId) {
          return this.hiliteStyle;
        }
        return this.colorStyle;
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties?.id) {
          layer.on('click', () => {
            //   Denne er fjernet så kortet ikke hopper når der klikkes på en feature
            // this.zoomToFeature(feature);
            this.selectedFeatureId = feature.properties.id;
            this.hilite(this.selectedFeatureId);
            this.backboneEvents.get().trigger(`${this.MAPSTATUS_MODULE_NAME}:updateSelected`, this.selectedFeatureId);
          });
        }
      }
    }).addTo(this.map);
  }

  hilite(hiliteFeatureId) {
    if (!hiliteFeatureId) return;

    Object.values(this.map._layers).forEach(layer => {
      if (layer instanceof L.GeoJSON) {
        layer.eachLayer(featureLayer => {
          const id = featureLayer.feature?.properties?.id;
          featureLayer.setStyle(id === hiliteFeatureId ? this.hiliteStyle : this.colorStyle);
        });
      }
    });
  }

  byId(featureId) {
    const feature = this._geojson.features.find(f => f.properties.id === featureId);
    if (!feature) {
      console.error("Feature not found with id: " + featureId);
      return null;
    }
    return feature;
  }

  updateFeatureProperty(featureId, propertyName, value) {
    const feature = this.byId(featureId);
    if (feature && feature.properties.hasOwnProperty(propertyName)) {
      feature.properties[propertyName] = value;
    }
  }


  async saveProjectAsync(skema, projektData) {
    try {

      const projectBody = {
        ...projektData,
        skema: skema,
        geojson: this._geojson // overskriv geojson
      };

      const url = `/api/extension/mapstatus/saveproject/`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (e) {
      console.error("Error in saveProjectAsync:", e);
      return {};
    }
  }


  async fetchDataAsync(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }


  async getProjectAsync(projektId, projektData) {

    if (!projektId) {
      console.error("No projektId provided");
      return;
    }
    const data = await this.fetchDataAsync(`/api/extension/mapstatus/GetProject/${projektId}`);
    if (data && data.features && data.features.length > 0) {
      Object.assign(projektData, data.features[0].properties);
      this.clear();
      if (data.features && data.features[0].properties.geojson) {
        const geojson = JSON.parse(data.features[0].properties.geojson);
        for (let i = 0; i < geojson.features.length; i++) {
          const feature = geojson.features[i];
          this.addFeature(feature);
        }
      }
    }
    return projektData;
  }



  async getAllProjects(skema) {
    try {

      const url = `/api/extension/mapstatus/GetProjects/${skema}`;
      const data = await this.fetchDataAsync(url);
      const projects = data.features.map((feature) => ({ id: feature.properties.id, label: feature.properties.navn }));
      projects.unshift({ id: 0, label: "Vælg projekt" });

      return projects;
    } catch (e) {
      console.error("Error in getAllProjects: " + e);
      return {};
    }
  }


  /*********************************************************************************************************************  
  *  Det er valgt at hårdkode kolonneoverskrifterne i stedet for at hente dem fra geojson filen aht. projektet omfang. * 
  *  Det vil sige at hvis kolonner ændres, fjernes eller tilføjes skal det rettes både her og i FeatureTable.js.       *
  **********************************************************************************************************************/
  downloadExcel(filename) {

    const headers = [
      'Opstr.',
      'Nedstr.',
      'System',
      'Kategori',
      'Materiale',
      'Rør diameter',
      'Længde',
      'Fra kote',
      'Til kote',
      'Dybde',
      'Fysisk indeks',
      'Bemærkning'];

    const rows = this._geojson.features
      .filter(f => f.properties.isSelected === true)
      .map(f => ({
        [headers[0]]: f.properties.fra_brønd,
        [headers[1]]: f.properties.til_brønd,
        [headers[2]]: f.properties.system,
        [headers[3]]: f.properties.kategori,
        [headers[4]]: f.properties.materiale,
        [headers[5]]: f.properties.handelsmål,
        [headers[6]]: f.properties.længde,
        [headers[7]]: f.properties.fra_kote,
        [headers[8]]: f.properties.til_kote,
        [headers[9]]: f.properties.dybde,
        [headers[10]]: f.properties.fysiskindeks,
        [headers[11]]: f.properties.bem
      }));

    if (rows.length === 0) {
      console.error("No features to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, filename + ".xlsx");
  }
}
