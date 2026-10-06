const CITIES = {
  lucknow: { name: "Lucknow", base: 420, trend: 0.9, seasonal: 48, noise: 9 },
  kanpur: { name: "Kanpur", base: 510, trend: 0.55, seasonal: 36, noise: 12 },
  noida: { name: "Noida", base: 330, trend: 1.8, seasonal: 42, noise: 8 },
};

function monthLabel(date) {
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function addMonths(date, n) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + n);
  return next;
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateHistory(cityKey, months) {
  const cfg = CITIES[cityKey];
  const rand = seededRandom(
    cityKey.length * 97 + months * 13 + Math.round(cfg.base)
  );
  const end = new Date();
  end.setDate(1);
  const start = addMonths(end, -months);
  const series = [];

  for (let i = 0; i < months; i += 1) {
    const date = addMonths(start, i);
    const t = i;
    const month = date.getMonth();
    const seasonal =
      Math.sin((2 * Math.PI * (month - 4)) / 12) * cfg.seasonal +
      Math.sin((4 * Math.PI * month) / 12) * (cfg.seasonal * 0.18);
    const summerLift = month >= 4 && month <= 7 ? cfg.seasonal * 0.35 : 0;
    const noise = (rand() - 0.5) * 2 * cfg.noise;
    const value = cfg.base + cfg.trend * t + seasonal + summerLift + noise;
    series.push({ date, value: Math.max(80, value) });
  }
  return series;
}

function fitSeasonalTrend(history) {
  const n = history.length;
  const xs = history.map((_, i) => i);
  const ys = history.map((d) => d.value);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = num / den;
  const intercept = yMean - slope * xMean;

  const seasonal = Array(12).fill(0);
  const counts = Array(12).fill(0);
  history.forEach((point, i) => {
    const trend = intercept + slope * i;
    const month = point.date.getMonth();
    seasonal[month] += point.value - trend;
    counts[month] += 1;
  });
  for (let m = 0; m < 12; m += 1) {
    seasonal[m] = counts[m] ? seasonal[m] / counts[m] : 0;
  }
  return { slope, intercept, seasonal };
}

function predict(model, date, index) {
  return model.intercept + model.slope * index + model.seasonal[date.getMonth()];
}

function evaluate(history, holdout = 12) {
  const train = history.slice(0, -holdout);
  const test = history.slice(-holdout);
  const model = fitSeasonalTrend(train);
  const startIndex = train.length;
  const preds = test.map((point, i) => predict(model, point.date, startIndex + i));
  const errors = test.map((point, i) => point.value - preds[i]);
  const mae = errors.reduce((a, b) => a + Math.abs(b), 0) / errors.length;
  const rmse = Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / errors.length);
  const mape =
    (test.reduce((a, point, i) => a + Math.abs(errors[i]) / point.value, 0) /
      test.length) *
    100;
  return { mae, rmse, mape, preds, test };
}

function forecastFuture(history, horizon) {
  const model = fitSeasonalTrend(history);
  const last = history[history.length - 1].date;
  const startIndex = history.length;
  const future = [];
  for (let i = 1; i <= horizon; i += 1) {
    const date = addMonths(last, i);
    future.push({ date, value: predict(model, date, startIndex + i - 1) });
  }
  return future;
}

let chart;

function render(cityKey, historyMonths, horizon) {
  const history = generateHistory(cityKey, historyMonths);
  const evalResult = evaluate(history);
  const future = forecastFuture(history, horizon);

  document.getElementById("mae").textContent = `${evalResult.mae.toFixed(1)} MLD`;
  document.getElementById("rmse").textContent = `${evalResult.rmse.toFixed(1)} MLD`;
  document.getElementById("mape").textContent = `${evalResult.mape.toFixed(2)}%`;
  document.getElementById("next").textContent = `${future[0].value.toFixed(0)} MLD`;

  const labels = [
    ...history.map((d) => monthLabel(d.date)),
    ...future.map((d) => monthLabel(d.date)),
  ];
  const actual = [...history.map((d) => d.value), ...Array(future.length).fill(null)];
  const predicted = [
    ...Array(history.length - 1).fill(null),
    history[history.length - 1].value,
    ...future.map((d) => d.value),
  ];

  const ctx = document.getElementById("forecastChart");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Historical demand",
          data: actual,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          fill: true,
          tension: 0.32,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "Forecast",
          data: predicted,
          borderColor: "#2dd4bf",
          borderDash: [6, 4],
          tension: 0.32,
          pointRadius: 0,
          borderWidth: 2.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#d7eefb" },
        },
      },
      scales: {
        x: {
          ticks: { color: "#9ec3d8", maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
          grid: { color: "rgba(125, 211, 252, 0.08)" },
        },
        y: {
          ticks: { color: "#9ec3d8" },
          grid: { color: "rgba(125, 211, 252, 0.08)" },
          title: { display: true, text: "Demand (MLD)", color: "#9ec3d8" },
        },
      },
    },
  });
}

const form = document.getElementById("controls");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  render(
    document.getElementById("city").value,
    Number(document.getElementById("history").value),
    Number(document.getElementById("horizon").value)
  );
});

render("lucknow", 48, 12);
