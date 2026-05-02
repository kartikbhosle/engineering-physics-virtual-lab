# VirtuLab — PESMCOE 🔬

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

An interactive, high-fidelity virtual physics laboratory developed for the engineering students at **PES Modern College of Engineering (PESMCOE)**, Pune. 

Currently featuring **Experiment 04: Verification of the Cosine² Law of Malus**, this platform bridges the gap between theoretical physics and practical application by simulating complex optical phenomena in a safe, accessible, 24/7 digital environment.

---

## ✨ Key Features

* **Single Page Application (SPA) Architecture:** Seamlessly navigate between the Dashboard, Experiment Catalog, and active Virtual Labs without page reloads.
* **Modern UI/UX:** Designed with a sleek, dark-room aesthetic utilizing Glassmorphism and Tailwind CSS, providing a highly professional scientific environment.
* **Interactive Optical Bench:** 
  * Toggleable laser light source with standby glowing effects.
  * Adjustable Max Intensity ($I_m$) calibration.
  * Smooth rotation controls for the Analyzer Grating (0° to 90°).
* **Automated Data Logging:** Click to record readings instantly into a responsive HTML table. Includes duplicate-entry prevention.
* **Real-Time Scientific Graphing:** Uses `Chart.js` to plot an active scatter graph of Current ($I$) vs $\cos^2\theta$, overlaying user data against a dynamic theoretical reference line.

---

## 📐 The Physics: Malus' Law

This simulation accurately models Malus' Law, which states that the intensity of plane-polarized light that passes through an analyzer varies as the square of the cosine of the angle between the plane of the polarizer and the transmission axis of the analyzer.

**Formula:**  
`I = I_m * cos²(θ)`

*   **`I`** = Transmitted Intensity (Current in μA)
*   **`I_m`** = Maximum Intensity (When θ = 0°)
*   **`θ`** = Angle between polarizer and analyzer

---

## 🛠️ Technologies Used

* **Frontend Structure:** HTML5
* **Styling:** CSS3 & Tailwind CSS (via CDN)
* **Logic & Physics Engine:** Vanilla JavaScript (ES6+)
* **Data Visualization:** Chart.js (via CDN)

*(Note: Built entirely with vanilla web technologies. No `npm install`, Node.js, or heavy frameworks required to run.)*

---

## 🚀 How to Run Locally

Because VirtuLab is built with purely native web technologies, setting it up is incredibly easy:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/kartikbhosle/malus-law-virtual-lab]