const leadTable = document.getElementById("leadTable");
const leadSearch = document.getElementById("leadSearch");
const leadStatus = document.getElementById("leadStatus");
const leadForm = document.getElementById("leadForm");
const contractList = document.getElementById("contractList");
const taskList = document.getElementById("taskList");

const leads = [
  {
    name: "Noordzee Logistics",
    vehicle: "Volkswagen ID.4",
    duration: "48 maanden",
    status: "Nieuw",
    nextAction: "Belafspraak plannen",
  },
  {
    name: "Stadshaven Events",
    vehicle: "Mercedes eSprinter",
    duration: "60 maanden",
    status: "Demo",
    nextAction: "Demo evalueren",
  },
  {
    name: "GreenBuild BV",
    vehicle: "Toyota Proace EV",
    duration: "36 maanden",
    status: "Onderhandeling",
    nextAction: "Voorstel finetunen",
  },
  {
    name: "Horizon Hotels",
    vehicle: "BMW i4",
    duration: "48 maanden",
    status: "Contract klaar",
    nextAction: "Contract laten tekenen",
  },
];

const contracts = [
  {
    client: "Aurora Pharma",
    vehicle: "Polestar 2",
    start: "01-06-2024",
    end: "01-06-2028",
    monthly: "€ 1.240",
    status: "Actief",
  },
  {
    client: "CityCourier",
    vehicle: "Renault Kangoo E-Tech",
    start: "15-03-2023",
    end: "15-03-2027",
    monthly: "€ 780",
    status: "Actief",
  },
  {
    client: "Delta IT",
    vehicle: "Audi Q4 e-tron",
    start: "01-11-2022",
    end: "01-11-2026",
    monthly: "€ 1.090",
    status: "Herziening",
  },
];

const tasks = [
  {
    title: "Factuurherinnering naar Delta IT",
    owner: "Finance",
    deadline: "Vandaag 16:00",
  },
  {
    title: "Leveringsdatum bevestigen voor Horizon Hotels",
    owner: "Operations",
    deadline: "Morgen 09:00",
  },
  {
    title: "Nieuwe offerte voor GreenBuild BV",
    owner: "Sales",
    deadline: "Vandaag 14:00",
  },
];

const badgeClass = (status) => {
  switch (status) {
    case "Nieuw":
      return "nieuw";
    case "Demo":
      return "demo";
    case "Onderhandeling":
      return "onderhandeling";
    case "Contract klaar":
      return "klaar";
    default:
      return "nieuw";
  }
};

const renderLeads = () => {
  const query = leadSearch.value.toLowerCase();
  const statusFilter = leadStatus.value;
  leadTable.innerHTML = "";

  leads
    .filter((lead) => {
      const matchesQuery =
        lead.name.toLowerCase().includes(query) ||
        lead.vehicle.toLowerCase().includes(query);
      const matchesStatus = statusFilter ? lead.status === statusFilter : true;
      return matchesQuery && matchesStatus;
    })
    .forEach((lead) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.vehicle}</td>
        <td>${lead.duration}</td>
        <td><span class="badge ${badgeClass(lead.status)}">${lead.status}</span></td>
        <td>${lead.nextAction}</td>
      `;
      leadTable.appendChild(row);
    });
};

const renderContracts = () => {
  contractList.innerHTML = "";
  contracts.forEach((contract) => {
    const card = document.createElement("article");
    card.className = "contract";
    card.innerHTML = `
      <header>
        <strong>${contract.client}</strong>
        <span>${contract.status}</span>
      </header>
      <span>Voertuig: ${contract.vehicle}</span>
      <span>Looptijd: ${contract.start} → ${contract.end}</span>
      <span>Maandtermijn: ${contract.monthly}</span>
    `;
    contractList.appendChild(card);
  });
};

const renderTasks = () => {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task";
    item.innerHTML = `
      <strong>${task.title}<span>${task.deadline}</span></strong>
      <span>Team: ${task.owner}</span>
    `;
    taskList.appendChild(item);
  });
};

leadSearch.addEventListener("input", renderLeads);
leadStatus.addEventListener("change", renderLeads);

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("leadName").value.trim();
  const vehicle = document.getElementById("leadVehicle").value.trim();
  const start = document.getElementById("leadStart").value;
  const stage = document.getElementById("leadStage").value;

  if (!name || !vehicle || !start) {
    return;
  }

  leads.unshift({
    name,
    vehicle,
    duration: "Nog te bepalen",
    status: stage,
    nextAction: `Startdatum: ${start}`,
  });

  leadForm.reset();
  renderLeads();
});

renderLeads();
renderContracts();
renderTasks();
