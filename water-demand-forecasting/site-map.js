document.addEventListener('DOMContentLoaded', async () => {
  const mapElement = document.getElementById('overviewMap');
  if (!mapElement) return;

  const citySelect = document.getElementById('overviewCitySelect');
  const districtList = document.getElementById('overviewDistrictList');
  const mapError = document.getElementById('overviewMapError');
  const demand = document.getElementById('overviewDemand');
  const peak = document.getElementById('overviewPeak');
  const health = document.getElementById('overviewNetworkHealth');

  if (!window.L) {
    mapError.textContent = 'The map library did not load. Check your connection and refresh.';
    mapError.classList.remove('hidden');
    return;
  }

  const map = L.map(mapElement, { scrollWheelZoom: false }).setView([26.8467, 80.9462], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.control.scale({ imperial: false }).addTo(map);
  const markers = L.featureGroup().addTo(map);

  function popupFor(district) {
    const popup = document.createElement('div');
    const title = document.createElement('strong');
    const detail = document.createElement('div');
    const status = document.createElement('div');
    title.textContent = district.name;
    detail.textContent = `Demand: ${district.load}`;
    status.textContent = `Status: ${district.status} · Pressure: ${district.pressure}`;
    popup.append(title, detail, status);
    return popup;
  }

  function setSelected(index) {
    districtList.querySelectorAll('.district').forEach((item, itemIndex) => {
      item.classList.toggle('active', itemIndex === index);
      item.setAttribute('aria-pressed', String(itemIndex === index));
    });
  }

  function renderDistricts(cityData) {
    districtList.replaceChildren();
    markers.clearLayers();

    cityData.districts.forEach((district, index) => {
      if (!Array.isArray(district.coordinates) || district.coordinates.length !== 2) {
        throw new Error(`Missing map coordinates for ${district.name}`);
      }

      const item = document.createElement('li');
      item.className = 'district';
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-pressed', 'false');
      const name = document.createElement('strong');
      const summary = document.createElement('span');
      name.textContent = district.name;
      summary.textContent = `${district.status} · ${district.load}`;
      item.append(name, summary);
      const select = () => {
        setSelected(index);
        const marker = markers.getLayers()[index];
        map.flyTo(marker.getLatLng(), 14);
        marker.openPopup();
      };
      item.addEventListener('click', select);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
      districtList.append(item);

      const marker = L.marker(district.coordinates, {
        title: district.name,
        alt: `${district.name}, ${district.status}`,
      })
        .bindTooltip(district.name)
        .bindPopup(popupFor(district))
        .addTo(markers);
      marker.on('click', () => setSelected(index));
    });

    setSelected(0);
    map.setView(cityData.coordinates, 12);
  }

  async function loadCity(cityKey) {
    try {
      const response = await fetch(`/api/insights?city=${encodeURIComponent(cityKey)}`);
      if (!response.ok) throw new Error(`City data request failed: ${response.status}`);
      const cityData = await response.json();
      demand.textContent = cityData.demand;
      peak.textContent = cityData.peak;
      health.textContent = cityData.networkHealth;
      renderDistricts(cityData);
      mapError.classList.add('hidden');
    } catch (error) {
      console.error('Unable to load city map data.', error);
      mapError.textContent = 'Could not load city map data. Please try again.';
      mapError.classList.remove('hidden');
    }
  }

  citySelect.addEventListener('change', () => loadCity(citySelect.value));
  await loadCity(citySelect.value);
});
