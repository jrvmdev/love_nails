const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((element) => observer.observe(element));

const bookingForm = document.querySelector("[data-booking-form]");
if (bookingForm) {
  const floatLink = document.querySelector("[data-wa-float]");
  const dateInput = bookingForm.querySelector('input[name="date"]');
  const servicePicker = bookingForm.querySelector("[data-service-picker]");
  const selectedServicesWrap = bookingForm.querySelector("[data-selected-services]");
  const selectedServices = [];
  const waProxy = "/api/whatsapp";

  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    dateInput.value = today;
    dateInput.addEventListener("focus", () => {
      if (typeof dateInput.showPicker === "function") {
        dateInput.showPicker();
      }
    });
  }

  const directText = "Hola! Quiero información de servicios y disponibilidad de turnos en Love Nails.";
  if (floatLink) {
    floatLink.href = `${waProxy}?m=${encodeURIComponent(directText)}`;
  }

  const renderSelectedServices = () => {
    if (!selectedServicesWrap) return;
    selectedServicesWrap.innerHTML = "";
    selectedServices.forEach((service, idx) => {
      const chip = document.createElement("span");
      chip.className = "service-chip";
      chip.textContent = service;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", `Quitar ${service}`);
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        selectedServices.splice(idx, 1);
        renderSelectedServices();
      });
      chip.appendChild(removeBtn);
      selectedServicesWrap.appendChild(chip);
    });
  };

  servicePicker?.addEventListener("change", () => {
    const value = servicePicker.value?.trim();
    if (!value) return;
    if (selectedServices.includes(value)) {
      alert("Ese servicio ya fue agregado.");
    } else if (selectedServices.length >= 3) {
      alert("Puedes seleccionar hasta 3 servicios.");
    } else {
      selectedServices.push(value);
      renderSelectedServices();
    }
    servicePicker.selectedIndex = 0;
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const date = formData.get("date")?.toString().trim();
    const shift = formData.get("shift")?.toString().trim();
    const note = formData.get("note")?.toString().trim();

    if (selectedServices.length < 1 || selectedServices.length > 3) {
      alert("Selecciona entre 1 y 3 servicios.");
      return;
    }

    if (!date || !shift) return;

    const minDate = dateInput?.min;
    if (minDate && date < minDate) {
      alert("Solo puedes seleccionar fecha desde hoy en adelante.");
      return;
    }

    const lines = [
      "Hola! Quiero solicitar turno en Love Nails.",
      `Servicios: ${selectedServices.join(", ")}.`,
      `Fecha solicitada: ${date}.`,
      `Franja horaria preferida: ${shift}.`,
      "Quedo a la espera de confirmacion con los horarios disponibles."
    ];

    if (note) lines.push(`Comentario: ${note}.`);

    const message = lines.filter(Boolean).join("\n");
    const url = `${waProxy}?m=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

const slider = document.querySelector("[data-slider]");
if (slider) {
  const viewport = slider.querySelector(".designs-viewport");
  const track = slider.querySelector(".designs-track");
  const cards = Array.from(slider.querySelectorAll(".design-card"));
  const prevBtn = slider.querySelector(".slider-btn-prev");
  const nextBtn = slider.querySelector(".slider-btn-next");
  const dotsWrap = slider.querySelector(".slider-dots");

  let page = 0;
  let totalPages = 1;
  let autoTimer;

  const getPerPage = () => {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  };

  const updateDots = () => {
    const dots = Array.from(dotsWrap.querySelectorAll("button"));
    dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === page));
  };

  const goToPage = (target) => {
    page = (target + totalPages) % totalPages;
    const gap = parseFloat(window.getComputedStyle(track).gap || "0");
    const maxOffset = Math.max(track.scrollWidth - viewport.clientWidth, 0);
    // Each page boundary also includes one inter-page gap in this flex track.
    const preferred = page * (viewport.clientWidth + gap);
    const offset = Math.min(preferred, maxOffset);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  };

  const buildDots = () => {
    const perPage = getPerPage();
    totalPages = Math.max(Math.ceil(cards.length / perPage), 1);
    dotsWrap.innerHTML = "";
    for (let i = 0; i < totalPages; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Ver grupo ${i + 1}`);
      dot.addEventListener("click", () => goToPage(i));
      dotsWrap.appendChild(dot);
    }
    if (page >= totalPages) page = 0;
    goToPage(page);
  };

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goToPage(page + 1), 4200);
  };

  prevBtn?.addEventListener("click", () => {
    goToPage(page - 1);
    startAuto();
  });

  nextBtn?.addEventListener("click", () => {
    goToPage(page + 1);
    startAuto();
  });

  window.addEventListener("resize", buildDots);
  slider.addEventListener("mouseenter", () => clearInterval(autoTimer));
  slider.addEventListener("mouseleave", startAuto);

  buildDots();
  startAuto();
}
