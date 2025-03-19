


const $map = document.getElementById('map');
const $toyBtn = $map.querySelector(':scope > .loc-to > .toilet > .button');
const $nowBtn = $map.querySelector(':scope > .loc-to > .location > .button');
const mapInstance = new kakao.maps.Map($map, {
    center: new kakao.maps.LatLng(35.8655753, 128.59339),
    level: 3,
});

let lat;
let lon;
let nowPosition;
let nowMarker;



const nowInfoWindow = new kakao.maps.InfoWindow ({
    content: '<div style="width: 3rem; padding: 0.5rem 0; text-align: center;">현재위치</div>',
});
const toyInfoWindow = new kakao.maps.InfoWindow ({
    content: '<div style="width: 3rem; padding: 0.5rem 0; text-align: center;">화장실</div>',
});



const now = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude,
                lon = position.coords.longitude;

            nowPosition = new kakao.maps.LatLng(lat, lon);
            nowMarker?.setMap(null);
            nowMarker = new kakao.maps.Marker({
                map: mapInstance,
                position: nowPosition,
            });
            nowInfoWindow.open(mapInstance, nowMarker);
            mapInstance.setCenter(nowPosition);
            mapInstance.setLevel(3);

        });
    }
};

let toPosLat;
let toPosLon;
let toyPosition;
let toyMarker;

let toyMarkers = [];
const findToilet = () => {
    for (const list of lists) {
        toPosLat = [list[5]];
        toPosLon = [list[6]];
        toyPosition = new kakao.maps.LatLng(toPosLat, toPosLon);
        toyMarker?.setMap(null);
        toyMarker = new kakao.maps.Marker({
           map: mapInstance,
           position: toyPosition
        });
        toyInfoWindow.open(mapInstance, toyMarker);
        mapInstance.setCenter(toyPosition);
        mapInstance.setLevel(3);
    }
};



$nowBtn.onclick = () => {
    now();
}

$toyBtn.onclick = () => {
    findToilet();
}

const dates = JSON.parse(JSON.stringify(toilets));

//c3, c4, c5, c17... lists 빈 배열 만들어서 쑤셔넣고 위도 경도 빼와서 toiletPosition 변수 만들고 카카오맵위도경도에 쑤셔넣고 마커띄운다

lists = [];
for (const data of dates) {
    tod = [data['C3'],
    data['C4'],
    data['C5'],
    data['C17'],
        data['C18'],
        data['C20'],
        data['C21']
    ]
    lists.push(tod);
}

toPos = [];

console.log(lists);
//toPos가 위도 경도 담긴 배열