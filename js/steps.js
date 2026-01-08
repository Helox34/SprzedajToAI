function updateSteps() {
  const stepsContainer = document.querySelector(".steps");
  
  // Lista kroków zgodna ze zdjęciem
  const stepLabels = ["Zdjęcie", "Analiza", "Szczegóły", "Tworzenie", "Gotowe"];
  
  // Generowanie HTML dla kroków
  stepsContainer.innerHTML = stepLabels.map((label, index) => {
    const isActive = index === state.step;
    // Jeśli krok jest za nami, też możemy go oznaczyć jako aktywny lub zrobiony (opcjonalnie)
    const activeClass = isActive ? "active" : "";
    
    return `
      <div class="step ${activeClass}">
        <div class="step-circle">${index + 1}</div>
        <div class="step-label">${label}</div>
      </div>
    `;
  }).join("");
}