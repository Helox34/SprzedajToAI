function render() {
  updateSteps();

  if (state.step === 0) renderUpload();
  if (state.step === 1) renderAnalysis();
  if (state.step === 2) renderDetails();
  if (state.step === 3) renderGenerating();
  if (state.step === 4) renderResult();
}

function renderUpload() {
  view.innerHTML = `
    <div class="card">
      <h2>Dodaj zdjęcie przedmiotu</h2>
      <input type="file" id="image">
      <button class="button" onclick="next()">Dalej</button>
    </div>
  `;
}

function renderDetails() {
  view.innerHTML = `
    <div class="card">
      <h2>Opowiedz nam o przedmiocie</h2>

      <label>Rozmiar</label>
      <input id="size">

      <label>Stan</label>
      <div class="options">
        ${["Nowy","Bardzo dobry","Dobry","Używany"].map(s =>
          `<div class="option" onclick="select('condition','${s}')">${s}</div>`
        ).join("")}
      </div>

      <label>Materiał</label>
      <input id="material">

      <label>Fason</label>
      <div class="options">
        ${["Standard","Oversize","Slim fit"].map(f =>
          `<div class="option" onclick="select('fit','${f}')">${f}</div>`
        ).join("")}
      </div>

      <button class="button" onclick="next()">Generuj ogłoszenie →</button>
    </div>
  `;
}

function renderResult() {
  view.innerHTML = `
    <div class="card grid-2">
      <div>
        <img src="${state.result.image}" style="width:100%;border-radius:12px">
        <div class="price-box">
          <h3>Sugerowana cena</h3>
          <h2>${state.result.price} PLN</h2>
          <p>${state.result.priceReason}</p>
        </div>
      </div>

      <div>
        <h3>Tytuł ogłoszenia</h3>
        <p>${state.result.title}</p>

        <h3>Opis</h3>
        <p>${state.result.description}</p>
      </div>
    </div>
  `;
}
