/**
 * 🌐 WGS84(Lat/Lng) 좌표를 네이버 V5 웹이 사용하는 Web Mercator(EPSG:3857)로 변환
 */
const toWebMercator = (lat, lng) => {
  const x = (lng * 20037508.34) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return { x, y };
};

// 💡 마지막 인자로 myPos(현재 위치)를 받을 수 있도록 파라미터를 추가합니다.
export const openExternalMap = (type, lat, lng, title, myPos = null) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedStartTitle = encodeURIComponent("내위치");
  let appUrl = "";
  let webUrl = "";

  switch (type) {
    case "naver": {
      const wm = toWebMercator(lat, lng);
      
      // 💡 현재 위치 정보가 있으면 출발지 정보를 URL 파라미터와 주소 경로에 쏙 넣어줍니다.
      if (myPos) {
        const startWm = toWebMercator(myPos.lat, myPos.lng);
        appUrl = `nmap://route/walk?slat=${myPos.lat}&slng=${myPos.lng}&sname=${encodedStartTitle}&dlat=${lat}&dlng=${lng}&dname=${encodedTitle}&appname=my.gps.planner`;
        webUrl = `https://map.naver.com/p/directions/${startWm.x},${startWm.y},${encodedStartTitle},,ADDRESS_ALL/${wm.x},${wm.y},${encodedTitle},,ADDRESS_ALL/-/walk?c=15,0,0,0,dh`;
      } else {
        // GPS 수신 전일 경우 예외 방지를 위해 기존 컴팩트 모드로 처리
        appUrl = `nmap://route/walk?dlat=${lat}&dlng=${lng}&dname=${encodedTitle}&appname=my.gps.planner`;
        webUrl = `https://map.naver.com/p/directions/-/${wm.x},${wm.y},${encodedTitle},,ADDRESS_ALL/-/dh?c=15,0,0,0,dh`;
      }
      break;
    }

    case "kakao":
      if (myPos) {
        appUrl = `kakaomap://route?sp=${myPos.lat},${myPos.lng}&ep=${lat},${lng}&by=PUBLICTRANSIT`;
        webUrl = `https://map.kakao.com/link/from/내위치,${myPos.lat},${myPos.lng}/to/${encodedTitle},${lat},${lng}`;
      } else {
        appUrl = `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT`;
        webUrl = `https://map.kakao.com/link/to/${encodedTitle},${lat},${lng}`;
      }
      break;

    case "google":
      if (myPos) {
        appUrl = `comgooglemaps://?saddr=${myPos.lat},${myPos.lng}&daddr=${lat},${lng}&directionsmode=walking`;
        webUrl = `https://www.google.com/maps/dir/?api=1&origin=${myPos.lat},${myPos.lng}&destination=${lat},${lng}&travelmode=walking`;
      } else {
        appUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=walking`;
        webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
      }
      break;

    default:
      return;
  }

  // 실행 로직: 먼저 앱 실행을 시도하고, 실패 시 웹으로 전환
  const start = Date.now();
  
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    window.location.href = appUrl;
    
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.open(webUrl, "_blank");
      }
    }, 500);
  } else {
    window.open(webUrl, "_blank");
  }
};
