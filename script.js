// State
const state = {
    currentStep: 0,
    apiKey: localStorage.getItem('openrouter_key') || '',
    useProxy: true,
    data: {
        itemName: "",
        category: null,
        audience: null,
        size: null,
        condition: "",
        material: "",
        brand: "",
        color: "",
        platform: "vinted",
        uploadedImage: null,
        originalImage: null
    },
    // Load history from local storage
    history: JSON.parse(localStorage.getItem('sprzedajto_history') || '[]'),
    analysisStatus: ""
};

// Configuration
const formConfig = {
    categories: [
        { id: 'shoes', label: 'Buty', icon: 'fa-shoe-prints' },
        { id: 'shirt', label: 'Koszule', icon: 'fa-shirt' },
        { id: 'sweatshirt', label: 'Bluza', icon: 'fa-layer-group' },
        { id: 'tshirt', label: 'Koszulka', icon: 'fa-shirt' },
        { id: 'pants', label: 'Spodnie', icon: 'fa-layer-group' },
        { id: 'jacket', label: 'Kurtka', icon: 'fa-vest' },
        { id: 'accessories', label: 'Akcesoria', icon: 'fa-hat-cowboy' },
        { id: 'other', label: 'Inne', icon: 'fa-box-open' }
    ],
    audiences: [
        { id: 'women', label: 'Damskie' },
        { id: 'men', label: 'Męskie' },
        { id: 'kids', label: 'Dziecięce' },
        { id: 'unisex', label: 'Unisex' }
    ],
    sizes: {
        shoesWomen: ['32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42'],
        shoesAdult: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
        shoesKids: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'],
        clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    conditions: ["Nowy z metką", "Nowy bez metki", "Bardzo dobry", "Dobry", "Zadowalający"]
};

// --- DOM Elements ---
const appView = document.getElementById('app-view');

// Helper to save history
function saveHistory() {
    localStorage.setItem('sprzedajto_history', JSON.stringify(state.history));
}

// --- AI SERVICE ---
async function callOpenRouter(messages, model = 'google/gemini-2.0-flash-exp:free') {
    // 1. Try Proxy
    if (state.useProxy) {
        try {
            const resp = await fetch('proxy.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, model })
            });
            if (resp.ok) return await resp.json();
        } catch (e) {
            console.warn("Proxy unavailable.");
        }
    }

    // 2. Fallback to Direct Key
    if (!state.apiKey) throw new Error("Missing API Key");

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${state.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'SprzedajTo AI Client'
        },
        body: JSON.stringify({ messages, model })
    });

    if (!resp.ok) throw new Error("AI Request Failed");
    return await resp.json();
}

// Background Removal Only
async function processImage(base64Image) {
    state.analysisStatus = "Usuwanie tła...";
    render();

    try {
        if (typeof imglyRemoveBackground !== 'undefined') {
            const remover = window.imglyRemoveBackground || window.removeBackground;

            if (remover) {
                const blob = await remover(base64Image, {
                    publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.0/dist/"
                });
                state.data.uploadedImage = URL.createObjectURL(blob);
            } else {
                console.warn("Library not found");
                state.data.uploadedImage = base64Image;
            }
        } else {
            state.data.uploadedImage = base64Image;
        }
    } catch (e) {
        console.error("BG Removal failed", e);
        state.data.uploadedImage = base64Image;
    } finally {
        state.isAnalyzing = false;
        state.currentStep = 1; // Go to Details
        render();
    }
}

async function generateDescription() {
    const { category, audience, condition, material, size, platform } = state.data;
    const categoryLabel = formConfig.categories.find(c => c.id === category)?.label || category;
    const audienceLabel = formConfig.audiences.find(a => a.id === audience)?.label || audience;

    const prompt = `
    Jesteś ekspertem e-commerce. Przeanalizuj zdjęcie i dane, a następnie stwórz ogłoszenie.
    
    DANE OD UŻYTKOWNIKA:
    - Kategoria: ${categoryLabel}
    - Odbiorca: ${audienceLabel}
    - Stan: ${condition}
    - Materiał: ${material}
    - Rozmiar: ${size}
    - Platforma: ${platform}

    ZADANIE:
    1. Oszacuj realną cenę rynkową (price_range) w PLN dla takiego przedmiotu używanego (np. "40-60 PLN").
    2. Wymyśl chwytliwy tytuł (title).
    3. Napisz zachęcający opis (description).

    FORMAT ODPOWIEDZI (Tylko czysty JSON):
    {
        "title": "...",
        "description": "...",
        "price_range": "..."
    }
    `;

    try {
        const response = await callOpenRouter([
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: state.data.originalImage } }
                ]
            }
        ]);

        // Handle API Errors
        if (response.error) {
            console.error("OpenRouter API Error:", response.error);
            throw new Error(response.error.message || "Unknown API Error");
        }

        if (!response.choices || !response.choices.length) {
            console.error("Invalid Response Structure:", response);
            throw new Error("Otrzymano pustą odpowiedź od AI.");
        }

        let content = response.choices[0].message.content;

        // Robust JSON extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }

        return JSON.parse(content);
    } catch (e) {
        console.error("AI Generation Error:", e);
        return {
            title: `Sprzedam ${categoryLabel} - ${condition}`,
            description: "Nie udało się wygenerować opisu automatycznie. Spróbuj ponownie lub uzupełnij ręcznie. (Błąd: " + e.message + ")",
            price_range: "Do negocjacji"
        };
    }
}

// --- VIEWS ---

const views = {
    upload: () => `
        <div class="upload-container fade-in">
            <h1 class="hero-title">Sprzedaj to szybciej z <span class="highlight">AI</span></h1>
            <p class="hero-subtitle">Wgraj zdjęcie, wybierz parametry, a AI napisze opis.</p>
            
            <div class="upload-box" onclick="triggerFileInput()">
                <div class="upload-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <h3>Dodaj zdjęcie przedmiotu</h3>
                <p>Lub upuść plik tutaj</p>
                <button class="btn-primary">Wybierz z galerii</button>
            </div>
            
            <input type="file" id="fileInput" hidden accept="image/*" onchange="handleFileSelect(event)">
        </div>
    `,

    analysis: () => `
        <div class="ai-loader fade-in">
            <div class="image-scan-container">
                <img src="${state.data.originalImage}" style="width:100%; height:100%; object-fit:cover;">
                <div class="scan-line"></div>
            </div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Przetwarzanie zdjęcia...</h2>
            <p style="color: var(--text-secondary);">Usuwamy tło i przygotowujemy edytor.</p>
        </div>
    `,

    details: () => {
        // Helper to get sizes based on selection
        const getSizes = () => {
            if (!state.data.category || !state.data.audience) return [];
            if (state.data.category === 'other') return [];

            if (state.data.category === 'shoes') {
                if (state.data.audience === 'kids') return formConfig.sizes.shoesKids;
                if (state.data.audience === 'women') return formConfig.sizes.shoesWomen;
                return formConfig.sizes.shoesAdult;
            }
            return formConfig.sizes.clothing;
        };

        const availableSizes = getSizes();
        const isOther = state.data.category === 'other';

        // Render Functions
        const renderCategories = () => `
            <div class="form-section fade-in">
                <label class="form-label">Kategoria</label>
                <div class="grid-4">
                    ${formConfig.categories.map(cat => `
                        <button type="button" 
                            class="select-btn ${state.data.category === cat.id ? 'selected' : ''}" 
                            onclick="setCategory('${cat.id}')">
                            <i class="fa-solid ${cat.icon}" style="margin-bottom: 8px; font-size: 1.2rem;"></i>
                            ${cat.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        const renderAudience = () => {
            if (!state.data.category) return '';
            return `
                <div class="form-section fade-in">
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

        const renderSizes = () => {
            if (!state.data.audience) return '';
            if (isOther) return '';

            return `
                <div class="form-section fade-in">
                    <label class="form-label">Rozmiar</label>
                    <div class="size-grid">
                        ${availableSizes.map(s => `
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

        const renderMaterial = () => {
            if (!state.data.size && !isOther) return '';
            if (isOther) return '';

            return `
                <div class="form-section fade-in">
                    <label class="form-label">Materiał</label>
                    <div class="input-wa-button">
                        <input type="text" id="materialInput" class="form-input" 
                            placeholder="Np. Bawełna, Skóra..." 
                            value="${state.data.material}"
                            onchange="setMaterial(this.value)"
                            style="border-radius: var(--radius-md);">
                        <button class="btn-input-confirm" onclick="setMaterial(document.getElementById('materialInput').value)">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    </div>
                </div>
             `;
        };

        const renderCondition = () => {
            const showCondition = state.data.material || isOther;
            if (!showCondition) return '';

            return `
                 <div class="form-section fade-in">
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

        const isReady = state.data.category && state.data.audience && state.data.condition &&
            (isOther || (state.data.size && state.data.material));

        const renderSubmit = () => {
            if (!isReady) return '';
            return `
                <div class="form-section fade-in" style="margin-top: 2rem;">
                    <button type="button" class="btn-primary" style="width: 100%;" onclick="submitDetails()">
                        Generuj Ogłoszenie 
                        <i class="fa-solid fa-rocket" style="margin-left: 8px;"></i>
                    </button>
                    <p style="text-align: center; margin-top: 1rem; color: #666; font-size: 0.9rem;">
                        Teraz AI przeanalizuje Twoje wybory i zdjęcie, aby stworzyć idealny opis.
                    </p>
                </div>
            `;
        };

        return `
            <div class="card">
                <div style="margin-bottom: 2rem;">
                    <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main);">
                        <i class="fa-solid fa-list" style="color: var(--primary); margin-right: 0.5rem;"></i>
                        Uzupełnij szczegóły
                    </h1>
                     <p style="color: var(--text-secondary); font-size: 0.9rem;">Wybierz parametry, a my zajmiemy się opisem.</p>
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

    result: async () => {
        // Async Wrapper for Result to handle AI generation
        if (!state.generatedData) {
            state.generatedData = await generateDescription();
        }

        const rData = state.generatedData;
        const uploadImg = state.data.uploadedImage || 'https://via.placeholder.com/400';

        return `
        <div class="result-layout fade-in">
            <!-- Success Banner -->
            <div class="success-banner">
                <div class="success-icon"><i class="fa-solid fa-check"></i></div>
                <div>
                    <div style="font-weight: 700;">Ogłoszenie gotowe!</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Wygenerowaliśmy opis, tytuł i odświeżyliśmy zdjęcie.</div>
                </div>
            </div>

            <div class="result-grid">
                <!-- Left Column -->
                <div class="result-col-left">
                    <div class="image-card-hero">
                        <img src="${uploadImg}" class="product-image-hero">
                    </div>

                    <div class="price-card-hero">
                        <div class="price-header"><i class="fa-solid fa-dollar-sign"></i> Sugerowana cena</div>
                        <div class="price-amount">${rData.price_range || 'Do wyceny'}</div>
                        <div class="price-desc">Cena zoptymalizowana przez AI dla szybkiej sprzedaży na ${state.data.platform}.</div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="result-col-right">
                    <div class="tabs-modern">
                         <button class="tab-modern ${state.data.platform === 'vinted' ? 'active' : ''}" onclick="switchPlatform('vinted')">Vinted</button>
                         <button class="tab-modern ${state.data.platform === 'olx' ? 'active' : ''}" onclick="switchPlatform('olx')">OLX</button>
                         <button class="tab-modern ${state.data.platform === 'allegro' ? 'active' : ''}" onclick="switchPlatform('allegro')">Allegro</button>
                    </div>

                    <div class="content-card">
                        <div class="card-header">
                            <span class="label-small">TYTUŁ</span>
                            <button class="action-icon" onclick="copyToClipboard('${rData.title.replace(/'/g, "\\'")}')"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <div class="content-title">${rData.title}</div>
                    </div>

                    <div class="content-card">
                        <div class="card-header">
                            <span class="label-small">OPIS</span>
                            <button class="action-icon" onclick="copyToClipboard('${rData.description.replace(/'/g, "\\'")}')"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <div class="content-desc">${rData.description}</div>
                    </div>
                    
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
        `;
    },

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
            <div class="history-view fade-in">
                <h1 style="margin-bottom: 2rem; font-size: 1.5rem; font-weight: 700;">Historia Ogłoszeń</h1>
                <div class="grid-3">
                    ${state.history.map((item, index) => `
                        <div class="card" style="cursor: pointer; padding: 1rem;" onclick="loadHistoryItem(${index})">
                            <div style="height: 150px; overflow: hidden; border-radius: 8px; margin-bottom: 0.5rem;">
                                <img src="${item.uploadedImage || 'https://via.placeholder.com/150'}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div style="font-weight: 700;">${item.categoryLabel || 'Przedmiot'}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(item.date).toLocaleDateString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// --- RENDERER ---
async function render() {
    if (state.isAnalyzing) {
        appView.innerHTML = views.analysis();
        return;
    }

    if (state.currentStep === 4) {
        appView.innerHTML = views.history();
    } else if (state.currentStep === 0) {
        appView.innerHTML = views.upload();
    } else if (state.currentStep === 1) {
        appView.innerHTML = views.details();
    } else if (state.currentStep === 3) {
        // Result is Async due to generation
        appView.innerHTML = '<div class="ai-loader"><h2>Generowanie opisu...</h2></div>';
        try {
            const html = await views.result();
            appView.innerHTML = html;
        } catch (e) {
            console.error("Render failed", e);
            appView.innerHTML = "Wystąpił błąd generowania.";
        }
    }
}

// --- ACTIONS ---
function triggerFileInput() { document.getElementById('fileInput').click(); }

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.data.originalImage = e.target.result;
            state.isAnalyzing = true;
            processImage(state.data.originalImage);
        };
        reader.readAsDataURL(file);
    }
}

function setCategory(id) { state.data.category = id; render(); }
function setAudience(id) { state.data.audience = id; render(); }
function setSize(s) { state.data.size = s; render(); }
function setMaterial(m) { state.data.material = m; }
function setCondition(c) { state.data.condition = c; render(); }

function submitDetails() {
    state.generatedData = null; // Force regenerate
    // Save to history immediately
    const categoryLabel = formConfig.categories.find(c => c.id === state.data.category)?.label;
    state.history.unshift({ ...state.data, categoryLabel, date: new Date() });
    saveHistory(); // Auto-save
    state.currentStep = 3;
    render();
}

function switchPlatform(p) {
    state.data.platform = p;
    state.generatedData = null; // Regenerate for platform
    render();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Skopiowano do schowka!");
    });
}

function resetApp() {
    state.currentStep = 0;
    state.data = { category: null, audience: null, size: null, condition: "", material: "", platform: "vinted", uploadedImage: null, originalImage: null };
    render();
}

function showHistory() { state.currentStep = 4; render(); }
function loadHistoryItem(index) {
    state.data = { ...state.history[index] };
    state.generatedData = null;
    state.currentStep = 3;
    render();
}

// Settings Modal Logic
function openSettings() {
    if (!document.getElementById('settings-modal')) {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Ustawienia</h2>
                <p style="margin-bottom: 1rem; color: #666;">Wprowadź klucz jeśli nie używasz Proxy.</p>
                <div class="form-section">
                    <label class="form-label">OpenRouter API Key</label>
                    <input type="password" id="api-key-input" class="form-input" style="width: 100%; padding: 0.5rem;" value="${state.apiKey}">
                </div>
                <button class="btn-primary" onclick="saveSettings()">Zapisz</button>
                <button class="btn-outline-primary" style="margin-top: 0.5rem;" onclick="closeSettings()">Anuluj</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    setTimeout(() => document.getElementById('settings-modal').classList.add('active'), 10);
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function saveSettings() {
    const key = document.getElementById('api-key-input').value;
    state.apiKey = key;
    localStorage.setItem('openrouter_key', key);
    closeSettings();
}

// Attach Settings to Gear Icon
document.addEventListener('DOMContentLoaded', () => {
    const gearBtn = document.querySelector('.fa-gear').parentElement;
    gearBtn.onclick = openSettings;
    render();
});
