const state = {
  step: 0,
  image: null,
  details: {},
  result: null,
  // Wczytujemy historię z pamięci przeglądarki
  history: JSON.parse(localStorage.getItem('sprzedajto_history')) || []
};