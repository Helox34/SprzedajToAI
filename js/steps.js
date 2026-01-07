function updateSteps() {
  document.querySelectorAll(".step").forEach((el, i) => {
    el.classList.toggle("active", i === state.step);
  });
}
