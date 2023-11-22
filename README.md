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

  - Clouds are masked using the cloudMaskL457 function.
  ```javascript
var cloudMaskL457 = function(image) {
  var qa = image.select('pixel_qa');
    var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};
//.......................indices................
  var indices = function(img) {
    // NDVI
    var ndvi = img.normalizedDifference(['B4','B3']).rename('NDVI');
    var ndbi = img.normalizedDifference(['B5','B4']).rename(['ndbi']);
    
    return img.addBands(ndvi).addBands(ndbi)
  }
```
  - Landsat 5 imagery for the year 1990 is retrieved and filtered based on date and region of interest (ROI).
```javascript
var L7 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                  .filterDate('1990-01-01', '1990-12-31')
                  .filterBounds(roi)
                  .map(cloudMaskL457)
                  .map(indices)
                  .map(function(image){return image.clip(roi)})
                  .mosaic();
```
  - Vegetation indices (NDVI and NDBI) are calculated using the indices function.
```javascript
//NDVI
var ndvi= L7.select ('NDVI');
var NDVIvisprms = {min: .275, max: 1, palette: ['black','green']};

//NDBI
var ndbi= L7.select('ndbi');

var ndbivisprms={ min:.1, max:.3, palette:['white','red']}
```
2. **Visualization**
  
  - Landsat imagery, NDVI, and NDBI are visualized on the map.
```javascript
Map.addLayer(L7, visParams);
Map.addLayer(ndvi, NDVIvisprms,'NDVI')
Map.addLayer(ndbi, ndbivisprms,'ndbi')
```
3. **Land Cover Classification**

  - A Random Forest classifier is trained using training samples from predefined land cover classes(forest, agriculture, water, buildup area) based on selected bands.
  ```javascript
var classes= FRST.merge(AGRL).merge(WATR).merge(BUILD)
var bands = ['B4','B5','B3','ndbi','NDVI']
var image = L7.select(bands);

var samples = image.sampleRegions({
  collection: classes, // set of geometries selected for trainig
  properties: ['LC'],
  scale:30
}).randomColumn('random');
var split = 0.8;
var training = samples.filter(ee.Filter.lt('random',split));
var testing = samples.filter(ee.Filter.gte('random',split));
```
  - The trained classifier is validated, and its accuracy is assessed.
  - The classifier is applied to classify the Landsat imagery into land cover classes.
```javascript
var classifier= ee.Classifier.smileRandomForest(5).train({
  features: training.select(['B4','B5','B3','ndbi','NDVI','LC']),
  classProperty: 'LC',
  inputProperties: bands
});
print(classifier.explain());

var validation= testing.classify(classifier);
var testAccuracy = validation.errorMatrix('LC','classification');
print('Valitation error matrix RF:',testAccuracy);
print('Validation overall accuracy RF:',testAccuracy.accuracy());
var classed = image.classify(classifier);
```
   ![lulc](https://github.com/marjenahaque/marjenaLULC_GEE/assets/113544123/5c8052d6-9956-4834-81a0-e06529441352)
               Layers of Natural image, (SWIR1+red+SWIR2), NDVI and classified image

4. **Result Visualization and Export**

  - The resulting classification is visualized on the map.
  - The classified image is exported to Google Drive for further analysis.
```javascript
Map.addLayer(classed.clip(roi),{min:1, max: 4,
  palette:['darkgreen','lightgreen','darkblue','red']},'classified');

Export.image.toDrive({
  image: classed.visualize({min:1, max: 4,
  palette:['darkgreen','lightgreen','darkblue','red']}),
  description:1990,
  region:roi,
  scale: 30,
  maxPixels:1e13
})
```

![image](https://github.com/marjenahaque/marjenaLULC_GEE/assets/113544123/99a9fa72-04b6-49a4-8b8c-1adad2e352ed)

### **Contributing**
  - Contributions and improvements are welcome. If you find any issues or have suggestions, feel free to open an issue or create a pull   request.

Note: Make sure to have the required datasets available and properly defined (e.g., **roi**, land cover classes) before running the script. Also, adjust any parameters based on your specific requirements.
