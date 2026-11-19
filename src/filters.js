(function () {
  const form = document.querySelector("[data-filters]");
  if (!form) return;
  const cards = Array.from(document.querySelectorAll("[data-operator]"));
  const count = document.querySelector("[data-count]");
  const empty = document.querySelector("[data-empty]");

  function show(card, on) {
    card.hidden = !on;
  }

  function apply() {
    const state = form.elements.state.value;
    const type = form.elements.type.value;
    const drive = form.elements.drive.value;
    const price = form.elements.price.value;
    const kid = form.elements.kid.checked;
    let visible = 0;
    cards.forEach((card) => {
      const types = (card.dataset.types || "").split(" ");
      const driveVal = card.dataset.drive || "";
      const min = card.dataset.priceMin;
      const basis = card.dataset.priceBasis || "";
      let ok = true;
      if (state && card.dataset.state !== state) ok = false;
      if (type && !types.includes(type)) ok = false;
      if (drive === "yes" && driveVal !== "true") ok = false;
      if (drive === "no" && driveVal !== "false") ok = false;
      if (drive === "unstated" && driveVal !== "") ok = false;
      if (kid && card.dataset.kid !== "true") ok = false;
      if (price) {
        const perPerson = basis === "per-person" || basis === "mixed";
        const n = min === "" ? null : Number(min);
        if (price === "unpublished") {
          if (perPerson && n !== null) ok = false;
        } else if (!perPerson || n === null) {
          ok = false;
        } else if (price === "under-100" && !(n < 100)) ok = false;
        else if (price === "100-199" && !(n >= 100 && n <= 199)) ok = false;
        else if (price === "200-349" && !(n >= 200 && n <= 349)) ok = false;
        else if (price === "350-up" && !(n >= 350)) ok = false;
      }
      show(card, ok);
      if (ok) visible += 1;
    });
    if (count) count.textContent = "Showing " + visible + " of " + cards.length + " operators";
    if (empty) empty.hidden = visible !== 0;
  }

  form.addEventListener("input", apply);
  form.addEventListener("reset", () => setTimeout(apply, 0));
  apply();
})();
