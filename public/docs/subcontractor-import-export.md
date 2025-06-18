# Subcontractor Import/Export Functionality

## Overview

Added comprehensive import and export functionality to the Subcontractors list, following the same design pattern as the Work page. Users can now easily import and export subcontractor data in both CSV and Excel formats.

## Features Added

### Export Functionality
- **Export to CSV**: Exports all filtered subcontractors to a CSV file
- **Export to Excel**: Exports to an Excel file with multiple sheets:
  - **Subcontractors Sheet**: Complete subcontractor data
  - **Summary Sheet**: Overview statistics and metrics
  - **Trade Breakdown Sheet**: Analysis by trade category

### Import Functionality
- **Import from CSV**: Supports CSV files with standard column headers
- **Import from Excel**: Supports Excel files (.xlsx, .xls)
- **Data Validation**: Validates required fields and data types
- **Error Reporting**: Provides detailed feedback on import issues

## User Interface

### Options Dropdown
Located in the top-right corner of the subcontractors list controls section, the options dropdown includes:
- Import Subcontractors
- Export to CSV  
- Export to Excel

The dropdown follows the same design pattern as the Work page for consistency.

## Data Fields

### Export Fields
All exports include the following fields:
- Name
- Company Name
- Email
- Phone
- Address
- City
- State
- ZIP
- Trade Category
- Specialty
- Hourly Rate
- License Number
- Certification Info
- Insurance Info
- Rating
- Is Preferred (Yes/No)
- Notes
- Project Count
- Total Value

### Import Requirements
**Required Fields:**
- Name (required)
- Trade Category OR Specialty (at least one required)

**Optional Fields:**
- All other fields are optional but recommended for complete data

### Import Data Format

#### CSV Format
```csv
Name,Company Name,Email,Phone,Trade Category,Specialty,Hourly Rate,Rating,Is Preferred
John Smith,Smith Electric,john@smithelectric.com,555-0123,Electrical,Residential Wiring,75,4.5,Yes
```

#### Excel Format
Standard Excel format with column headers in the first row. The import will read from the first sheet.

## File Naming Convention

### Export Files
- CSV: `subcontractors_YYYY-MM-DD_HH-mm.csv`
- Excel: `subcontractors_YYYY-MM-DD_HH-mm.xlsx`

## Technical Implementation

### Services Created
- **SubcontractorExportService**: Handles all import/export operations
- **Export Methods**: `exportToCSV()`, `exportToExcel()`
- **Import Methods**: `import()`, `parseCSV()`, `parseExcel()`

### Activity Logging
All import/export operations are logged to the activity system for audit tracking.

### Error Handling
- Comprehensive error handling with user-friendly messages
- Import validation with detailed error reporting per row
- Graceful failure handling for unsupported file formats

## Usage

1. **Export**: Click the options menu (⋮) in the top-right → Choose export format
2. **Import**: Click the options menu (⋮) → Import Subcontractors → Select file

## Benefits

- **Data Portability**: Easy migration and backup of subcontractor data
- **Bulk Operations**: Import multiple subcontractors at once
- **Integration**: Export data for use in other systems
- **Analysis**: Excel exports include summary analytics
- **Consistency**: Matches the design pattern of other list views in the application