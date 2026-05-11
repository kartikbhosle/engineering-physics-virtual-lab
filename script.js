// =====================================================================
// SECTION 1: WHOLE SITE LOGIC (SPA ROUTING & NAVIGATION)
// =====================================================================

// ==========================================
// SPA ROUTING (Page Navigation)
// ==========================================
function switchView(targetViewId) {
    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.add('hidden');
    });

    // Show the target view
    document.getElementById(targetViewId).classList.remove('hidden');

    // NEW: Save the current page to the URL without reloading the browser!
    window.history.pushState(null, null, `#${targetViewId}`);

    // Update Navbar Active State
    document.querySelectorAll('.nav-link').forEach(link => {
        if(link.getAttribute('data-target') === targetViewId) {
            link.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400', 'pb-1');
            link.classList.remove('text-slate-300');
        } else {
            link.classList.remove('text-cyan-400', 'border-b-2', 'border-cyan-400', 'pb-1');
            link.classList.add('text-slate-300');
        }
    
    });
}

// Initialize the app on load
document.addEventListener('DOMContentLoaded', () => {
    
    // NEW: Check if the URL has a saved location (e.g., #view-lab-malus)
    const savedView = window.location.hash.substring(1); // This removes the '#'

    // If there is a saved view in the URL, load it! Otherwise, load the dashboard.
    if (savedView && document.getElementById(savedView)) {
        switchView(savedView);
    } else {
        switchView('view-dashboard');
    }


// =====================================================================
// SECTION 2: MALUS LAB LOGIC
// (When friends submit new labs, paste their isolated functions BELOW this entire section)
// =====================================================================

    /* ===== DOM 
Elements for Malus Lab ===== */
    const intensityEl = document.getElementById('intensity');
    const intensityLabel = document.getElementById('intensityLabel');
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
    function getMaxIntensity() {
      return parseInt(intensityEl.value, 10);
    }

    function compute(theta, currentIm) {
      const rad = theta * (Math.PI / 180);
      const cos = Math.cos(rad);
      const cos2 = Math.pow(cos, 2);
      const I = currentIm * cos2;
      return { theta, cos2, I };
    }

    function updateUI() {
      if (!angleEl || !intensityEl) return;
      const currentIm = getMaxIntensity();
      const theta = parseInt(angleEl.value, 10);
      const { cos2, I } = compute(theta, currentIm);
      intensityLabel.innerHTML = `${currentIm} &mu;A`;
      angleLabel.textContent = `${theta}°`;
      meterAngle.textContent = `${theta}°`;
      meterCos.textContent   = cos2.toFixed(3);
      meterCurr.textContent  = I.toFixed(2);
      const visualIntensity = cos2; 
      beamEl.style.opacity = visualIntensity.toFixed(3);
      orbEl.style.opacity  = visualIntensity.toFixed(3);
      orbEl.style.boxShadow = `0 0 ${20 + 40 * visualIntensity}px ${6 + 10 * visualIntensity}px rgba(6, 182, 212, ${0.25 + 0.6 * visualIntensity})`;
      analyzerGr.style.transform = `rotate(${theta}deg)`;
      detectorEl.style.boxShadow = `inset 0 0 ${4 + 18 * visualIntensity}px rgba(6, 182, 212, ${0.15 + 0.7 * visualIntensity})`;
      detectorEl.style.background = `linear-gradient(180deg, rgba(6, 182, 212, ${0.05 + 0.25 * visualIntensity}), #0f172a)`;
    }

    function renderTable() {
      if (readings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="empty">No readings recorded yet.</td></tr>`;
      } else {
        tableBody.innerHTML = readings.map((r, i) => `
          <tr class="row-in">
            <td>${i + 1}</td>
            <td>${r.theta}°</td>
            <td>${r.cos2.toFixed(3)}</td>
            <td style="color: #06b6d4; font-weight: bold;">${r.I.toFixed(2)}</td>
          </tr>
        `).join('');
      }
      rowCount.textContent = `${readings.length} reading${readings.length === 1 ? '' : 's'}`;
    }

    const ctx = document.getElementById('malusChart').getContext('2d');

    const malusChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Theoretical I = Iₘ·cos²θ',
            data: [], 
            showLine: true,
           
            borderColor: 'rgba(99, 102, 241, 0.7)', 
            backgroundColor: 'rgba(99, 102, 241, 0.0)',
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            tension: 0.25,
          },
          {
     
            label: 'Recorded Readings',
            data: [],
            showLine: true,
            borderColor: 'rgba(6, 182, 212, 0.9)', 
            backgroundColor: 'rgba(6, 182, 212, 1)',
            pointBackgroundColor: '#06b6d4',
            pointBorderColor: '#0f172a',
      
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
          legend: { labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(6, 182, 212, 0.5)',
            borderWidth: 
1, titleColor: '#06b6d4', bodyColor: '#f8fafc', padding: 12, cornerRadius: 8,
            callbacks: { label: (ctx) => `cos²θ = ${ctx.parsed.x.toFixed(3)}, I = ${ctx.parsed.y.toFixed(2)} μA` }
          }
        },
        scales: {
          x: {
            type: 'linear', min: 0, max: 1.1,
            title: 
{ display: true, text: 'cos²θ', color: '#94a3b8', font: { size: 12 } },
            ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.06)' }
          },
          y: {
            min: 0, suggestedMax: 110,
            title: { display: true, text: 'Current I (μA)', color: '#94a3b8', font: { size: 12 } },
 
            ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.06)' }
          }
        }
      }
    });
    function updateTheoreticalLine() {
      const currentIm = getMaxIntensity();
      const theoreticalLine = Array.from({ length: 21 }, (_, i) => {
        const x = i / 20; 
        return { x, y: currentIm * x };
      });
      malusChart.data.datasets[0].data = theoreticalLine;
      malusChart.options.scales.y.suggestedMax = currentIm + 10;
      malusChart.update();
    }

    function refreshChart() {
      const sorted = [...readings].sort((a, b) => a.cos2 - b.cos2);
      malusChart.data.datasets[1].data = sorted.map(r => ({ x: r.cos2, y: r.I }));
      malusChart.update();
    }

    angleEl.addEventListener('input', updateUI);
    intensityEl.addEventListener('input', () => {
      updateUI();
      updateTheoreticalLine();
      
      if (readings.length > 0) {
         if (confirm("Changing the Max Intensity will reset your current recorded data. Proceed?")) {
             readings = [];
             renderTable();
             refreshChart();
       
         } else {
             readings = [];
             renderTable();
             refreshChart();
         }
      }
    });
    recordBtn.addEventListener('click', () => {
      const theta = parseInt(angleEl.value, 10);
      const currentIm = getMaxIntensity();
      const r = compute(theta, currentIm);
      
      const exists = readings.find(x => x.theta === theta);
      if(exists) {
          alert(`You have already recorded the reading for ${theta}°.`);
          return;
      }
      
   
       readings.push(r);
      readings.sort((a, b) => a.theta - b.theta); 
      renderTable();
      refreshChart();
    });
    resetBtn.addEventListener('click', () => {
      if(confirm("Clear all recorded data?")) {
        readings = [];
        renderTable();
        refreshChart();
      }
    });
    updateUI();
    updateTheoreticalLine();
    renderTable();
});

// END OF MALUS LAB LOGIC

// =====================================================================
// SECTION 3: SOLAR CELL LAB LOGIC
// =====================================================================

function initSolarLab() {
  const container = document.getElementById('view-lab-solar');
  if (!container) return;

  const ui = {
    illumSlider: document.getElementById('solar-illum-slider'),
    illumVal: document.getElementById('solar-illum-val'),
    rSlider: document.getElementById('solar-r-slider'),
    rVal: document.getElementById('solar-r-val'),
    tempSlider: document.getElementById('solar-temp-slider'),
    tempVal: document.getElementById('solar-temp-val'),
    voltRead: document.getElementById('solar-volt-read'),
    currRead: document.getElementById('solar-curr-read'),
    powRead: document.getElementById('solar-pow-read'),
    vocLbl: document.getElementById('solar-voc-lbl'),
    iscLbl: document.getElementById('solar-isc-lbl'),
    ffLbl: document.getElementById('solar-ff-lbl'),
    // Add a status element in your HTML for this
    statusLbl: document.getElementById('solar-status-guidance'), 
    recordBtn: document.getElementById('solar-record-btn'),
    resetBtn: document.getElementById('solar-reset-btn'),
    tableBody: document.getElementById('solar-table-body'),
    readingCount: document.getElementById('solar-reading-count'),
    chartCanvas: document.getElementById('solar-iv-chart'),
    lightBeam: document.getElementById('solar-lightBeam'),
    cellGlow: document.getElementById('solar-cellGlowRect'),
    dot1: document.getElementById('solar-current-dot1'),
    dot2: document.getElementById('solar-current-dot2')
  };

  if (!ui.chartCanvas) return;

  let chartInstance = null;
  let recordedData = [];
  let readingIndex = 1;

  let state = {
    G: 1000, T: 25, R_slider: 100, R_actual: 100000,
    V_op: 0, I_op: 0, P_op: 0,
    Voc: 0, Isc: 0, Pmax: 0, FF: 0
  };

  function solveCircuit() {
    state.G = parseInt(ui.illumSlider.value);
    state.T = parseInt(ui.tempSlider.value);
    state.R_slider = parseInt(ui.rSlider.value);

    // Quadratic resistance mapping
    if (state.R_slider === 100) {
      state.R_actual = 100000;
      ui.rVal.innerText = "Open";
    } else {
      state.R_actual = Math.pow(state.R_slider, 2) * 0.1 + 0.01;
      ui.rVal.innerText = state.R_actual.toFixed(1) + " Ω";
    }

    ui.illumVal.innerText = state.G + " W/m²";
    ui.tempVal.innerText = state.T + " °C";

    // Physics constants
    const k = 1.38e-23;
    const q = 1.602e-19;
    const T_kelvin = state.T + 273.15;
    
    // Dynamic Ideality Factor (changes with T, affecting FF)
    const n = 1.2 + (state.T / 200); 
    const V_thermal = (n * k * T_kelvin) / q;

    // Standard baseline
    const Voc_0 = 0.62; 
    const Isc_0 = 100; 

    // Temperature & Illumination Effects
    const deltaT = state.T - 25;
    state.Isc = Isc_0 * (state.G / 1000) * (1 + 0.0005 * deltaT);
    state.Voc = (Voc_0 - 0.0022 * deltaT) + V_thermal * Math.log(Math.max(0.01, state.G / 1000));

    // Newton-Raphson to find V where I_cell = V / R_load
    let V = state.Voc;
    if (state.R_slider === 100) {
      V = state.Voc;
      state.I_op = 0;
    } else {
      for (let i = 0; i < 25; i++) {
        let I_cell = state.Isc * (1 - Math.exp((V - state.Voc) / V_thermal));
        let I_res = (V / state.R_actual) * 1000; 
        let error = I_cell - I_res;
        let derivative = -(state.Isc / V_thermal) * Math.exp((V - state.Voc) / V_thermal) - (1000 / state.R_actual);
        let dV = error / derivative;
        V -= dV;
        if (Math.abs(dV) < 0.0001) break;
      }
      state.I_op = state.Isc * (1 - Math.exp((V - state.Voc) / V_thermal));
    }

    state.V_op = Math.max(0, V);
    state.I_op = Math.max(0, state.I_op);
    state.P_op = state.V_op * state.I_op;

    // Calculate Pmax for FF
    let Vm = state.Voc * 0.85;
    for(let i=0; i<15; i++) {
        let f = state.Isc * (1 - Math.exp((Vm - state.Voc) / V_thermal)) * Vm;
        // Optimization: finding peak of P(V)
        Vm += 0.001; 
    }
    // Theoretical Max Power Point calculation
    const V_mpp = state.Voc - V_thermal * Math.log(1 + (state.Voc / V_thermal));
    const I_mpp = state.Isc * (1 - V_thermal / state.Voc); // Approximation
    state.Pmax = V_mpp * I_mpp;
    state.FF = state.Pmax / (state.Voc * state.Isc);

    updateUI();
    updateChartTheoretical(V_thermal);
  }

  function updateUI() {
    ui.voltRead.innerText = state.V_op.toFixed(2);
    ui.currRead.innerText = state.I_op.toFixed(1);
    ui.powRead.innerText = state.P_op.toFixed(2);
    ui.vocLbl.innerText = state.Voc.toFixed(2) + "V";
    ui.iscLbl.innerText = state.Isc.toFixed(1) + "mA";
    ui.ffLbl.innerText = state.FF.toFixed(3);

    // Guidance Logic
    if(ui.statusLbl) {
      if (state.FF > 0.75) {
        ui.statusLbl.innerText = "Excellent Conductor (Low Recombination)";
        ui.statusLbl.className = "text-emerald-400 font-bold text-xs mt-1";
      } else if (state.FF > 0.65) {
        ui.statusLbl.innerText = "Good Grade Semiconductor";
        ui.statusLbl.className = "text-cyan-400 font-bold text-xs mt-1";
      } else {
        ui.statusLbl.innerText = "Poor Efficiency (High Thermal Loss)";
        ui.statusLbl.className = "text-amber-500 font-bold text-xs mt-1";
      }
    }

    // Visuals
    const intensity = state.G / 1000;
    ui.lightBeam.style.opacity = intensity * 0.8;
    ui.cellGlow.style.opacity = intensity * 0.6;
    const animSpeed = state.I_op > 0.5 ? (4 / (state.I_op / 15)) : 0;
    ui.dot1.style.display = animSpeed === 0 ? 'none' : 'block';
    ui.dot2.style.display = animSpeed === 0 ? 'none' : 'block';
    if(animSpeed > 0) {
      ui.dot1.firstElementChild.setAttribute('dur', Math.min(5, animSpeed) + 's');
      ui.dot2.firstElementChild.setAttribute('dur', Math.min(5, animSpeed) + 's');
    }
  }

  function initChart() {
    const ctx = ui.chartCanvas.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          { label: 'I-V Curve', data: [], borderColor: '#22d3ee', borderWidth: 2, pointRadius: 0, tension: 0.4, yAxisID: 'y' },
          { label: 'P-V Curve', data: [], borderColor: 'rgba(245, 158, 11, 0.4)', borderWidth: 2, borderDash: [5,5], pointRadius: 0, tension: 0.4, yAxisID: 'y1' },
          { label: 'Recorded', data: [], backgroundColor: '#10b981', showLine: false, pointRadius: 5, yAxisID: 'y' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { type: 'linear', min: 0, max: 0.8, title: { display: true, text: 'Voltage (V)', color: '#94a3b8' } },
          y: { type: 'linear', min: 0, max: 120, title: { display: true, text: 'Current (mA)', color: '#22d3ee' } },
          y1: { type: 'linear', position: 'right', min: 0, max: 60, title: { display: true, text: 'Power (mW)', color: '#f59e0b' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function updateChartTheoretical(Vt) {
    let ivData = [];
    let pvData = [];
    for(let v = 0; v <= state.Voc + 0.02; v += 0.02) {
      let I = state.Isc * (1 - Math.exp((v - state.Voc) / Vt));
      if (I < 0) I = 0;
      ivData.push({x: v, y: I});
      pvData.push({x: v, y: v * I});
    }
    chartInstance.data.datasets[0].data = ivData;
    chartInstance.data.datasets[1].data = pvData;
    chartInstance.update('none');
  }

  // Events
  [ui.illumSlider, ui.rSlider, ui.tempSlider].forEach(s => s.addEventListener('input', solveCircuit));
  
  ui.recordBtn.onclick = () => {
    recordedData.push({ id: readingIndex++, v: state.V_op.toFixed(3), i: state.I_op.toFixed(1), p: state.P_op.toFixed(2) });
    chartInstance.data.datasets[2].data.push({ x: state.V_op, y: state.I_op });
    chartInstance.update();
    renderTable();
  };

  ui.resetBtn.onclick = () => {
    recordedData = []; readingIndex = 1;
    chartInstance.data.datasets[2].data = [];
    chartInstance.update();
    renderTable();
  };

  function renderTable() {
    ui.tableBody.innerHTML = recordedData.length ? '' : '<tr><td colspan="5" class="py-4 text-center text-slate-500 italic">No data.</td></tr>';
    recordedData.forEach(d => {
      ui.tableBody.innerHTML += `<tr class="border-b border-white/5"><td>#${d.id}</td><td>-</td><td>${d.v}</td><td>${d.i}</td><td>${d.p}</td></tr>`;
    });
    ui.readingCount.innerText = `${recordedData.length} readings`;
  }

  initChart();
  solveCircuit();
}

document.addEventListener('DOMContentLoaded', initSolarLab);

// END OF SOLAR CELL LAB LOGIC
// =====================================================================