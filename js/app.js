const view = document.getElementById("view");

function next() {
  state.step++;
  render();

  // Jeśli weszliśmy w krok "Tworzenie", uruchom AI
  if (state.step === 3) {
    generateAI(state.image, state.details)
      .then(result => {
        state.result = result;
        addToHistory(result); // Zapisz w historii
        state.step++;
        render(); // Przejdź do wyniku
      })
      .catch(err => {
        console.error(err);
        alert("Błąd AI: " + err.message);
        state.step = 2; // Wróć do szczegółów
        render();
      });
  }
}

function select(key, value) {
  state.details[key] = value;
  render();
}

function handleImageUpload(input) {
  if (input.files && input.files[0]) {
    state.image = input.files[0];
    next();
  }
}

// --- HISTORIA ---
function addToHistory(result) {
  const item = { id: Date.now(), ...result };
  state.history.unshift(item);
  localStorage.setItem('sprzedajto_history', JSON.stringify(state.history));
}

function showHistory() {
  state.step = 'history';
  render();
}

function loadHistoryItem(id) {
  const item = state.history.find(i => i.id === id);
  if (item) {
    state.result = item;
    state.step = 4;
    render();
  }
}

function deleteHistoryItem(id, event) {
  event.stopPropagation();
  state.history = state.history.filter(i => i.id !== id);
  localStorage.setItem('sprzedajto_history', JSON.stringify(state.history));
  render();
}

// --- KOPIOWANIE ---
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Możesz tu dodać console.log("Skopiowano")
  });
}

// Start
render();