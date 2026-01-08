// App State
const state = {
    currentStep: 2, // Starting at 2 (Details) for demo purposes, 0-indexed would mean index 2 is step 3
    data: {
        itemName: "Bluza Nike Air",
        size: "",
        condition: "",
        material: "",
        fit: ""
    }
};

// DOM Elements
const appView = document.getElementById('app-view');
const stepperCircles = document.querySelectorAll('.step-circle');
const stepperLabels = document.querySelectorAll('.step-label');

// Views Components
const views = {
    details: () => `
        <div class="card">
            <div class="card-header" style="margin-bottom: 2rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Opowiedz nam o przedmiocie</h1>
                <p style="color: var(--text-secondary); line-height: 1.5;">
                    Zidentyfikowaliśmy Twój przedmiot jako: <strong style="color: var(--primary);">Bluza Nike Air</strong>. 
                    Odpowiedz na kilka pytań, abyśmy mogli stworzyć perfekcyjne ogłoszenie.
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
                    <label class="form-label">W jakim stanie jest bluza? Czy posiada jakieś wady, np. plamy lub dziury?</label>
                    <div class="grid-2">
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Nowy')">Nowy</button>
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Bardzo dobry')">Bardzo dobry</button>
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Dobry')">Dobry</button>
                        <button type="button" class="select-btn" onclick="selectOption(this, 'condition', 'Używany')">Używany</button>
                    </div>
                </div>

                <!-- Material Input -->
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label class="form-label">Z jakiego materiału jest wykonana bluza (skład z metki)?</label>
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

                <button type="submit" class="btn-primary">
                    Generuj Ogłoszenie 
                    <i class="fa-solid fa-arrow-right" style="margin-left: 8px;"></i>
                </button>
            </form>
        </div>
    `,
    result: () => `
        <div class="result-layout">
            <!-- Success Banner -->
            <div class="success-banner">
                <div class="success-icon"><i class="fa-solid fa-check"></i></div>
                <div>
                    <h3 class="success-title">Ogłoszenie gotowe!</h3>
                    <p class="success-text">Wygenerowaliśmy opis, tytuł i odświeżyliśmy zdjęcie. Jesteś gotowy do sprzedaży.</p>
                </div>
            </div>

            <div class="split-view">
                <!-- Left Column -->
                <div class="left-col">
                    <!-- Image Card -->
                    <div class="image-card">
                        <span class="badge-enhanced">AI ENHANCED</span>
                        <!-- Using a placeholder image or the uploaded one -->
                        <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Bluza Nike" class="product-image">
                    </div>

                    <!-- Price Card -->
                    <div class="price-card">
                        <div class="price-header">
                            <i class="fa-solid fa-dollar-sign"></i> 
                            <span>SUGEROWANA CENA</span>
                        </div>
                        <div class="price-value">130 - 175 PLN</div>
                        <p class="price-desc">
                            Produkty linii Nike Air cieszą się wysoką popularnością na platformach takich jak Vinted czy OLX. 
                            Biorąc pod uwagę stan określony jako 'bardzo dobry' oraz brak wad, przedmiot może zostać wyceniony w górnym przedziale.
                        </p>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="right-col">
                    <!-- Title Card -->
                    <div class="copy-card">
                        <div class="copy-header">
                            <span>TYTUŁ OGŁOSZENIA</span>
                            <button class="copy-btn"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <div class="copy-content strong">
                            Czarna Bluza Nike Air Crewneck Rozmiar M - Stan Bardzo Dobry
                        </div>
                    </div>

                    <!-- Description Card -->
                    <div class="copy-card">
                        <div class="copy-header">
                            <span>OPIS PRZEDMIOTU</span>
                            <button class="copy-btn"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <div class="copy-content text-sm">
                            Szukasz idealnej bazy do swoich codziennych stylizacji? Ta czarna bluza Nike Air to połączenie wygody, trwałości i kultowego stylu streetwear. Wykonana z wysokiej jakości mieszanki bawełny i poliestru, zapewnia komfort cieplny oraz zachowuje swój fason nawet po wielu praniach. Najważniejsze cechy: Kultowa marka: Linia Nike Air to synonim miejskiego stylu. Stan: Bardzo dobry, bez żadnych plam, dziur czy zmechaceń. Uniwersalny kolor: Głęboka czerń pasująca do wszystkiego. Materiał: Optymalny skład (50% bawełna, 50% poliester) dla trwałości i wygody. Idealna dla osób ceniących jakość i sportowy look!
                        </div>
                    </div>

                    <!-- Tags -->
                    <div class="tags-container">
                        <span class="tag"><i class="fa-solid fa-tag"></i> nike</span>
                        <span class="tag"><i class="fa-solid fa-tag"></i> nikeair</span>
                        <span class="tag"><i class="fa-solid fa-tag"></i> bluza</span>
                        <span class="tag"><i class="fa-solid fa-tag"></i> streetwear</span>
                        <span class="tag"><i class="fa-solid fa-tag"></i> crewneck</span>
                        <span class="tag"><i class="fa-solid fa-tag"></i> czarnabluza</span>
                        <span class="tag"><i class="fa-solid fa-tag"></i> rozmiarM</span>
                        <span class="tag"><i class="fa-solid fa-tag"></i> sportstyle</span>
                    </div>

                    <!-- Restart Button -->
                    <button class="btn-restart" onclick="location.reload()">
                        <i class="fa-solid fa-rotate-right"></i> Dodaj kolejny przedmiot
                    </button>
                </div>
            </div>
        </div>
    `
};

// Render Function
function render() {
    // Render view based on state
    if (state.currentStep === 2) {
        appView.innerHTML = views.details();
    } else if (state.currentStep === 4) {
        appView.innerHTML = views.result();
    } else {
        // Fallback or Loading state
        appView.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 3rem; color: var(--primary);"></i>
                <p style="margin-top: 1rem; color: var(--text-secondary);">Przetwarzanie...</p>
            </div>
        `;
    }

    updateStepperUI();
}

function updateStepperUI() {
    // Update Stepper
    stepperCircles.forEach((circle, index) => {
        const stepParent = circle.parentElement;
        const line = stepParent.nextElementSibling; // The line after the step

        // Reset
        stepParent.classList.remove('active', 'completed');
        if (line && line.classList.contains('step-line')) {
            line.classList.remove('active');
        }

        // Apply classes
        if (index < state.currentStep) {
            stepParent.classList.add('active', 'completed');
            if (line && line.classList.contains('step-line')) {
                line.classList.add('active');
            }
        } else if (index === state.currentStep) {
            stepParent.classList.add('active');
        }
    });
}

// Helpers
function selectOption(btn, field, value) {
    // Visual selection
    const siblings = btn.parentElement.querySelectorAll('.select-btn');
    siblings.forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');

    // Update state
    state.data[field] = value;
}

function handleDetailsSubmit(e) {
    e.preventDefault();

    // Simulate API Call / Processing
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generowanie...';
    btn.disabled = true;

    // Transition to "Creating" step (Step 4, index 3)
    state.currentStep = 3;
    render();

    setTimeout(() => {
        // Transition to "Done" step (Step 5, index 4)
        state.currentStep = 4;
        render();
    }, 2500); // 2.5s simulated delay
}

// Initial Render
render();
