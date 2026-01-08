// App State
const state = {
    currentStep: 0, // 0: Upload, 1: Details, 2: Loading, 3: Result
    data: {
        itemName: "Bluza Nike Air",
        size: "",
        condition: "",
        material: "",
        fit: "",
        platform: "vinted", // Default platform tab
        uploadedImage: null // Store base64 image here
    }
};

// DOM Elements
const appView = document.getElementById('app-view');

// Content Data for Result View
const resultData = {
    vinted: {
        title: "Bluza NIKE AIR Crewneck Czarna M Oryginalna Sportowa BDB",
        desc: "Czarna klasyka! 🖤 Świetna bluza NIKE AIR Crewneck w rozmiarze M. Idealna dla miłośników streetwearu i sportowego luzu. Stan bardzo dobry (BDB), mało noszona. To must-have w szafie – bawełniana, super wygodna i z kultowym, dużym logo Nike Air, które przyciąga wzrok. Idealna na chłodniejsze dni.\n\nWymiary i więcej zdjęć na życzenie!\n\nRozmiar: M\nMarka: Nike\nStan: BDB\nZapraszam do szafy po więcej markowych ubrań! 🛍️\n\n#nike #bluzanike #nikeair #crewneck #czarnabluza #sportswear #streetwear #rozmiarm #modameska #modadamska #unisex #kurtka #hype"
    },
    olx: {
        title: "Oryginalna Bluza Nike Air Crewneck Czarna Rozmiar M Stan BDB",
        desc: "Sprzedam czarną bluzę marki Nike, model Air Crewneck w rozmiarze M. Bluza jest w stanie bardzo dobrym, bez dziur, plam czy przetarć. Kolor nie jest sprany, wciąż głęboka czerń.\n\nWykonana z bardzo przyjemnego materiału (mieszanka bawełny). Posiada duże, haftowane/nadrukowane logo na froncie. Świetnie leży, krój regularny.\n\nMożliwy odbiór osobisty w Warszawie lub wysyłka OLX (Paczkomat/Orlen).\nZapraszam do kontaktu przez wiadomość OLX."
    },
    allegro: {
        title: "BLUZA MĘSKA NIKE AIR CREWNECK CZARNA R. M ORYGINAŁ",
        desc: "Przedmiotem sprzedaży jest oryginalna bluza męska marki NIKE.\n\nModel: Nike Air Crewneck\nRozmiar: M\nKolor: Czarny\nStan: Bardzo dobry (używana, zadbana)\n\nCechy produktu:\n- Klasyczny krój crewneck\n- Wysokiej jakości materiał dominujący: bawełna\n- Wyraziste logo na klatce piersiowej\n- Ściągacze przy rękawach i na dole bluzy w idealnym stanie\n\nGwarantuję szybką wysyłkę w 24h. Produkt w 100% oryginalny. Zachęcam do licytacji i zakupu!"
    }
};

// Views Components
const views = {
    upload: () => `
        <div style="text-align: center; animation: fadeIn 0.5s;">
            <h1 class="hero-title">Sprzedaj to. Szybko.</h1>
            <p class="hero-subtitle">AI stworzy ofertę za Ciebie w 5 sekund.</p>
            
            <input type="file" id="fileInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event)">
            
            <div class="upload-container" onclick="triggerFileInput()">
                <div class="upload-icon-circle">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <h3 class="upload-title">Zrób zdjęcie lub wgraj plik</h3>
                <p class="upload-desc">Obsługujemy JPG, PNG, WEBP</p>
                
                <div class="upload-actions">
                    <button class="btn-upload-option btn-gallery" onclick="event.stopPropagation(); triggerFileInput()">
                        <i class="fa-solid fa-image"></i> Galeria
                    </button>
                    <button class="btn-upload-option btn-camera" onclick="event.stopPropagation(); triggerFileInput()">
                        <i class="fa-solid fa-camera"></i> Aparat
                    </button>
                </div>
            </div>
        </div>
    `,

    details: () => `
        <div class="card">
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                    <i class="fa-solid fa-sparkles" style="color: #FBBF24;"></i> Opowiedz nam o przedmiocie
                </h1>
                <p style="color: var(--text-secondary); line-height: 1.5;">
                    Zidentyfikowaliśmy Twój przedmiot jako: <strong style="color: var(--primary);">Bluza Nike Air</strong>. 
                </p>
            </div>

            <form id="details-form" onsubmit="handleDetailsSubmit(event)">
                <!-- Size Input -->
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label class="form-label">Jaki jest rozmiar z metki?</label>
                    <input type="text" class="form-input" placeholder="Wpisz odpowiedź..." required>
                </div>

                <!-- Condition Buttons -->
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label class="form-label">W jakim stanie jest bluza?</label>
                    <div class="grid-2">
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Nowy')">Nowy</button>
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Bardzo dobry')">Bardzo dobry</button>
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Dobry')">Dobry</button>
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Używany')">Używany</button>
                    </div>
                </div>

                <!-- Material Input -->
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label class="form-label">Z jakiego materiału jest wykonana bluza?</label>
                    <input type="text" class="form-input" placeholder="Wpisz odpowiedź..." required>
                </div>

                <!-- Fit Buttons -->
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label class="form-label">Jaki to fason (krój)?</label>
                    <div class="grid-2">
                        <button type="button" class="select-btn" onclick="selectOption(this, 'fit', 'Standardowy')">Standardowy</button>
                        <button type="button" class="select-btn" onclick="selectOption(this, 'fit', 'Oversize')">Oversize</button>
                        <button type="button" class="select-btn" style="width: 50%" onclick="selectOption(this, 'fit', 'Slim fit')">Slim fit</button>
                    </div>
                </div>

                <button type="submit" class="btn-primary" style="width: 100%;">
                    Generuj Ogłoszenie 
                    <i class="fa-solid fa-rocket" style="margin-left: 8px;"></i>
                </button>
            </form>
        </div>
    `,

    result: () => `
        <div class="result-layout">
            
            <div class="result-header">
                <h1 class="result-title">Gotowe! 🚀</h1>
                <span class="new-item-link" onclick="location.reload()">Nowy przedmiot</span>
            </div>
            
            <!-- Result Split View -->
            <div class="split-view">
                <!-- Left Column -->
                <div class="left-col">
                    <!-- Image Card -->
                    <div class="image-card">
                        <span class="badge-enhanced">AI ENHANCED</span>
                        <!-- Display Uploaded Image Here -->
                        <img src="${state.data.uploadedImage || 'https://via.placeholder.com/400'}" alt="Uploaded Item" class="product-image">
                    </div>

                    <!-- Pricing Grid (Moved inside left col for desktop layout or kept separate based on new design preference, keeping standard here) -->
                    <div class="price-tier-card featured">
                        <span class="tier-icon dollar"><i class="fa-solid fa-dollar-sign"></i></span>
                        <div class="tier-label" style="color: var(--primary);">Optymalna Cena</div>
                        <div class="tier-price" style="font-size: 2.5rem;">125 <span style="font-size: 1rem">zł</span></div>
                        <div class="tier-sub" style="margin-bottom: 1rem;">Balans czas/zysk</div>
                        
                        <!-- Small grid for other prices -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                            <div>
                                <div class="tier-label">Szybka</div>
                                <div style="font-weight: 700;">99 zł</div>
                            </div>
                            <div>
                                <div class="tier-label">Max</div>
                                <div style="font-weight: 700;">149 zł</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column (Content) -->
                <div class="right-col">
                    <!-- Analysis Box -->
                    <div class="analysis-box">
                        <i class="fa-regular fa-lightbulb"></i>
                        AI: Bluza Nike Air w rozmiarze M i w bardzo dobrym stanie jest towarem poszukiwanym. Ceny zostały ustalone na podstawie rynkowych stawek dla używanych, ale markowych bluz crewneck z wyrazistym logo, mieszcząc się w przedziale 40-60% ceny nowego produktu.
                    </div>

                    <!-- Tabs Container -->
                    <div class="tabs-container">
                        <div class="tabs-header">
                            <button class="tab-btn ${state.data.platform === 'vinted' ? 'active' : ''}" onclick="switchPlatform('vinted')">Vinted</button>
                            <button class="tab-btn ${state.data.platform === 'olx' ? 'active' : ''}" onclick="switchPlatform('olx')">OLX</button>
                            <button class="tab-btn ${state.data.platform === 'allegro' ? 'active' : ''}" onclick="switchPlatform('allegro')">Allegro</button>
                        </div>
                        
                        <div class="tab-content">
                            <!-- Title Section -->
                            <div class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 700;">TYTUŁ OGŁOSZENIA</div>
                            <div class="copy-field">
                                <div class="copy-field-header" style="text-transform: none; display: flex; justify-content: space-between;">
                                     <span></span>
                                     <button class="copy-action"><i class="fa-regular fa-copy"></i> Kopiuj</button>
                                </div>
                                <div class="copy-field-content" style="font-weight: 700; font-size: 1.1rem;">
                                    ${resultData[state.data.platform].title}
                                </div>
                            </div>

                            <!-- Description Section -->
                            <div class="form-label" style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 700;">OPIS</div>
                            <div class="copy-field">
                                <div class="copy-field-header" style="text-transform: none; display: flex; justify-content: space-between;">
                                     <span></span>
                                     <button class="copy-action"><i class="fa-regular fa-copy"></i> Kopiuj</button>
                                </div>
                                <div class="copy-field-content" style="white-space: pre-line;">
                                    ${resultData[state.data.platform].desc}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Render Function
function render() {
    if (state.currentStep === 0) {
        appView.innerHTML = views.upload();
    } else if (state.currentStep === 1) {
        appView.innerHTML = views.details();
    } else if (state.currentStep === 3) {
        appView.innerHTML = views.result();
    } else {
        // Loading state
        appView.innerHTML = `
            <div style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                <div style="width: 60px; height: 60px; border: 4px solid #E5E7EB; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1.5rem;"></div>
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main);">Analizuję Twoje zdjęcie...</h2>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Rozpoznaję markę, model i stan przedmiotu</p>
            </div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;
    }
}

// Logic / Handlers
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Read the file logic
        const reader = new FileReader();
        reader.onload = function (e) {
            state.data.uploadedImage = e.target.result; // Store Data URL

            // Go to loading then details
            state.currentStep = 2; // Loading
            render();

            setTimeout(() => {
                state.currentStep = 1; // Details
                render();
            }, 1500);
        };
        reader.readAsDataURL(file);
    }
}

function selectOption(btn, field, value) {
    const siblings = btn.parentElement.querySelectorAll('.select-btn');
    siblings.forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    state.data[field] = value;
}

function handleDetailsSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generowanie...';
    btn.disabled = true;

    // Simulate generic delay
    setTimeout(() => {
        state.currentStep = 3; // Result
        render();
    }, 2000);
}

function switchPlatform(platform) {
    state.data.platform = platform;
    render();
}

// Initial Render
render();
