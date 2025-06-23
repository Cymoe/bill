# Map Property Intelligence Features

## Overview
Enhanced map features that provide property-specific data to help with project estimation, planning, and material calculations.

## Current Implementation
- Interactive project map with status-based markers
- Marker clustering for multiple projects at same location
- Real-time updates for project changes
- Filter integration with project list

## Property Intelligence Features

### 1. Property Boundaries
Display actual parcel boundaries when clicking on a project marker.

**Data Sources:**
- **OpenStreetMap** (Free)
  - Building footprints available globally
  - Basic property outlines
  - Community-maintained data
  
- **County Assessor APIs** (Varies by location)
  - Official parcel boundaries
  - Legal lot lines
  - More accurate but availability varies
  
- **Commercial Services**
  - **Regrid API**: Nationwide parcel data
  - **Loveland Technologies**: Comprehensive property data
  - **CoreLogic**: Professional-grade property intelligence

**Implementation Benefits:**
- See exact property boundaries before site visit
- Understand lot constraints and setbacks
- Identify adjacent properties

### 2. Building Footprint & Square Footage
Calculate and display building measurements directly on the map.

**Available Data:**
- Building outline/footprint
- Approximate square footage (calculated from footprint)
- Number of floors (where available)
- Roof area calculations
- Building height estimates

**Use Cases:**
- Roofing projects: Calculate roof area for materials
- Siding/painting: Estimate exterior wall area
- Landscaping: Understand building placement on lot
- HVAC: Size systems based on square footage

### 3. Property Attributes
Additional property intelligence data:

- **Lot Information**
  - Total lot size
  - Lot dimensions
  - Zoning classification
  - Setback requirements

- **Building Details**
  - Year built
  - Building type (residential, commercial, multi-family)
  - Construction type
  - Number of units

- **Site Features**
  - Driveway location
  - Pool/deck presence
  - Outbuildings
  - Tree coverage

### 4. Measurement Tools
Interactive tools for custom measurements:

- **Distance Tool**: Measure linear distances on map
- **Area Tool**: Draw polygons to calculate areas
- **Elevation Profile**: View elevation changes across property
- **Sun Exposure**: Analyze sun patterns for solar projects

## Implementation Priority

### Phase 1: Basic Property Boundaries (Current Focus)
- Integrate OpenStreetMap building footprints
- Display building outlines when marker clicked
- Calculate basic square footage

### Phase 2: Enhanced Data
- Add parcel boundary data
- Integrate county assessor information
- Add measurement tools

### Phase 3: Advanced Intelligence
- Historical permit data
- Utility line locations
- Neighborhood comparables
- Environmental factors

## Technical Considerations

### Data Caching
- Cache property data to reduce API calls
- Store calculated measurements in database
- Update cache periodically

### Performance
- Load property data on-demand (when marker clicked)
- Use vector tiles for building footprints
- Implement level-of-detail rendering

### Accuracy Disclaimers
- Always verify measurements on-site
- Data accuracy varies by source
- Building footprints are approximations

## API Options & Pricing

### Free Options
- **OpenStreetMap Overpass API**: Free, community data
- **County GIS Portals**: Many counties offer free parcel data

### Commercial Options
- **Regrid**: ~$0.01-0.10 per parcel lookup
- **Loveland**: Starting at $199/month
- **Google Maps Platform**: Building insights API pricing varies

## Future Enhancements

1. **AR Integration**: View property boundaries through phone camera
2. **Historical Imagery**: See property changes over time
3. **Permit History**: Display past permits and work done
4. **Material Calculators**: Auto-calculate materials based on measurements
5. **3D Building Models**: Where available from city data

## Security & Privacy
- Only show data for properties with active projects
- Respect privacy laws regarding property data
- Allow clients to opt-out of detailed property display