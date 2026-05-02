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

    /* ===== DOM Elements for Malus Lab ===== */
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
            borderWidth: 1, titleColor: '#06b6d4', bodyColor: '#f8fafc', padding: 12, cornerRadius: 8,
            callbacks: { label: (ctx) => `cos²θ = ${ctx.parsed.x.toFixed(3)}, I = ${ctx.parsed.y.toFixed(2)} μA` }
          }
        },
        scales: {
          x: {
            type: 'linear', min: 0, max: 1.1,
            title: { display: true, text: 'cos²θ', color: '#94a3b8', font: { size: 12 } },
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