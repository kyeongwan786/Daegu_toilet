const $map = document.getElementById('map-container');
const $mapElement = document.getElementById('map');
const $toyBtn = $map.querySelector(':scope > .control-buttons > .control-button.toilet-finder > .icon-button');
const $nowBtn = $map.querySelector(':scope > .control-buttons > .control-button.location-finder > .icon-button');
const $infoPanel = $map.querySelector(':scope > .info-panel');

const mapInstance = new kakao.maps.Map($mapElement, {
   center: new kakao.maps.LatLng(35.8655753, 128.59339)
});