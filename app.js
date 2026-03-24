const carListEl = document.getElementById("carList");
const slotListEl = document.getElementById("slotList");
const selectedCarTextEl = document.getElementById("selectedCarText");
const bookingStatusEl = document.getElementById("bookingStatus");

const cars = [
  {
    id: "tesla-model-y",
    naam: "Tesla Model Y",
    type: "Elektrisch SUV",
    transmissie: "Automaat",
    slots: ["09:00", "10:30", "14:00", "16:30"],
  },
  {
    id: "volvo-xc40",
    naam: "Volvo XC40",
    type: "Hybride SUV",
    transmissie: "Automaat",
    slots: ["11:00", "13:30", "15:00"],
  },
  {
    id: "bmw-320i",
    naam: "BMW 320i",
    type: "Benzine Sedan",
    transmissie: "Automaat",
    slots: ["10:00", "12:30", "17:00"],
  },
  {
    id: "vw-id-buzz",
    naam: "Volkswagen ID. Buzz",
    type: "Elektrische MPV",
    transmissie: "Automaat",
    slots: ["09:30", "12:00", "15:30"],
  },
];

let geselecteerdeWagenId = null;

const getCarById = (id) => cars.find((car) => car.id === id);

const setBookingStatus = (tekst) => {
  bookingStatusEl.textContent = tekst;
};

const renderCars = () => {
  carListEl.innerHTML = "";

  cars.forEach((car) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "car-card";
    card.setAttribute("role", "listitem");

    if (car.id === geselecteerdeWagenId) {
      card.classList.add("active");
    }

    const title = document.createElement("h3");
    title.textContent = car.naam;

    const details = document.createElement("p");
    details.textContent = `${car.type} • ${car.transmissie}`;

    const availability = document.createElement("p");
    availability.className = "availability";
    availability.textContent = `${car.slots.length} beschikbare slots`;

    card.append(title, details, availability);
    card.addEventListener("click", () => {
      geselecteerdeWagenId = car.id;
      renderCars();
      renderSlots();
      setBookingStatus(`Wagen geselecteerd: ${car.naam}. Kies nu een tijdslot.`);
    });

    carListEl.append(card);
  });
};

const boekSlot = (carId, tijdslot) => {
  const car = getCarById(carId);

  if (!car) {
    setBookingStatus("Er ging iets mis: wagen niet gevonden.");
    return;
  }

  const slotIndex = car.slots.findIndex((slot) => slot === tijdslot);

  if (slotIndex === -1) {
    setBookingStatus("Dit tijdslot is net niet meer beschikbaar.");
    renderSlots();
    return;
  }

  car.slots.splice(slotIndex, 1);
  setBookingStatus(`✅ Testrit geboekt: ${car.naam} om ${tijdslot}.`);

  if (car.slots.length === 0) {
    geselecteerdeWagenId = null;
  }

  renderCars();
  renderSlots();
};

const renderSlots = () => {
  slotListEl.innerHTML = "";

  if (!geselecteerdeWagenId) {
    selectedCarTextEl.textContent = "Selecteer eerst een wagen.";
    return;
  }

  const car = getCarById(geselecteerdeWagenId);

  if (!car) {
    selectedCarTextEl.textContent = "Wagen niet gevonden.";
    return;
  }

  selectedCarTextEl.textContent = `Tijdsloten voor ${car.naam}:`;

  if (car.slots.length === 0) {
    selectedCarTextEl.textContent = `${car.naam} heeft geen vrije slots meer.`;
    return;
  }

  car.slots.forEach((tijdslot) => {
    const slotButton = document.createElement("button");
    slotButton.type = "button";
    slotButton.className = "slot-card";
    slotButton.setAttribute("role", "listitem");
    slotButton.textContent = `${tijdslot} boeken`;
    slotButton.addEventListener("click", () => boekSlot(car.id, tijdslot));

    slotListEl.append(slotButton);
  });
};

renderCars();
renderSlots();
