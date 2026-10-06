document.addEventListener('DOMContentLoaded', async () => {
  const citySelect = document.getElementById('citySelect');
  const districtList = document.getElementById('districtList');
  const districtName = document.getElementById('districtName');
  const districtLoad = document.getElementById('districtLoad');
  const districtStatus = document.getElementById('districtStatus');
  const districtPressure = document.getElementById('districtPressure');

  const networkHealthEl = document.getElementById('networkHealth');
  const activeAlertsEl = document.getElementById('activeAlerts');
  const qualityScoreEl = document.getElementById('qualityScore');
  const reservoirStatusEl = document.getElementById('reservoirStatus');

  const reportCoverageEl = document.getElementById('reportCoverage');
  const reportSavedEl = document.getElementById('reportSaved');
  const reportLeakEl = document.getElementById('reportLeak');
  const reportCostEl = document.getElementById('reportCost');
  const mapElement = document.getElementById('districtMap');
  const mapError = document.getElementById('mapError');
  let map;
  let districtMarkers;

  async function loadCityData(cityKey = 'lucknow') {
    const response = await fetch(`/api/insights?city=${encodeURIComponent(cityKey)}`);
    if (!response.ok) {
      throw new Error(`City data request failed: ${response.status}`);
    }
    return response.json();
  }

  function selectDistrict(district, selectedIndex) {
    updateDistrictDetails(district);
    districtList.querySelectorAll('.district').forEach((item, index) => {
      item.classList.toggle('active', index === selectedIndex);
    });
  }

  function renderDistrictList(cityData) {
    districtList.innerHTML = cityData.districts
      .map(
        (district, index) => `
          <li class="district ${index === 0 ? 'active' : ''}" data-index="${index}" role="button" tabindex="0" aria-pressed="${index === 0}">
            <strong>${district.name}</strong>
            <span>${district.status} • ${district.load}</span>
          </li>
        `
      )
      .join('');

    districtList.querySelectorAll('.district').forEach((item) => {
      const select = () => {
        const districtIndex = Number(item.dataset.index);
        const district = cityData.districts[districtIndex];
        selectDistrict(district, districtIndex);
        if (!map || !districtMarkers) return;
        const marker = districtMarkers.getLayers()[districtIndex];
        if (marker) {
          map.flyTo(marker.getLatLng(), 14);
          marker.openPopup();
        }
      };
      item.addEventListener('click', select);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });
  }

  function initializeMap() {
    if (!window.L) {
      mapError.textContent = 'The map library did not load. Check your connection and refresh.';
      mapError.classList.remove('hidden');
      return;
    }

    map = L.map(mapElement, { scrollWheelZoom: false }).setView([26.8467, 80.9462], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    districtMarkers = L.featureGroup().addTo(map);
    return map;
  }

  function createPopup(district) {
    const content = document.createElement('div');
    const title = document.createElement('strong');
    const detail = document.createElement('div');
    const status = document.createElement('div');
    title.textContent = district.name;
    detail.textContent = `Demand: ${district.load}`;
    status.textContent = `Status: ${district.status} · Pressure: ${district.pressure}`;
    content.append(title, detail, status);
    return content;
  }

  function renderDistrictMarkers(cityData) {
    if (!map) return;
    districtMarkers.clearLayers();
    cityData.districts.forEach((district, index) => {
      if (!Array.isArray(district.coordinates) || district.coordinates.length !== 2) {
        throw new Error(`Missing map coordinates for ${district.name}`);
      }
      const marker = L.marker(district.coordinates, {
        title: district.name,
        alt: `${district.name}, ${district.status}`,
      })
        .bindTooltip(district.name)
        .bindPopup(createPopup(district))
        .addTo(districtMarkers);
      marker.on('click', () => selectDistrict(district, index));
    });

    if (cityData.coordinates) {
      map.setView(cityData.coordinates, 12);
    }
  }

  function updateDistrictDetails(district) {
    districtName.textContent = district.name;
    districtLoad.textContent = district.load;
    districtStatus.textContent = district.status;
    districtPressure.textContent = district.pressure;
  }

  function renderOverview(cityData) {
    networkHealthEl.textContent = cityData.networkHealth;
    activeAlertsEl.textContent = cityData.activeAlerts;
    qualityScoreEl.textContent = `${cityData.qualityScore}/100`;
    reservoirStatusEl.textContent = cityData.reservoirStatus;

    reportCoverageEl.textContent = cityData.report.forecastCoverage;
    reportSavedEl.textContent = cityData.report.waterSaved;
    reportLeakEl.textContent = cityData.report.leakReduction;
    reportCostEl.textContent = cityData.report.costEfficiency;

    if (cityData.districts?.length) {
      renderDistrictList(cityData);
      renderDistrictMarkers(cityData);
      selectDistrict(cityData.districts[0], 0);
    }
  }

  async function refreshCity(cityKey) {
    try {
      const data = await loadCityData(cityKey);
      if (map) mapError.classList.add('hidden');
      renderOverview(data);
    } catch (error) {
      console.error('Unable to update the city dashboard.', error);
      mapError.textContent = 'Could not load city map data. Please try again.';
      mapError.classList.remove('hidden');
    }
  }

  initializeMap();
  citySelect.addEventListener('change', (event) => refreshCity(event.target.value));
  await refreshCity(citySelect.value);

  document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
    const pdfWindow = window.open('report.html', '_blank', 'width=1200,height=900');
    if (pdfWindow) {
      pdfWindow.focus();
    }
  });
});
