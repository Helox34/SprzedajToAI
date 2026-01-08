
const state = {
  step: 0,
  image: null,
  details: {},
  result: null,
  history: JSON.parse(localStorage.getItem('sprzedajto_history')) || []
};