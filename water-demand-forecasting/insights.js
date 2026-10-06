document.addEventListener('DOMContentLoaded', () => {
  const cityData = {
    lucknow: {
      demand: '498 MLD',
      growth: '+18.2%',
      peak: 'May–June',
      priority: 'High',
      baseDemand: 498,
      offset: 18,
      riskLevel: 'Moderate'
    },
    kanpur: {
      demand: '612 MLD',
      growth: '+12.4%',
      peak: 'April–July',
      priority: 'Critical',
      baseDemand: 612,
      offset: 12,
      riskLevel: 'High'
    },
    noida: {
      demand: '430 MLD',
      growth: '+23.8%',
      peak: 'June–August',
      priority: 'Very high',
      baseDemand: 430,
      offset: 24,
      riskLevel: 'Very high'
    }
  };

  const citySelect = document.getElementById('cityComparison');
  if (citySelect) {
    const demandEl = document.getElementById('comparisonDemand');
    const growthEl = document.getElementById('comparisonGrowth');
    const peakEl = document.getElementById('comparisonPeak');
    const priorityEl = document.getElementById('comparisonPriority');

    const updateCityComparison = () => {
      const selectedCity = cityData[citySelect.value] || cityData.lucknow;
      demandEl.textContent = selectedCity.demand;
      growthEl.textContent = selectedCity.growth;
      peakEl.textContent = selectedCity.peak;
      priorityEl.textContent = selectedCity.priority;
    };

    citySelect.addEventListener('change', updateCityComparison);
    updateCityComparison();
  }

  const plannerForm = document.getElementById('resiliencePlanner');
  if (plannerForm) {
    const plannerCity = document.getElementById('plannerCity');
    const plannerSupply = document.getElementById('plannerSupply');
    const plannerLift = document.getElementById('plannerLift');
    const plannerEfficiency = document.getElementById('plannerEfficiency');
    const projectedDemandEl = document.getElementById('projectedDemand');
    const stressIndexEl = document.getElementById('stressIndex');
    const gapOrSurplusEl = document.getElementById('gapOrSurplus');
    const actionLabelEl = document.getElementById('actionLabel');
    const plannerSteps = document.getElementById('plannerSteps');

    const stepTemplates = {
      low: [
        'Increase pump scheduling during peak morning hours.',
        'Prioritize leak detection in the highest-use zones.',
        'Deploy temporary storage for peak demand windows.'
      ],
      medium: [
        'Activate emergency supply balancing across priority clusters.',
        'Shift non-essential industrial use to off-peak windows.',
        'Launch targeted public water-saving reminders in high-pressure areas.'
      ],
      high: [
        'Trigger rapid-response water transfer from nearby storage points.',
        'Throttle non-critical consumption and activate all leak-response teams.',
        'Escalate to city operations with a weekly conservation override plan.'
      ]
    };

    function getPlannerRecommendation(stressIndex) {
      if (stressIndex < 90) return { level: 'low', label: 'Stable' };
      if (stressIndex < 110) return { level: 'medium', label: 'Watch closely' };
      return { level: 'high', label: 'Critical response' };
    }

    function updatePlannerResults() {
      const city = cityData[plannerCity.value] || cityData.lucknow;
      const currentSupply = Number(plannerSupply.value) || 0;
      const lift = Number(plannerLift.value) || 0;
      const efficiencyGain = Number(plannerEfficiency.value) || 0;

      const projectedDemand = city.baseDemand * (1 + lift / 100) * (1 - efficiencyGain / 100);
      const effectiveSupply = currentSupply * (1 + efficiencyGain / 100);
      const gap = projectedDemand - effectiveSupply;
      const stressIndex = (projectedDemand / effectiveSupply) * 100;
      const recommendation = getPlannerRecommendation(stressIndex);

      projectedDemandEl.textContent = `${projectedDemand.toFixed(1)} MLD`;
      stressIndexEl.textContent = `${stressIndex.toFixed(0)}%`;
      gapOrSurplusEl.textContent = `${Math.abs(gap).toFixed(1)} MLD ${gap >= 0 ? 'shortfall' : 'surplus'}`;
      actionLabelEl.textContent = recommendation.label;

      const steps = stepTemplates[recommendation.level];
      plannerSteps.innerHTML = steps
        .map((step) => `<div class="planner-step">${step}</div>`)
        .join('');
    }

    plannerCity.addEventListener('change', updatePlannerResults);
    plannerSupply.addEventListener('input', updatePlannerResults);
    plannerLift.addEventListener('input', updatePlannerResults);
    plannerEfficiency.addEventListener('input', updatePlannerResults);
    plannerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      updatePlannerResults();
    });

    updatePlannerResults();
  }

  const alertCitySelector = document.getElementById('alertCitySelector');
  const alertList = document.getElementById('alertList');
  const networkHealthEl = document.getElementById('networkHealth');
  const activeAlertsEl = document.getElementById('activeAlerts');
  const qualityScoreEl = document.getElementById('qualityScore');
  const reservoirStatusEl = document.getElementById('reservoirStatus');

  const alertData = {
    lucknow: [
      { title: 'North feeder line', detail: 'Pressure dip detected • 2.1 km from station', type: 'warning' },
      { title: 'Tank 5 refill cycle', detail: 'Scheduled 14 min ahead of peak load', type: 'info' },
      { title: 'Leak score spike', detail: '3.7% variance in district cluster', type: 'critical' }
    ],
    kanpur: [
      { title: 'Industrial belt demand', detail: 'Volume 18% above normal profile', type: 'critical' },
      { title: 'Mainline pressure', detail: 'Stable after balancing valve review', type: 'info' },
      { title: 'Reservoir reserve', detail: 'Low by 8% after overnight demand', type: 'warning' }
    ],
    noida: [
      { title: 'Smart meter anomaly', detail: 'Two high-rise towers exceeding target use', type: 'warning' },
      { title: 'Distribution efficiency', detail: 'Recovered 6.2% after valve reset', type: 'info' },
      { title: 'Peak demand alert', detail: 'Expected next 4 hours are highest risk', type: 'critical' }
    ]
  };

  const statusData = {
    lucknow: { health: '96.4%', alerts: '3', quality: '94.1', reservoir: '81%' },
    kanpur: { health: '91.2%', alerts: '5', quality: '90.8', reservoir: '73%' },
    noida: { health: '94.7%', alerts: '4', quality: '96.3', reservoir: '86%' }
  };

  if (alertCitySelector && alertList) {
    const renderAlerts = () => {
      const city = alertCitySelector.value;
      const alerts = alertData[city] || alertData.lucknow;
      const status = statusData[city] || statusData.lucknow;

      alertList.innerHTML = alerts
        .map(
          (alert) => `
            <div class="alert-item">
              <div>
                <strong>${alert.title}</strong>
                <span>${alert.detail}</span>
              </div>
              <div class="alert-tag ${alert.type}">${alert.type === 'critical' ? 'Critical' : alert.type === 'warning' ? 'Watch' : 'Info'}</div>
            </div>
          `
        )
        .join('');

      networkHealthEl.textContent = status.health;
      activeAlertsEl.textContent = status.alerts;
      qualityScoreEl.textContent = `${status.quality}/100`;
      reservoirStatusEl.textContent = status.reservoir;
    };

    alertCitySelector.addEventListener('change', renderAlerts);
    renderAlerts();
  }

  const adminLoginForm = document.getElementById('adminLogin');
  const adminDashboard = document.getElementById('adminDashboard');
  const dashboardUserName = document.getElementById('dashboardUserName');
  const logoutBtn = document.getElementById('logoutBtn');

  if (adminLoginForm && adminDashboard) {
    const toggleAdminView = (loggedIn, username = 'Operations Manager') => {
      adminDashboard.classList.toggle('hidden', !loggedIn);
      adminLoginForm.classList.toggle('hidden', loggedIn);
      if (dashboardUserName) {
        dashboardUserName.textContent = username;
      }
    };

    adminLoginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = document.getElementById('adminUser').value.trim() || 'Operations Manager';
      toggleAdminView(true, username);
    });

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        adminLoginForm.reset();
        toggleAdminView(false);
      });
    }

    toggleAdminView(false);
  }

  const contactForm = document.getElementById('contactForm');
  const contactMessageStatus = document.getElementById('contactMessageStatus');

  if (contactForm && contactMessageStatus) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      contactMessageStatus.textContent = `Thanks ${name || 'there'} — your inquiry has been sent to the water planning team.`;
      contactForm.reset();
    });
  }

  const exportReportBtn = document.getElementById('exportReportBtn');
  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const form = document.getElementById('waterCalculator');
  if (!form) return;

  const populationInput = document.getElementById('population');
  const perPersonInput = document.getElementById('perPerson');
  const savingsInput = document.getElementById('savings');

  const dailyUseEl = document.getElementById('dailyUse');
  const monthlyUseEl = document.getElementById('monthlyUse');
  const savedUseEl = document.getElementById('savedUse');

  function formatLitres(value) {
    return `${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} L/day`;
  }

  function formatLitresMonth(value) {
    return `${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} L/month`;
  }

  function calculate() {
    const population = Number(populationInput.value) || 0;
    const perPerson = Number(perPersonInput.value) || 0;
    const savings = Number(savingsInput.value) || 0;

    const dailyUse = population * perPerson;
    const monthlyUse = dailyUse * 30;
    const savedUse = dailyUse * (savings / 100);

    dailyUseEl.textContent = formatLitres(dailyUse);
    monthlyUseEl.textContent = formatLitresMonth(monthlyUse);
    savedUseEl.textContent = formatLitres(savedUse);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculate();
  });

  calculate();
});
