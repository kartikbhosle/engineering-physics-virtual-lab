/* ===== Malus' Law Virtual Lab ===== */
const I_MAX = 100; // μA

const angleEl     = document.getElementById('angle');
const angleLabel  = document.getElementById('angleLabel');
const meterAngle  = document.getElementById('meterAngle');
const meterCos    = document.getElementById('meterCos');
const meterCurr   = document.getElementById('meterCurrent');
const beamEl      = document.getElementById('beam');
const orbEl       = document.getElementById('lightOrb');
const detectorEl  = document.getElementById('detector');
const analyzerGr  = document.getElementById('analyzerGrating');
const recordBtn   = document.getElementById('recordBtn');
const resetBtn    = document.getElementById('resetBtn');
const tableBody   = document.getElementById('dataTable');
const rowCount    = document.getElementById('rowCount');

let readings = [];

function compute(theta) {
  const rad = theta * (Math.PI / 180);
  const cos = Math.cos(rad);
  const cos2 = Math.pow(cos, 2);
  const I = I_MAX * cos2;
  return { theta, cos2, I };
}

function updateUI() {
  const theta = parseInt(angleEl.value, 10);
  const { cos2, I } = compute(theta);

  angleLabel.textContent = `${theta}°`;
  meterAngle.textContent = `${theta}°`;
  meterCos.textContent   = cos2.toFixed(3);
  meterCurr.textContent  = I.toFixed(2);

  // Beam fades from 100% (0°) -> 0% (90°)
  const intensity = cos2; // 0..1
  beamEl.style.opacity = intensity.toFixed(3);
  orbEl.style.opacity  = intensity.toFixed(3);
  orbEl.style.boxShadow = `0 0 ${20 + 40 * intensity}px ${6 + 10 * intensity}px rgba(252,211,77,${0.25 + 0.6 * intensity})`;

  // Rotate analyzer grating to reflect θ
  analyzerGr.style.transform = `rotate(${theta}deg)`;

  // Detector glow proportional to intensity
  detectorEl.style.boxShadow = `inset 0 0 ${4 + 18 * intensity}px rgba(252,211,77,${0.15 + 0.7 * intensity})`;
  detectorEl.style.background = `linear-gradient(180deg, rgba(252,211,77,${0.05 + 0.25 * intensity}), #0b1220)`;
}

function renderTable() {
  if (readings.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="empty">No readings recorded yet.</td></tr>`;
  } else {
    tableBody.innerHTML = readings.map((r, i) => `
      <tr class="row-in">
        <td>${i + 1}</td>
        <td>${r.theta}</td>
        <td>${r.cos2.toFixed(3)}</td>
        <td>${r.I.toFixed(2)}</td>
      </tr>
    `).join('');
  }
  rowCount.textContent = `${readings.length} reading${readings.length === 1 ? '' : 's'}`;
}

/* ===== Chart.js ===== */
const ctx = document.getElementById('malusChart').getContext('2d');

// Theoretical reference line: I = I_max * x  (since x = cos²θ)
const theoreticalLine = Array.from({ length: 21 }, (_, i) => {
  const x = i / 20; // 0..1
  return { x, y: I_MAX * x };
});

const malusChart = new Chart(ctx, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Theoretical I = Iₘ·cos²θ',
        data: theoreticalLine,
        showLine: true,
        borderColor: 'rgba(99,102,241,0.7)',
        backgroundColor: 'rgba(99,102,241,0.0)',
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        tension: 0.25,
      },
      {
        label: 'Recorded Readings',
        data: [],
        showLine: true,
        borderColor: 'rgba(252,211,77,0.9)',
        backgroundColor: 'rgba(252,211,77,1)',
        pointBackgroundColor: '#fcd34d',
        pointBorderColor: '#0b1220',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
        tension: 0.2,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutCubic' },
    plugins: {
      legend: {
        labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(11,18,32,0.95)',
        borderColor: 'rgba(252,211,77,0.5)',
        borderWidth: 1,
        titleColor: '#fcd34d',
        bodyColor: '#e2e8f0',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `cos²θ = ${ctx.parsed.x.toFixed(3)}, I = ${ctx.parsed.y.toFixed(2)} μA`
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        min: 0, max: 1,
        title: { display: true, text: 'cos²θ', color: '#94a3b8', font: { size: 12 } },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        min: 0, max: 110,
        title: { display: true, text: 'Current I (μA)', color: '#94a3b8', font: { size: 12 } },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.06)' }
      }
    }
  }
});

function refreshChart() {
  const sorted = [...readings].sort((a, b) => a.cos2 - b.cos2);
  malusChart.data.datasets[1].data = sorted.map(r => ({ x: r.cos2, y: r.I }));
  malusChart.update();
}

/* ===== Events ===== */
angleEl.addEventListener('input', updateUI);

recordBtn.addEventListener('click', () => {
  const theta = parseInt(angleEl.value, 10);
  const r = compute(theta);
  // Avoid duplicates of same angle
  readings = readings.filter(x => x.theta !== theta);
  readings.push(r);
  readings.sort((a, b) => a.theta - b.theta);
  renderTable();
  refreshChart();
});

resetBtn.addEventListener('click', () => {
  readings = [];
  renderTable();
  refreshChart();
});

/* Init */
updateUI();
renderTable();
