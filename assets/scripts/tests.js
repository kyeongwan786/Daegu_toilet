let routePolyline = null;

const findRoute = (event) => {
    event.stopPropagation();
    
    if (!selectedMarker || !currentPosition) {
        alert('현재 위치와 목적지를 먼저 설정해주세요.');
        return;
    }
    
    const targetPosition = selectedMarker.getPosition();
    
    // 기존 경로가 있으면 제거
    if (routePolyline) {
        routePolyline.setMap(null);
    }
    
    // TMAP API 호출 설정
    const apiKey = "여기에_티맵_API_키_입력";
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
    
    // 로딩 표시
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
        
        // 경로 좌표 추출
        const path = [];
        result.features.forEach(feature => {
            if (feature.geometry.type === 'LineString') {
                feature.geometry.coordinates.forEach(coord => {
                    path.push(new kakao.maps.LatLng(coord[1], coord[0]));
                });
            }
        });
        
        // 지도에 경로 표시
        routePolyline = new kakao.maps.Polyline({
            path: path,
            strokeWeight: 5,
            strokeColor: '#FF5E00',
            strokeOpacity: 0.8,
            strokeStyle: 'solid'
        });
        
        routePolyline.setMap(mapInstance);
        
        // 경로 정보 표시
        const totalDistance = result.features[0].properties.totalDistance;
        const totalTime = result.features[0].properties.totalTime;
        
        const distanceInKm = (totalDistance / 1000).toFixed(1);
        const timeInMinutes = Math.round(totalTime / 60);
        
        // 경로 정보 패널 업데이트
        updateRouteInfo(distanceInKm, timeInMinutes);
        
        // 경로가 모두 보이도록 지도 범위 조정
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

// 경로 정보 표시 함수
const updateRouteInfo = (distance, time) => {
    // 이미 있는 경로 정보 패널이 있으면 제거
    const existingRouteInfo = document.querySelector('.route-info-panel');
    if (existingRouteInfo) {
        existingRouteInfo.remove();
    }
    
    // 새 경로 정보 패널 생성
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
    
    // 페이지에 패널 추가
    document.body.appendChild(routeInfoPanel);
    
    // 닫기 버튼에 이벤트 리스너 추가
    const closeButton = routeInfoPanel.querySelector('.close-route-info');
    closeButton.addEventListener('click', () => {
        routeInfoPanel.remove();
        if (routePolyline) {
            routePolyline.setMap(null);
            routePolyline = null;
        }
    });
};

// createToiletItem 함수 수정 - 이전 코드에서 오류가 있던 부분 수정
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
    
    item.innerHTML = `
    <div class="item-header">
      <h3 class="item-name">${toiletName}</h3>
      <span class="item-time">${walkingTimeMinutes}분</span>
    </div>
    <p class="item-address">${toilet['C4'] || toilet['C5'] || '주소 정보 없음'}</p>
    <div class="item-info">
      <span>남: ${parseInt(toilet['C6'] || 0) + parseInt(toilet['C8'] || 0)}칸</span>
      <span>여: ${parseInt(toilet['C12'] || 0) + parseInt(toilet['C13'] || 0)}칸</span>
      <span>${toilet['C17'] || '운영시간 정보 없음'}</span>
    </div>
    `;
    
    // 길찾기 버튼 추가
    const navButton = document.createElement('button');
    navButton.className = 'navigation-button';
    navButton.textContent = '길찾기';
    navButton.addEventListener('click', findRoute);
    item.appendChild(navButton);
    
    return item;
};
```