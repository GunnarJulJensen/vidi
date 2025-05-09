
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
  }
  