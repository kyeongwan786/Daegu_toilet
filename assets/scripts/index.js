var mapContainer = document.getElementById('map'),
    $mapOption  = {
        center: new kakao.maps.LatLng(35.86557683745244, 128.5934099134382 ),
        level: 3
    };

var map = new kakao.maps.Map(mapContainer, $mapOption);

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {

        var lat = position.coords.latitude,
            lon = position.coords.longitude;

        var locPosition = new kakao.maps.LatLng(lat, lon),
            message ='현재 위치';

        displayMarker(locPosition, message)
    });
} else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다

    var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
        message = 'geolocation을 사용할수 없어요..'

    displayMarker(locPosition, message);
}

function displayMarker(locPosition, message) {
    var marker = new kakao.maps.Marker({
       map: map,
       position: locPosition
    });

    var iwContent = message,
        iwRemoveable = true;

    var infowindow = new kakao.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });
    infowindow.open(map, marker);
    map.setCenter(locPosition);
}

const dates = JSON.parse(JSON.stringify(toilets));
console.log(dates);

for (const data of dates) {
    const name = data['C4'];
    console.log(name);
}