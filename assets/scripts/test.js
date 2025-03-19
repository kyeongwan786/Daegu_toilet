const $map = document.getElementById('map');
const $toyBtn = $map.querySelector(':scope > .loc-to > .toilet > .button');
const $nowBtn = $map.querySelector(':scope > .loc-to > .location > .button');

const mapInstance = new kakao.maps.Map($map, {
   center: new kakao.maps.LatLng(35.8655753, 128.59339),
    level: 3,
});

let currentLat;
let currentLon;
let currentPosition;
let currentMarker;


const currentInfoWindow = new kakao.maps.InfoWindow({
    content: '<div style="width: 5rem; padding: 0.5rem 0; text-align: center;">현재위치</div>',
});

const toiletInfoWindow = new kakao.maps.InfoWindow({
    content: '<div style="width: 5rem; padding: 0.5rem 0; text-align: center;">화장실</div>',
});

let toiletMarkers = [];

const findCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
           currentLat = position.coords.latitude;
           currentLon = position.coords.longitude;

           currentPosition = new kakao.maps.LatLng(currentLat, currentLon);

           if (currentMarker) currentMarker.setMap(null);
           currentMarker = new kakao.maps.Marker({
              map: mapInstance,
              position: currentPosition,
           });
           currentInfoWindow.open(mapInstance, currentMarker);

           mapInstance.setCenter(currentPosition);
           mapInstance.setLevel(3);
        });
    } else {
        alert('위치 정보를 사용할 수 없습니다.');
    }
};

const findToilets = () => {

  toiletMarkers.forEach(marker => marker.setMap(null));
  toiletMarkers = [];

  const filterToilets = toilets.filter(data => data['C0'] !== "번호");

  for (const toilet of toilets) {
      const lat = parseFloat(toilet['C20']);
      const lng = parseFloat(toilet['C21']);

      if (isNaN(lat) || isNaN(lng)) continue;
      const position = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({
         map: mapInstance,
         position: position
      });

      const infoContent = `
            <div style="width: 12rem; padding: 0.5rem; text-align: center;">
                <strong>${toilet['C3']}</strong><br>
                <small>${toilet['C4']}</small><br>
                <small>개방시간: ${toilet['C17']} ${toilet['C18'] || ''}</small>
            </div>
        `;

      const infoWindow = new kakao.maps.InfoWindow({
         content: infoContent
      });
      kakao.maps.event.addListener(marker, 'click', function() {
         infoWindow.open(mapInstance, marker);
      });
      toiletMarkers.push(marker);
  }

};