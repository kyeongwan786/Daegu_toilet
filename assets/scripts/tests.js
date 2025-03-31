let routePolyline = null;

const findRoute = (event) => {
    event.stopPropagation();

    if (!selectedMarker || !currentPosition) {
        alert('현재 위치와 목적지를 먼저 설정해주세요.');
        return;
    }

    const targetPosition = selectedMarker.getPosition();

    if (routePolyline) {
        routePolyline.setMap(null);
    }

    const url = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json";

    const data = {
        appKey: apiKey,
        startX: currentPosition.getLng(),
        startY: currentPosition.getLat(),
        endX: targetPosition.getLng(),
        endY: targetPosition.getLat(),
        reqCoordType: "WGS84GEO",
        resCoordType: "WGS84GEO",
        startName: "현재위치",
        endName: selectedMarker.toiletData['C3'] || "화장실"
    };

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.textContent = '경로를 찾는 중...';
    document.body.appendChild(loadingDiv);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            document.body.removeChild(loadingDiv);

            if (!result.features || result.features.length === 0) {
                alert('경로를 찾을 수 없습니다.');
                return;
            }

            const path = [];
            result.features.forEach(feature => {
                if (feature.geometry.type === 'LineString') {
                    feature.geometry.coordinates.forEach(coord => {
                        path.push(new kakao.maps.LatLng(coord[1], coord[0]));
                    });
                }
            });

            routePolyline = new kakao.maps.Polyline({
                path: path,
                strokeWeight: 5,
                strokeColor: '#FF5E00',
                strokeOpacity: 0.8,
                strokeStyle: 'solid'
            });

            routePolyline.setMap(mapInstance);

            const totalDistance = result.features[0].properties.totalDistance;
            const totalTime = result.features[0].properties.totalTime;

            const distanceInKm = (totalDistance / 1000).toFixed(1);
            const timeInMinutes = Math.round(totalTime / 60);

            updateRouteInfo(distanceInKm, timeInMinutes);

            const bounds = new kakao.maps.LatLngBounds();
            path.forEach(position => bounds.extend(position));
            mapInstance.setBounds(bounds);
        })
        .catch(error => {
            document.body.removeChild(loadingDiv);
            console.error('경로 검색 실패:', error);
            alert('경로 검색에 실패했습니다.');
        });
};

const updateRouteInfo = (distance, time) => {
    const existingRouteInfo = document.querySelector('.route-info-panel');
    if (existingRouteInfo) {
        existingRouteInfo.remove();
    }

    const routeInfoPanel = document.createElement('div');
    routeInfoPanel.className = 'route-info-panel';
    routeInfoPanel.innerHTML = `
        <div class="route-info-header">
            <h3>보행자 경로</h3>
            <button class="close-route-info">×</button>
        </div>
        <div class="route-info-content">
            <div class="route-info-item">
                <span class="info-label">거리</span>
                <span class="info-value">${distance} km</span>
            </div>
            <div class="route-info-item">
                <span class="info-label">예상 시간</span>
                <span class="info-value">${time} 분</span>
            </div>
            <div class="toilet-name">
                <span>${selectedMarker.toiletData['C3'] || '공중화장실'}</span>
            </div>
        </div>
    `;

    document.body.appendChild(routeInfoPanel);

    const closeButton = routeInfoPanel.querySelector('.close-route-info');
    closeButton.addEventListener('click', () => {
        routeInfoPanel.remove();
        if (routePolyline) {
            routePolyline.setMap(null);
            routePolyline = null;
        }
    });
};

const createToiletItem = (toilet, marker, distance) => {
    const walkingTimeMinutes = calculateWalkingTime(distance);

    const item = document.createElement('div');
    item.className = 'toilet-item';
    item.setAttribute('data-marker-id', marker.id);

    const toiletName = toilet['C3'] || '공중화장실';

    item.addEventListener('click', () => {
        const prevSelected = $infoPanel.querySelector('.toilet-item.selected');
        if (prevSelected) prevSelected.classList.remove('selected');

        item.classList.add('selected');

        mapInstance.setCenter(marker.getPosition());
        const customInfoWindow = new kakao.maps.InfoWindow({
            content: `<div style="width: auto; min-width: 4rem; padding: 0.5rem; text-align: center; white-space: nowrap;">${toiletName}</div>`
        });

        if (window.currentOpenInfoWindow) {
            window.currentOpenInfoWindow.close();
        }

        customInfoWindow.open(mapInstance, marker);
        window.currentOpenInfoWindow = customInfoWindow;

        selectedMarker = marker;
    });

    if (marker === selectedMarker) {
        item.classList.add('selected');
    }


};