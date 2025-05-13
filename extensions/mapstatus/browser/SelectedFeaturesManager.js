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
            this.zoomToFeature(feature);
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
  saveToDb(projektId) {
    alert($`Gemmer projet {projektId} til DB`);
  }

  getFromDb(projektId) {
    alert("Henter fra DB " + projektId);
    // const url = `/api/extension/mapstatus/GetProject/${skema}`;
    
  }

  async getAllProjects(skema) {
    try {
      const url = `/api/extension/mapstatus/GetProjects/${skema}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
           
      const projects = data.features.map((feature) => ({ id: feature.properties.id, label: feature.properties.navn }));      
      projects.unshift({ id: 0, label: "Vælg projekt" });
      
      return projects ;
    } catch (e) {
      console.error("Error in getAllProjects: " + e);
      return {};
    }
  }


  /* 
    Det er valgt at hårdkode kolonneoverskrifterne i stedet for at hente dem fra geojson filen aht. projektet omfang.
    Det vil sige at hvis kolonner ændres, fjernes eller tilføjes skal det rettes både her og i FeatureTable.js.

  */
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

    const rows = this._geojson.features.map(f => ({
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


    const data = [headers, ...rows];
    const worksheet = XLSX.utils.json_to_sheet(data);
    // const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    // const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, filename + ".xlsx");
  }
}
