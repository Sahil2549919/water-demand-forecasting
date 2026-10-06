document.addEventListener('DOMContentLoaded', async () => {
  const reportTableBody = document.getElementById('reportTableBody');
  const reportCoverage = document.getElementById('reportCoverage');
  const reportSaved = document.getElementById('reportSaved');
  const reportLeak = document.getElementById('reportLeak');
  const reportCost = document.getElementById('reportCost');

  async function loadReport() {
    const response = await fetch('/api/report?city=lucknow');
    return response.json();
  }

  const data = await loadReport();
  const cityData = data.city;

  reportCoverage.textContent = cityData.report.forecastCoverage;
  reportSaved.textContent = cityData.report.waterSaved;
  reportLeak.textContent = cityData.report.leakReduction;
  reportCost.textContent = cityData.report.costEfficiency;

  reportTableBody.innerHTML = cityData.districts
    .map(
      (district) => `
        <tr>
          <td>${district.name}</td>
          <td>${district.load}</td>
          <td>${district.pressure}</td>
          <td>${district.status}</td>
        </tr>
      `
    )
    .join('');

  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Water Demand Forecast Report', 40, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`City: ${cityData.city}`, 40, 80);
    doc.text(`Forecast coverage: ${cityData.report.forecastCoverage}`, 40, 100);
    doc.text(`Water saved: ${cityData.report.waterSaved}`, 40, 120);
    doc.text(`Leak reduction: ${cityData.report.leakReduction}`, 40, 140);
    doc.text(`Cost efficiency: ${cityData.report.costEfficiency}`, 40, 160);

    let y = 200;
    doc.setFont('helvetica', 'bold');
    doc.text('District', 40, y);
    doc.text('Demand', 180, y);
    doc.text('Pressure', 300, y);
    doc.text('Status', 430, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    cityData.districts.forEach((district) => {
      doc.text(district.name, 40, y);
      doc.text(district.load, 180, y);
      doc.text(district.pressure, 300, y);
      doc.text(district.status, 430, y);
      y += 18;
    });

    doc.save(`${cityData.city.toLowerCase()}-water-report.pdf`);
  });
});
