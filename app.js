const datePicker = document.getElementById("date-picker");
const zhRowInput = document.getElementById("zh-row-input");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const loadingOverlay = document.getElementById("loading-overlay");

datePicker.value = new Date().toISOString().split('T')[0];

async function checkScheduleAvailability() {
  const targetDate = datePicker.value;
  const boundaryValue = zhRowInput.value;

  const apiEndpointBase = "https://script.google.com/macros/s/AKfycbxQ1EdKtUwTPlMd4hRaDXccXQNaQKDmi8-IWFFSTGi0R9ygcDHqVhgwybSaN2WwNs4F/exec";
  const targetUrl = `${apiEndpointBase}?date=${targetDate}&zh_row=${boundaryValue}`;

  loadingOverlay.style.display = "block";

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
    const data = await response.json();
    
    if (data.status === "success") {
      // Render English Team Panels
      updateMetricUI("en-staff", "en-unassigned", "en-am", "en-pm", data.enMetrics);
      
      // Render Chinese Team Panels
      updateMetricUI("zh-staff", "zh-unassigned", "zh-am", "zh-pm", data.zhMetrics);
    }
  } catch (error) {
    console.error("Fetch Execution Error:", error);
  } finally {
    loadingOverlay.style.display = "none";
  }
}

/**
 * 🟢 NEW HELPER MODULE RENDER ENGINE:
 * Evaluates metric counts and formats negative values as overbookings dynamically.
 */
function updateMetricUI(staffId, unassignedId, amId, pmId, teamMetrics) {
  document.getElementById(staffId).textContent = teamMetrics.present;
  document.getElementById(unassignedId).textContent = teamMetrics.unassigned;

  formatSlotDisplay(document.getElementById(amId), teamMetrics.openAm);
  formatSlotDisplay(document.getElementById(pmId), teamMetrics.openPm);
}

/**
 * Helper to intercept integers and convert negative metrics to alert texts.
 */
function formatSlotDisplay(element, openCount) {
  if (openCount < 0) {
    // 🟢 Convert a negative count like -2 into an absolute value string: "⚠️ Overbooked by 2"
    element.textContent = `⚠️ Over ${Math.abs(openCount)}`;
    element.style.color = "#e53e3e"; // Apply bold warning red color style properties
    element.style.fontSize = "15px"; // Adjust text bounds to prevent design wrap layout clipping
  } else {
    element.textContent = openCount;
    element.style.color = "#2d3748"; // Return back to standard dark styling properties
    element.style.fontSize = "20px";
  }
}

function shiftDateByDays(daysToShift) {
  const currentSelectedDate = new Date(datePicker.value);
  if (isNaN(currentSelectedDate.getTime())) return;
  currentSelectedDate.setDate(currentSelectedDate.getDate() + daysToShift);
  datePicker.value = currentSelectedDate.toISOString().split('T')[0];
  checkScheduleAvailability();
}

prevBtn.addEventListener("click", () => shiftDateByDays(-1));
nextBtn.addEventListener("click", () => shiftDateByDays(1));
datePicker.addEventListener("change", checkScheduleAvailability);
zhRowInput.addEventListener("change", checkScheduleAvailability);

checkScheduleAvailability();
