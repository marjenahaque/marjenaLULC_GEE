/**
 * Function to mask clouds based on the pixel_qa band of Landsat SR data.
 * @param {ee.Image} image Input Landsat SR image
 * @return {ee.Image} Cloudmasked Landsat image
 */
var cloudMaskL457 = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  // Remove edge pixels that don't occur in all bands
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
var L7 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                  .filterDate('1990-01-01', '1990-12-31')
                  .filterBounds(roi)
                  .map(cloudMaskL457)
                  .map(indices)
                  .map(function(image){return image.clip(roi)})
                  .mosaic();

var visParams = {
  bands: ['B3', 'B2', 'B1'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};

//NDVI
var ndvi= L7.select ('NDVI');
var NDVIvisprms = {min: .275, max: 1, palette: ['black','green']};

//NDBI
var ndbi= L7.select('ndbi');

var ndbivisprms={ min:.1, max:.3, palette:['white','red']}
Map.addLayer(L7, visParams);
Map.addLayer(ndvi, NDVIvisprms,'NDVI')
Map.addLayer(ndbi, ndbivisprms,'ndbi')
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

print('samples n =',samples.aggregate_count('.all'));
print('training n =',training.aggregate_count('.all'));
print('testing n =',testing.aggregate_count('.all'));

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
