const datePicker = document.getElementById("date-picker");
const zhRowInput = document.getElementById("zh-row-input");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const loadingOverlay = document.getElementById("loading-overlay");

// Initialize Default Target Value to 15 December of the current year
const currentYear = new Date().getFullYear(); 
datePicker.value = `${currentYear}-12-15`;

/**
 * Primary API Execution Bridge.
 * Appends both the queried date and target row boundary directly to your server request.
 */
async function checkScheduleAvailability() {
  const targetDate = datePicker.value;
  const boundaryValue = zhRowInput.value;

  // ⚠️ UPDATE THIS KEY WITH YOUR TRUE ACTIVE DEPLOYMENT ID URL STRING:
  const apiEndpointBase = "https://script.google.com/macros/s/AKfycbwcP5D3ASgRBV5HYLAuVeKE3y6UNmv8CzcKgupE-YbalPu-5KB6T4wqsxhr_KlTKW-S/exec";
  const targetUrl = `${apiEndpointBase}?date=${targetDate}&zh_row=${boundaryValue}`;

  loadingOverlay.style.display = "block";

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
    const data = await response.json();
    
    if (data.status === "success") {
      // 1. Render English Team Panels (Ski vs Snowboard)
      updateTeamDisciplineUI("en", data.enMetrics);
      
      // 2. Render Chinese Team Panels (Ski vs Snowboard)
      updateTeamDisciplineUI("zh", data.zhMetrics);
    }
  } catch (error) {
    console.error("Fetch Execution Error:", error);
  } finally {
    loadingOverlay.style.display = "none";
  }
}

/**
 * 🟢 RENDER ENGINE UPDATE:
 * Handles the updated sub-divided structural data tokens cleanly.
 * @param {string} prefix - "en" or "zh" to match HTML element container IDs
 * @param {Object} teamMetrics - The metrics dictionary payload from the server
 */
function updateTeamDisciplineUI(prefix, teamMetrics) {
  document.getElementById(`${prefix}-staff`).textContent = teamMetrics.present;
  document.getElementById(`${prefix}-unassigned`).textContent = teamMetrics.unassigned;

  // Map individual cell metrics to their respective UI display targets [STEM-Calculative-Problem-Solving]
  formatSlotDisplay(document.getElementById(`${prefix}-ski-am`), teamMetrics.skiAm);
  formatSlotDisplay(document.getElementById(`${prefix}-ski-pm`), teamMetrics.skiPm);
  formatSlotDisplay(document.getElementById(`${prefix}-sb-am`),  teamMetrics.sbAm);
  formatSlotDisplay(document.getElementById(`${prefix}-sb-pm`),  teamMetrics.sbPm);
}

/**
 * Intercepts numbers and formats negative metrics to red overbooked alerts.
 */
function formatSlotDisplay(element, openCount) {
  if (!element) return; // Safeguard if element target is missing
  
  if (openCount < 0) {
    // Convert a negative count like -1 into a clean string: "⚠️ Over 1"
    element.textContent = `⚠️ Over ${Math.abs(openCount)}`;
    element.style.color = "#e53e3e"; // Warning Red
    element.style.fontSize = "14px"; 
    element.style.fontWeight = "bold";
  } else {
    element.textContent = openCount;
    element.style.color = "#2d3748"; // Normal Dark Grey
    element.style.fontSize = "18px";
    element.style.fontWeight = "bold";
  }
}

/**
 * Shifts the input calendar picker forward or backward by a set number of days.
 */
function shiftDateByDays(daysToShift) {
  const currentSelectedDate = new Date(datePicker.value);
  if (isNaN(currentSelectedDate.getTime())) return;
  
  currentSelectedDate.setDate(currentSelectedDate.getDate() + daysToShift);
  datePicker.value = currentSelectedDate.toISOString().split('T')[0];
  checkScheduleAvailability();
}

// EVENT ATTACHMENT LISTENERS
prevBtn.addEventListener("click", () => shiftDateByDays(-1));
nextBtn.addEventListener("click", () => shiftDateByDays(1));
datePicker.addEventListener("change", checkScheduleAvailability);
zhRowInput.addEventListener("change", checkScheduleAvailability);

// Bootstrap execution pass on script window startup
checkScheduleAvailability();
