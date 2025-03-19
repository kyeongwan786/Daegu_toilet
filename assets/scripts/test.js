const $map = document.getElementById('map');
const mapInstance = new kakao.maps.Map($map, {
   center: new kakao.maps.LatLng(35.8655753, 128.59339),
   level: 3
});


const nowPosition = () =>{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
           const lat = position.coords.latitude,
           lon = position.coords.longitude;

           const locPosition = new kakao.maps.LatLng(lat, lon),
               message = '여기다'

            displayMarker(locPosition, message);
        });
    } else {
        const locPosition = new kakao.maps.LatLng(35.8655753, 128.59339),
            message = '사용 안됨';
        displayMarker(locPosition, message);
    }

};
function displayMarker(locPosition, message) {
    const marker = new kakao.maps.Marker({
        map: mapInstance,
        position: locPosition
    });
    const iwContent = message,
        iwRemoveable = true;

    const $infowindow = new kakao.maps.infoWindow({
        content: iwContent,
        removable: iwRemoveable
    });

    $infowindow.open(map, marker);
    map.setCenter(locPosition);
};