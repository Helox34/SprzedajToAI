// Ikony SVG
const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const ICON_TAG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;

function render() {
  updateSteps();
  
  // Ukryj kroki w widoku historii
  const stepsEl = document.querySelector('.steps');
  if(stepsEl) stepsEl.style.display = state.step === 'history' ? 'none' : 'flex';

  if (state.step === 0) renderUpload();
  if (state.step === 1) renderAnalysis();
  if (state.step === 2) renderDetails();
  if (state.step === 3) renderGenerating();
  if (state.step === 4) renderResult();
  if (state.step === 'history') renderHistory();
}

function renderUpload() {
  view.innerHTML = `
    <div class="card" style="text-align: center; padding: 80px 20px;">
      <div style="background: #eff6ff; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
      </div>
      <h2>Dodaj zdjęcie przedmiotu</h2>
      <p class="subtitle" style="max-width: 400px; margin: 0 auto 32px auto;">Wgraj zdjęcie, a AI automatycznie przygotuje opis, tytuł i wycenę.</p>
      <input type="file" id="image" accept="image/*" style="display: none" onchange="handleImageUpload(this)">
      <button class="button" onclick="document.getElementById('image').click()" style="max-width: 300px; margin: 0 auto;">Wybierz plik</button>
    </div>
  `;
}

function renderAnalysis() {
  const imgSrc = state.image ? URL.createObjectURL(state.image) : "";
  view.innerHTML = `
    <div class="card" style="text-align: center;">
      <h2 style="color: #2563eb;">Analiza obrazu...</h2>
      <div style="position: relative; max-width: 300px; margin: 24px auto; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <img src="${imgSrc}" style="width: 100%; display: block;">
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, rgba(37,99,235,0.2), transparent); border-bottom: 3px solid #2563eb; animation: scan 2s infinite;"></div>
      </div>
      <p class="subtitle">Identyfikacja przedmiotu i pobieranie danych rynkowych.</p>
    </div>
    <style>@keyframes scan { 0% {transform: translateY(-100%);} 100% {transform: translateY(100%);} }</style>
  `;
  setTimeout(() => next(), 2000);
}

function renderDetails() {
  const isActive = (key, val) => state.details[key] === val ? 'active' : '';
  view.innerHTML = `
    <div class="card">
      <h2>Opowiedz nam o przedmiocie</h2>
      <p class="subtitle">Zidentyfikowaliśmy Twój przedmiot. Odpowiedz na kilka pytań.</p>

      <label>Jaki jest rozmiar z metki?</label>
      <input value="${state.details.size || ''}" oninput="state.details.size = this.value" placeholder="np. M, 38, L...">

      <label>W jakim stanie jest przedmiot?</label>
      <div class="options">
        ${["Nowy", "Bardzo dobry", "Dobry", "Używany"].map(s => 
          `<div class="option ${isActive('condition', s)}" onclick="select('condition','${s}')">${s}</div>`
        ).join("")}
      </div>

      <label>Materiał (opcjonalnie)</label>
      <input value="${state.details.material || ''}" oninput="state.details.material = this.value" placeholder="np. Bawełna">

      <label>Fason</label>
      <div class="options">
        ${["Standard", "Oversize", "Slim fit"].map(f => 
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
      <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; max-width: 300px; margin: 0 auto;">
        <div style="width: 50%; height: 100%; background: #2563eb; animation: load 1.5s infinite ease-in-out;"></div>
      </div>
    </div>
    <style>@keyframes load { 0% {transform: translateX(-100%);} 100% {transform: translateX(200%);} }</style>
  `;
}

function renderResult() {
  view.innerHTML = `
    <div class="grid-result">
      <div>
        <div style="background:white; padding:12px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
          <span style="position:absolute; background:rgba(0,0,0,0.7); color:white; padding:4px 10px; border-radius:6px; font-size:10px; margin:12px; font-weight:700;">AI ENHANCED</span>
          <img src="${state.result.image}" style="width:100%; border-radius:8px;">
        </div>
        <div class="price-card">
          <div style="font-size:12px; text-transform:uppercase; opacity:0.8; font-weight:600;">Sugerowana cena</div>
          <div class="price-amount">${state.result.price} PLN</div>
          <div style="font-size:13px; opacity:0.9;">${state.result.priceReason}</div>
        </div>
      </div>

      <div>
        <div class="info-section">
          <div class="section-header">
            <span class="section-title">Tytuł ogłoszenia</span>
            <button class="copy-btn" onclick="copyText('${state.result.title.replace(/'/g, "\\'")}')">${ICON_COPY}</button>
          </div>
          <div style="font-weight:700; font-size:18px;">${state.result.title}</div>
        </div>

        <div class="info-section">
          <div class="section-header">
            <span class="section-title">Opis przedmiotu</span>
            <button class="copy-btn" onclick="copyText('${state.result.description.replace(/(\r\n|\n|\r)/gm, "\\n").replace(/'/g, "\\'")}')">${ICON_COPY}</button>
          </div>
          <div style="font-size:15px; line-height:1.6; white-space:pre-wrap;">${state.result.description}</div>
        </div>

        <div style="margin-top:24px;">
           ${["okazja", "sprzedam", "hit"].map(t => `<div class="tag">${ICON_TAG} ${t}</div>`).join("")}
        </div>

        <button class="button secondary" onclick="location.reload()" style="margin-top:32px;">↺ Dodaj kolejny przedmiot</button>
      </div>
    </div>
  `;
}

function renderHistory() {
  if (state.history.length === 0) {
    view.innerHTML = `
      <div class="card" style="text-align:center;">
        <h2>Brak historii</h2>
        <p class="subtitle">Nie wygenerowałeś jeszcze żadnych ogłoszeń.</p>
        <button class="button" onclick="location.reload()" style="max-width:200px; margin:0 auto;">Wróć</button>
      </div>`;
    return;
  }

  view.innerHTML = `
    <div>
      <h2 style="margin-bottom:24px;">Historia ogłoszeń</h2>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
        ${state.history.map(item => `
          <div class="card" style="padding:0; overflow:hidden; cursor:pointer; transition: transform 0.2s;" onclick="loadHistoryItem(${item.id})">
            <div style="height:180px; overflow:hidden;">
               <img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="padding:20px;">
              <div style="font-weight:700; margin-bottom:4px;">${item.price} PLN</div>
              <div style="font-size:13px; color:#64748b; margin-bottom:12px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${item.title}</div>
              <button class="button delete" onclick="deleteHistoryItem(${item.id}, event)" style="margin-top:0; padding:8px; font-size:12px; width:auto;">Usuń</button>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="button secondary" onclick="location.reload()" style="width:auto; margin-top:32px;">← Wróć do kreatora</button>
    </div>
  `;
}