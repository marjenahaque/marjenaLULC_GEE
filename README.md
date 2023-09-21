# Land use or Landcover classification by Google Earth Engine using Random Forest Classification
This repository contains a Google Earth Engine (GEE) code for classifying Landsat satellite imagery from the year 1990 into different land cover classes using Random Forest classification. The code also includes cloud masking, vegetation indices calculation (NDVI and NDBI), and export of the classified image to Google Drive.

## Usage
1. Ensure you have access to Google Earth Engine (GEE) and have the necessary permissions to run scripts.
1. Open the Google Earth Engine Code Editor.
1. Paste the provided code into the Code Editor.
1. Customize parameters like date, region of interest (ROI), and visualization options as needed.
1. Run the script by clicking the "Run" button in the Code Editor.
## Code Overview
**"cloudMaskL457"**:
This function masks clouds based on the pixel_qa band of Landsat SR data. It identifies bad pixels (clouds) and removes them from the imagery.

**"indices"**:
This function calculates vegetation indices (NDVI and NDBI) from the Landsat imagery.

## Workflow
1. **Data Preparation**

  - Landsat 5 imagery for the year 1990 is retrieved and filtered based on date and region of interest (ROI).
  - Clouds are masked using the cloudMaskL457 function.
  - Vegetation indices (NDVI and NDBI) are calculated using the indices function.
2. **Visualization**
  
  - Landsat imagery, NDVI, and NDBI are visualized on the map.
3. **Land Cover Classification**

  - A Random Forest classifier is trained using training samples from predefined land cover classes based on selected bands.
  - The trained classifier is validated, and its accuracy is assessed.
  - The classifier is applied to classify the Landsat imagery into land cover classes.
4. **Result Visualization and Export**

  - The resulting classification is visualized on the map.
  - The classified image is exported to Google Drive for further analysis.
  - Contributing
  - Contributions and improvements are welcome. If you find any issues or have suggestions, feel free to open an issue or create a pull   request.

Note: Make sure to have the required datasets available and properly defined (e.g., **roi**, land cover classes) before running the script. Also, adjust any parameters based on your specific requirements.
