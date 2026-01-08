// App State
const state = {
    currentStep: 0, // 0: Upload, 1: Details, 2: Loading, 3: Result, 4: History
    data: {
        category: null,
        audience: null,
        size: null,
        condition: "",
        material: "",
        platform: "vinted",
        uploadedImage: null
    },
    history: [] // Store generated items
};

// Form Configuration
const formConfig = {
    categories: [
        { id: 'shoes', label: 'Buty', icon: 'fa-shoe-prints' },
        { id: 'sweatshirt', label: 'Bluza', icon: 'fa-shirt' },
        { id: 'tshirt', label: 'Koszulka', icon: 'fa-shirt' },
        { id: 'pants', label: 'Spodnie', icon: 'fa-layer-group' },
        { id: 'jacket', label: 'Kurtka', icon: 'fa-vest' },
        { id: 'other', label: 'Inne', icon: 'fa-box-open' }
    ],
    audiences: [
        { id: 'women', label: 'Damskie' },
        { id: 'men', label: 'Męskie' },
        { id: 'kids', label: 'Dziecięce' },
        { id: 'unisex', label: 'Unisex' }
    ],
    conditions: [
        "Nowy z metką",
        "Nowy bez metki",
        "Bardzo dobry",
        "Dobry",
        "Zadowalający"
    ],
    sizes: {
        shoesAdult: ['36', '36.5', '37', '38', '38.5', '39', '40', '40.5', '41', '42', '42.5', '43', '44', '44.5', '45', '46', '47'],
        shoesKids: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'],
        clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
    }
};

// DOM Elements
const appView = document.getElementById('app-view');

// Mock Result Data generator
const getResultData = (platform) => {
    const base = {
        title: `Sprzedam ${state.data.category === 'shoes' ? 'Buty' : 'Przedmiot'} ${state.data.condition} ${state.data.size}`,
        desc: `Markowy przedmiot w stanie: ${state.data.condition}. Materiał: ${state.data.material}. Rozmiar: ${state.data.size}.`
    };

    // Map to specific static content for demo if matches logic, otherwise generic template
    if (state.data.category === 'sweatshirt' && state.data.audience === 'men') {
        const staticData = {
            vinted: { title: "Bluza NIKE AIR Crewneck Czarna M BDB", desc: "Świetna bluza Nike Air..." },
            olx: { title: "Bluza Nike M Czarna", desc: "Sprzedam bluzę..." },
            allegro: { title: "BLUZA NIKE MĘSKA M", desc: "Oryginalna bluza..." }
        };
        if (staticData[platform]) return staticData[platform];
    }

    return {
        title: [base.title, platform].join(" - "),
        desc: base.desc
    };
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

    details: () => {
        // Render Categories
        const renderCategories = () => `
            <div class="form-section">
                <label class="form-label">Co sprzedajesz? (Wybierz kategorię)</label>
                <div class="grid-flexible">
                    ${formConfig.categories.map(cat => `
                        <button type="button" 
                            class="select-btn category-btn ${state.data.category === cat.id ? 'selected' : ''}" 
                            onclick="setCategory('${cat.id}')">
                            <i class="fa-solid ${cat.icon}"></i> 
                            <span>${cat.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Render Audience (Horizontal)
        const renderAudience = () => {
            if (!state.data.category) return '';
            return `
                <div class="form-section fade-in" style="margin-top: 2rem;">
                    <label class="form-label">Dla kogo?</label>
                    <div class="grid-flexible">
                        ${formConfig.audiences.map(aud => `
                            <button type="button" 
                                class="select-btn ${state.data.audience === aud.id ? 'selected' : ''}" 
                                onclick="setAudience('${aud.id}')">
                                ${aud.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        };

        // Render Sizes
        const renderSizes = () => {
            if (!state.data.category || !state.data.audience) return '';

            let type = 'clothing';
            if (state.data.category === 'shoes') {
                type = state.data.audience === 'kids' ? 'shoesKids' : 'shoesAdult';
            }

            return `
                <div class="form-section fade-in" style="margin-top: 2rem;">
                    <label class="form-label">Rozmiar</label>
                    <div class="size-grid">
                        ${formConfig.sizes[type].map(s => `
                            <button type="button" 
                                class="size-option ${state.data.size === s ? 'selected' : ''}" 
                                onclick="setSize('${s}')">
                                ${s}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        };

        // Render Material
        const renderMaterial = () => {
            if (!state.data.category || !state.data.audience || !state.data.size) return '';
            return `
                <div class="form-section fade-in" style="margin-top: 2rem;">
                    <label class="form-label">Materiał</label>
                    <input type="text" class="form-input" 
                        placeholder="Np. Bawełna, Skóra, Poliester..." 
                        value="${state.data.material}"
                        onchange="setMaterial(this.value)"
                        style="width: 100%; padding: 1rem; border-radius: var(--radius-md);">
                </div>
             `;
        };

        // Render Condition (5 options, Horizontal)
        const renderCondition = () => {
            if (!state.data.material) return '';
            return `
                 <div class="form-section fade-in" style="margin-top: 2rem;">
                    <label class="form-label">Stan przedmiotu</label>
                    <div class="grid-flexible-small">
                         ${formConfig.conditions.map(c => `
                            <button type="button" class="select-btn ${state.data.condition === c ? 'selected' : ''}" onclick="setCondition('${c}')">
                                ${c}
                            </button>
                         `).join('')}
                    </div>
                </div>
            `;
        };

        const isReady = state.data.category && state.data.audience && state.data.size && state.data.material && state.data.condition;

        const renderSubmit = () => {
            if (!isReady) return '';
            return `
                <div class="form-section fade-in" style="margin-top: 2rem;">
                    <button type="button" class="btn-primary" style="width: 100%;" onclick="submitDetails()">
                        Generuj Ogłoszenie 
                        <i class="fa-solid fa-rocket" style="margin-left: 8px;"></i>
                    </button>
                </div>
            `;
        };

        return `
            <div class="card">
                <div style="margin-bottom: 2rem;">
                    <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main);">
                        <i class="fa-solid fa-list-check" style="color: var(--primary); margin-right: 0.5rem;"></i> Szczegóły
                    </h1>
                </div>

                <div id="dynamic-form">
                    ${renderCategories()}
                    ${renderAudience()}
                    ${renderSizes()}
                    ${renderMaterial()}
                    ${renderCondition()}
                    ${renderSubmit()}
                </div>
            </div>
        `;
    },

    result: () => {
        const rData = getResultData(state.data.platform);

        return `
        <div class="result-layout fade-in">
            <!-- Success Banner -->
            <div class="success-banner">
                <div class="success-icon"><i class="fa-solid fa-check"></i></div>
                <div>
                    <div style="font-weight: 700;">Ogłoszenie gotowe!</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Wygenerowaliśmy opis, tytuł i odświeżyliśmy zdjęcie. Jesteś gotowy do sprzedaży.</div>
                </div>
            </div>

            <div class="result-grid">
                <!-- Left Column: Visuals & Price -->
                <div class="result-col-left">
                    <!-- Image Card -->
                    <div class="image-card-hero">
                        <span class="badge-enhanced">AI ENHANCED</span>
                        <img src="${state.data.uploadedImage || 'https://via.placeholder.com/400'}" class="product-image-hero">
                    </div>

                    <!-- Hero Price Card (Blue) -->
                    <div class="price-card-hero">
                        <div class="price-header">
                            <i class="fa-solid fa-dollar-sign"></i> Sugerowana cena
                        </div>
                        <div class="price-amount">130 - 175 PLN</div>
                        <div class="price-desc">
                            Twoje ogłoszenie wyróżnia się na tle konkurencji. Cena zoptymalizowana dla szybkiej sprzedaży.
                        </div>
                    </div>
                </div>

                <!-- Right Column: Content & Tabs -->
                <div class="result-col-right">
                    <!-- Tabs -->
                    <div class="tabs-modern">
                         <button class="tab-modern ${state.data.platform === 'vinted' ? 'active' : ''}" onclick="switchPlatform('vinted')">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png" alt="Vinted" style="height: 20px; opacity: 0.8;">
                         </button>
                         <button class="tab-modern ${state.data.platform === 'olx' ? 'active' : ''}" onclick="switchPlatform('olx')">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/OLX_green_logo.svg/1200px-OLX_green_logo.svg.png" alt="OLX" style="height: 20px; opacity: 0.8;">
                         </button>
                         <button class="tab-modern ${state.data.platform === 'allegro' ? 'active' : ''}" onclick="switchPlatform('allegro')">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/Allegro_logo.svg" alt="Allegro" style="height: 24px; opacity: 0.8;">
                         </button>
                    </div>

                    <!-- Content Cards -->
                    <div class="content-card">
                        <div class="card-header">
                            <span class="label-small">TYTUŁ OGŁOSZENIA</span>
                            <button class="action-icon"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <div class="content-title">${rData.title}</div>
                    </div>

                    <div class="content-card">
                        <div class="card-header">
                            <span class="label-small">OPIS PRZEDMIOTU</span>
                            <button class="action-icon"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <div class="content-desc">${rData.desc}</div>
                    </div>
                    
                    <!-- Tags -->
                    <div class="tags-container">
                        <span class="tag-pill"><i class="fa-solid fa-tag"></i> ${state.data.category || 'Przedmiot'}</span>
                        <span class="tag-pill"><i class="fa-solid fa-ruler"></i> ${state.data.size || 'Rozmiar'}</span>
                        <span class="tag-pill"><i class="fa-solid fa-gem"></i> ${state.data.condition}</span>
                        ${state.data.material ? `<span class="tag-pill"><i class="fa-solid fa-layer-group"></i> ${state.data.material}</span>` : ''}
                    </div>

                    <button class="btn-outline-primary" style="margin-top: 1rem; width: 100%;" onclick="resetApp()">
                        <i class="fa-solid fa-rotate-left"></i> Dodaj kolejny przedmiot
                    </button>
                </div>
            </div>
        </div>
    `},

    history: () => {
        if (state.history.length === 0) {
            return `
                <div style="text-align: center; padding: 4rem;">
                    <i class="fa-regular fa-folder-open" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h2 style="color: var(--text-secondary);">Brak historii</h2>
                    <button class="btn-primary" style="margin-top: 1rem;" onclick="resetApp()">Dodaj pierwsze ogłoszenie</button>
                </div>
            `;
        }
        return `
            <div class="history-view">
                <h1 style="margin-bottom: 2rem; font-size: 1.5rem; font-weight: 700;">Historia Ogłoszeń</h1>
                <div class="grid-3">
                    ${state.history.map((item, index) => `
                        <div class="card" style="cursor: pointer; padding: 1rem; transition: transform 0.2s;" onclick="loadHistoryItem(${index})" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='none'">
                            <div style="height: 150px; overflow: hidden; border-radius: 8px; margin-bottom: 1rem;">
                                <img src="${item.uploadedImage}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div style="font-weight: 700; margin-bottom: 0.25rem;">${item.category === 'shoes' ? 'Buty' : 'Odzież'} ${item.size}</div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">${item.condition}</div>
                            <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">Przywróć ogłoszenie ></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// Render Logic
function render() {
    if (state.currentStep === 4) {
        appView.innerHTML = views.history();
    } else if (state.currentStep === 0) {
        appView.innerHTML = views.upload();
    } else if (state.currentStep === 1) {
        appView.innerHTML = views.details();
    } else if (state.currentStep === 3) {
        appView.innerHTML = views.result();
    } else {
        appView.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <div style="width: 50px; height: 50px; border: 4px solid #E5E7EB; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                <h2>Analizuję...</h2>
            </div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;
    }
}

// Actions
function triggerFileInput() { document.getElementById('fileInput').click(); }

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.data.uploadedImage = e.target.result;
            state.currentStep = 2; // Loading
            render();
            setTimeout(() => { state.currentStep = 1; render(); }, 1000);
        };
        reader.readAsDataURL(file);
    }
}

function setCategory(id) { state.data.category = id; state.data.audience = null; state.data.size = null; render(); }
function setAudience(id) { state.data.audience = id; state.data.size = null; render(); }
function setSize(s) { state.data.size = s; render(); }
function setMaterial(m) { state.data.material = m; render(); }
function setCondition(c) { state.data.condition = c; render(); }

function submitDetails() {
    state.history.unshift({ ...state.data, date: new Date() });
    const btn = appView.querySelector('.btn-primary');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spin fa-circle-notch"></i>';
    setTimeout(() => { state.currentStep = 3; render(); }, 1500);
}

function switchPlatform(p) { state.data.platform = p; render(); }

// Navigation Actions
function resetApp() {
    state.currentStep = 0;
    state.data = { category: null, audience: null, size: null, condition: "", material: "", platform: "vinted", uploadedImage: null };
    render();
}

function showHistory() {
    state.currentStep = 4;
    render();
}

function loadHistoryItem(index) {
    state.data = { ...state.history[index] };
    state.currentStep = 3;
    render();
}

render();
