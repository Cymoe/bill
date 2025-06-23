# Property Intelligence Services - How Professional Tools Do It

## Overview
Professional construction/roofing software achieves precise property data through a combination of:
1. Aerial/satellite imagery providers
2. AI/ML for building detection
3. Government parcel data
4. Manual adjustment tools

## Major Data Providers

### 1. **Nearmap** (Used by many roofing tools)
- High-resolution aerial imagery (5.5-7.5cm per pixel)
- Updated 2-3 times per year
- AI-powered roof detection and measurement
- 3D modeling capabilities
- **API Access**: Yes, with measurement tools
- **Cost**: Enterprise pricing ($10k-50k+ annually)
- **Coverage**: US, Canada, Australia, New Zealand

### 2. **EagleView (Pictometry)**
- Industry leader in aerial measurement reports
- Oblique imagery (angled views) for accurate measurements
- Automated roof reports with slopes, facets, and measurements
- **Products**: 
  - CONNECTExplorer API
  - Property data API
  - Measurement reports
- **Cost**: Per-report pricing (~$15-75 per property)
- **Integration**: REST API, SDKs available

### 3. **Loveland Technologies (Regrid)**
- Nationwide parcel boundary data
- 150+ million parcels
- Property details, ownership, zoning
- **API Features**:
  ```javascript
  // Example API call
  GET https://app.regrid.com/api/v1/parcel
  ?lat=40.7128&lng=-74.0060
  ```
- **Cost**: $199-999/month depending on usage
- **Best for**: Accurate parcel boundaries

### 4. **CoreLogic**
- Comprehensive property data
- Building footprints, parcel boundaries
- Property characteristics
- **Cost**: Enterprise pricing
- **Coverage**: Nationwide

### 5. **Google Maps Platform**
- Building Insights API (new)
- Solar API with roof geometry
- Street View for validation
- **Example**:
  ```javascript
  // Building Insights API
  const response = await fetch(
    `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${API_KEY}`
  );
  ```
- **Cost**: $0.01-0.02 per request
- **Limitations**: Limited to solar data, US only

## How Professional Tools Implement This

### Roofr's Approach:
1. **Initial geocoding**: Standard address geocoding
2. **Aerial imagery overlay**: Nearmap or similar provider
3. **AI detection**: Automatically detect building outline
4. **Manual adjustment**: User can adjust pin to building center
5. **Measurement tools**: Draw and measure on imagery

### RoofSnap's Method:
1. **EagleView integration**: Direct integration for reports
2. **In-app adjustments**: Drag marker to roof center
3. **Satellite view**: Multiple imagery sources
4. **Sketch tools**: Draw directly on imagery

### Implementation Strategy for Your App

#### Phase 1: Basic Enhancement (Low Cost)
```javascript
// 1. Add manual marker adjustment
const enableMarkerDragging = (marker, project) => {
  marker.setDraggable(true);
  marker.on('dragend', async () => {
    const position = marker.getLngLat();
    // Save adjusted coordinates
    await updateProjectCoordinates(project.id, position);
  });
};

// 2. Use Google Building Insights for solar projects
const getBuildingInsights = async (lat, lng) => {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const response = await fetch(
    `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${API_KEY}`
  );
  return response.json();
};
```

#### Phase 2: Regrid Integration (Medium Cost)
```javascript
// Get precise parcel boundaries
const getParcelData = async (lat, lng) => {
  const response = await fetch(
    `https://app.regrid.com/api/v1/parcel?lat=${lat}&lng=${lng}`,
    {
      headers: {
        'Authorization': `Bearer ${REGRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return {
    parcelBoundary: data.geometry,
    parcelNumber: data.properties.parcel_number,
    owner: data.properties.owner,
    area: data.properties.area_acres,
    zoning: data.properties.zoning
  };
};
```

#### Phase 3: Aerial Imagery (Higher Cost)
```javascript
// Nearmap integration example
const getAerialImagery = async (lat, lng) => {
  const bounds = calculateBounds(lat, lng, 200); // 200m radius
  
  const response = await fetch(
    `https://api.nearmap.com/v3/tile/${zoom}/${x}/${y}`,
    {
      headers: {
        'Authorization': `Bearer ${NEARMAP_API_KEY}`
      }
    }
  );
  
  // Add as map layer
  map.addSource('nearmap', {
    type: 'raster',
    tiles: [`https://api.nearmap.com/v3/tile/{z}/{x}/{y}`],
    tileSize: 256
  });
};
```

## Cost-Effective Implementation

### Recommended Approach for Your App:

1. **Start with Regrid** ($199/month)
   - Accurate parcel boundaries
   - Good enough for most use cases
   - Simple API integration

2. **Add Manual Adjustment**
   - Let users drag markers to building center
   - Save adjusted coordinates
   - Show both original and adjusted positions

3. **Implement Measurement Tools**
   - Use MapLibre GL Draw for measuring
   - Calculate areas and distances
   - Save measurements with projects

4. **Consider Google Building Insights**
   - Only for solar-related projects
   - Provides roof geometry
   - Very affordable per-request pricing

### Sample Implementation:

```javascript
// Enhanced property data service
class PropertyIntelligenceService {
  constructor() {
    this.providers = {
      regrid: new RegridProvider(),
      osm: new OSMProvider(),
      google: new GoogleProvider()
    };
  }

  async getPropertyData(address, coordinates) {
    // 1. Try Regrid for parcel boundaries
    try {
      const parcelData = await this.providers.regrid.getParcel(coordinates);
      if (parcelData) {
        return {
          source: 'regrid',
          parcel: parcelData,
          confidence: 'high'
        };
      }
    } catch (error) {
      console.error('Regrid failed:', error);
    }

    // 2. Fallback to Google Building Insights
    try {
      const buildingData = await this.providers.google.getBuildingInsights(coordinates);
      if (buildingData) {
        return {
          source: 'google',
          building: buildingData,
          confidence: 'medium'
        };
      }
    } catch (error) {
      console.error('Google failed:', error);
    }

    // 3. Final fallback to OSM
    const osmData = await this.providers.osm.getBuilding(coordinates);
    return {
      source: 'osm',
      building: osmData,
      confidence: 'low'
    };
  }
}
```

## ROI Considerations

### For a Construction/Invoicing App:
- **Regrid**: Best ROI for accurate property boundaries
- **Manual adjustment**: Free and solves 90% of issues
- **Google Building Insights**: Great for solar contractors
- **Nearmap/EagleView**: Only if measurements are core to your business

### Quick Wins:
1. Implement draggable markers (free)
2. Add satellite/aerial basemap toggle (free with Mapbox/MapLibre)
3. Store adjusted coordinates per project
4. Add basic measurement tools
5. Consider Regrid for $199/month when you have 50+ active users

## Security & Privacy
- Always get user consent before accessing property data
- Some states have restrictions on property data usage
- Store API keys securely (environment variables)
- Cache responses to reduce API costs
- Respect rate limits

## Next Steps
1. Start with manual marker adjustment
2. Add measurement tools using MapLibre GL Draw
3. Test Regrid API with free trial
4. Implement based on user feedback and needs