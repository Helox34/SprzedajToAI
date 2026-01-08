// Ikony SVG jako stałe (dla czytelności kodu)
const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const ICON_TAG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;

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
    <div class="card" style="text-align: center; padding: 60px 20px;">
      <div style="background: #eff6ff; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
      </div>
      <h2>Dodaj zdjęcie przedmiotu</h2>
      <p class="subtitle" style="max-width: 400px; margin: 0 auto 32px auto;">
        Wgraj zdjęcie, a AI automatycznie przygotuje opis, tytuł i wycenę.
      </p>
      
      <input type="file" id="image" accept="image/*" style="display: none" onchange="handleImageUpload(this)">
      
      <button class="button" onclick="document.getElementById('image').click()" style="max-width: 300px; margin: 0 auto;">
        Wybierz plik
      </button>
    </div>
  `;
}

function renderAnalysis() {
  const imgSrc = state.image ? URL.createObjectURL(state.image) : "";
  view.innerHTML = `
    <div class="card" style="text-align: center;">
      <h2 style="color: #3b82f6; margin-bottom: 24px;">Analiza obrazu...</h2>
      
      <div style="position: relative; max-width: 300px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <img src="${imgSrc}" style="width: 100%; display: block;">
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, rgba(59,130,246,0.2), transparent); border-bottom: 3px solid #3b82f6; animation: scan 2s infinite;"></div>
      </div>
      <p class="subtitle" style="margin-top: 24px;">Identyfikacja przedmiotu i pobieranie danych rynkowych.</p>
    </div>
    <style>@keyframes scan { 0% {transform: translateY(-100%);} 100% {transform: translateY(100%);} }</style>
  `;
  setTimeout(() => next(), 2500);
}

function renderDetails() {
  // Funkcja pomocnicza do sprawdzania czy opcja jest aktywna
  const isActive = (key, val) => state.details[key] === val ? 'active' : '';

  view.innerHTML = `
    <div class="card">
      <h2>Opowiedz nam o przedmiocie</h2>
      <p class="subtitle">Zidentyfikowaliśmy Twój przedmiot. Odpowiedz na kilka pytań, abyśmy mogli stworzyć perfekcyjne ogłoszenie.</p>

      <label>Jaki jest rozmiar z metki?</label>
      <input id="size" placeholder="Wpisz odpowiedź..." value="${state.details.size || ''}" oninput="state.details.size = this.value">

      <label>W jakim stanie jest przedmiot?</label>
      <div class="options">
        ${["Nowy", "Bardzo dobry", "Dobry", "Używany"].map(s =>
          `<div class="option ${isActive('condition', s)}" onclick="select('condition','${s}')">${s}</div>`
        ).join("")}
      </div>

      <label>Z jakiego materiału jest wykonany?</label>
      <input id="material" placeholder="Wpisz odpowiedź..." value="${state.details.material || ''}" oninput="state.details.material = this.value">

      <label>Jaki to fason (krój)?</label>
      <div class="options">
        ${["Standardowy", "Oversize", "Slim fit"].map(f =>
          `<div class="option ${isActive('fit', f)}" onclick="select('fit','${f}')">${f}</div>`
        ).join("")}
      </div>

      <button class="button" onclick="next()">Generuj Ogłoszenie →</button>
    </div>
  `;
}

function renderGenerating() {
  view.innerHTML = `
    <div class="card" style="text-align: center; padding: 80px 20px;">
      <h2>Tworzenie ogłoszenia...</h2>
      <p class="subtitle">Piszę chwytliwy opis i szacuję wartość.</p>
      <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; max-width: 400px; margin: 0 auto;">
        <div style="width: 50%; height: 100%; background: #3b82f6; animation: load 1.5s infinite ease-in-out;"></div>
      </div>
    </div>
    <style>@keyframes load { 0% {transform: translateX(-100%);} 100% {transform: translateX(200%);} }</style>
  `;
}

function renderResult() {
  view.innerHTML = `
    <div class="success-banner">
      <div class="success-icon">✓</div>
      <div>
        <div style="font-weight: 600; font-size: 15px;">Ogłoszenie gotowe!</div>
        <div style="font-size: 13px; opacity: 0.8;">Wygenerowaliśmy opis, tytuł i odświeżyliśmy zdjęcie.</div>
      </div>
    </div>

    <div class="grid-result">
      
      <div>
        <div class="image-container">
          <span class="ai-badge">AI ENHANCED</span>
          <img src="${state.result.image}" style="width:100%; border-radius: 8px;">
        </div>

        <div class="price-card">
          <div class="price-title">Sugerowana cena</div>
          <div class="price-amount">${state.result.price} PLN</div>
          <div class="price-desc">${state.result.priceReason}</div>
        </div>
      </div>

      <div>
        
        <div class="info-section">
          <div class="section-header">
            <span class="section-title">Tytuł ogłoszenia</span>
            <button class="copy-btn" onclick="copyText('${state.result.title.replace(/'/g, "\\'")}')" title="Kopiuj tytuł">${ICON_COPY}</button>
          </div>
          <div class="result-title">${state.result.title}</div>
        </div>

        <div class="info-section">
          <div class="section-header">
            <span class="section-title">Opis przedmiotu</span>
            <button class="copy-btn" onclick="copyText('${state.result.description.replace(/(\r\n|\n|\r)/gm, "\\n").replace(/'/g, "\\'")}')" title="Kopiuj opis">${ICON_COPY}</button>
          </div>
          <div class="result-text">${state.result.description}</div>
        </div>

        <div class="tags-container">
           ${["nike", "bluza", "streetwear", "crewneck", "rozmiarM", "sportstyle"].map(t => 
             `<div class="tag">${ICON_TAG} ${t}</div>`
           ).join("")}
        </div>

        <button class="button secondary" style="background: white; border: 1px solid #e2e8f0; color: #475569; margin-top: 32px; box-shadow:none;" onclick="location.reload()">
          ↺ Dodaj kolejny przedmiot
        </button>

      </div>
    </div>
  `;
}

// Funkcja pomocnicza do kopiowania
function copyText(text) {
  navigator.clipboard.writeText(text);
  // Można dodać tutaj mały toast z informacją o skopiowaniu
  alert("Skopiowano do schowka!");
}