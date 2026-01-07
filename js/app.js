const view = document.getElementById("view");

function next() {
  state.step++;
  if (state.step === 4) {
    generateAI().then(r => {
      state.result = r;
      render();
    });
  } else {
    render();
  }
}

function select(key, value) {
  state.details[key] = value;
  document.querySelectorAll(".option").forEach(o => {
    if (o.textContent === value) o.classList.add("active");
  });
}

render();
