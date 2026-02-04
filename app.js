const form = document.getElementById("bmiForm");
const metricFields = document.getElementById("metricFields");
const imperialFields = document.getElementById("imperialFields");
const resetBtn = document.getElementById("resetBtn");

const heightCm = document.getElementById("heightCm");
const weightKg = document.getElementById("weightKg");
const heightFt = document.getElementById("heightFt");
const heightIn = document.getElementById("heightIn");
const weightLb = document.getElementById("weightLb");

const bmiValue = document.getElementById("bmiValue");
const bmiCategory = document.getElementById("bmiCategory");
const badge = document.getElementById("badge");
const meterIndicator = document.getElementById("meterIndicator");
const weightRange = document.getElementById("weightRange");
const goalHint = document.getElementById("goalHint");

const ranges = [
  { label: "Underweight", max: 18.4, color: "#88c4b4" },
  { label: "Normal", min: 18.5, max: 24.9, color: "#a6d6a6" },
  { label: "Overweight", min: 25, max: 29.9, color: "#f0c37b" },
  { label: "Obese", min: 30, max: 60, color: "#e58a6a" },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getUnitMode() {
  return document.querySelector("input[name='units']:checked").value;
}

function switchUnits(mode) {
  const isMetric = mode === "metric";
  metricFields.classList.toggle("hidden", !isMetric);
  imperialFields.classList.toggle("hidden", isMetric);

  heightCm.toggleAttribute("required", isMetric);
  weightKg.toggleAttribute("required", isMetric);

  heightFt.toggleAttribute("required", !isMetric);
  heightIn.toggleAttribute("required", !isMetric);
  weightLb.toggleAttribute("required", !isMetric);

  setEmptyState();
}

function setEmptyState() {
  bmiValue.textContent = "--";
  bmiCategory.textContent = "Enter details to calculate";
  badge.textContent = "No data yet";
  badge.style.background = "#f2f3f6";
  badge.style.color = "#5b5b68";
  weightRange.textContent = "--";
  goalHint.textContent = "--";
  meterIndicator.style.left = "0%";
}

function calculateBMI(mode) {
  if (mode === "metric") {
    const height = parseFloat(heightCm.value);
    const weight = parseFloat(weightKg.value);

    if (!height || !weight) return null;

    const heightM = height / 100;
    return weight / (heightM * heightM);
  }

  const ft = parseFloat(heightFt.value);
  const inches = parseFloat(heightIn.value);
  const weight = parseFloat(weightLb.value);

  if (!weight || (!ft && !inches)) return null;

  const totalInches = ft * 12 + inches;
  if (!totalInches) return null;

  return (703 * weight) / (totalInches * totalInches);
}

function getCategory(bmi) {
  return ranges.find((range) => (range.min ? bmi >= range.min : bmi <= range.max));
}

function getHealthyRange(mode) {
  if (mode === "metric") {
    const height = parseFloat(heightCm.value);
    if (!height) return null;
    const heightM = height / 100;
    return {
      min: 18.5 * heightM * heightM,
      max: 24.9 * heightM * heightM,
      unit: "kg",
    };
  }

  const ft = parseFloat(heightFt.value);
  const inches = parseFloat(heightIn.value);
  if (!ft && !inches) return null;
  const totalInches = ft * 12 + inches;
  if (!totalInches) return null;

  return {
    min: (18.5 * totalInches * totalInches) / 703,
    max: (24.9 * totalInches * totalInches) / 703,
    unit: "lb",
  };
}

function updateResult(bmi, mode) {
  const rounded = bmi.toFixed(1);
  const category = getCategory(bmi);

  bmiValue.textContent = rounded;
  bmiCategory.textContent = category.label;
  badge.textContent = category.label;
  badge.style.background = category.color;
  badge.style.color = "#1c1b1f";

  const normalized = clamp((bmi - 14) / (40 - 14), 0, 1);
  meterIndicator.style.left = `${normalized * 100}%`;

  const range = getHealthyRange(mode);
  if (range) {
    weightRange.textContent = `${range.min.toFixed(1)} - ${range.max.toFixed(1)} ${range.unit}`;
  }

  const gap = bmi < 18.5 ? "gain" : bmi >= 25 ? "reduce" : "maintain";
  const suggestion =
    gap === "maintain"
      ? "Maintain your current routine for steady health."
      : gap === "gain"
      ? "Consider a balanced nutrition plan to reach healthy range."
      : "Light activity and balanced meals can help reach healthy range.";

  goalHint.textContent = suggestion;
}

function handleSubmit(event) {
  event.preventDefault();

  const mode = getUnitMode();
  const bmi = calculateBMI(mode);

  if (!bmi) {
    setEmptyState();
    bmiCategory.textContent = "Please fill all fields";
    return;
  }

  updateResult(bmi, mode);
}

function resetForm() {
  form.reset();
  switchUnits(getUnitMode());
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", resetForm);

document.querySelectorAll("input[name='units']").forEach((input) => {
  input.addEventListener("change", (event) => {
    switchUnits(event.target.value);
  });
});

setEmptyState();
