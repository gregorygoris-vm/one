const startHourInput = document.getElementById("startHour");
const endHourInput = document.getElementById("endHour");
const generateTimeBtn = document.getElementById("generateTimeBtn");
const pairUsersBtn = document.getElementById("pairUsersBtn");
const statusText = document.getElementById("statusText");

const promptDateEl = document.getElementById("promptDate");
const promptTimeEl = document.getElementById("promptTime");
const promptWindowEl = document.getElementById("promptWindow");
const userAEl = document.getElementById("userA");
const userBEl = document.getElementById("userB");

const users = [
  { name: "Mia", city: "Amsterdam", streak: 11 },
  { name: "Noah", city: "Rotterdam", streak: 5 },
  { name: "Luca", city: "Utrecht", streak: 17 },
  { name: "Sara", city: "Eindhoven", streak: 8 },
  { name: "Yara", city: "Haarlem", streak: 22 },
  { name: "Daan", city: "Groningen", streak: 3 },
  { name: "Iris", city: "Maastricht", streak: 14 },
  { name: "Finn", city: "Leiden", streak: 9 },
];

const formatHour = (hour) => String(hour).padStart(2, "0");

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const setStatus = (text) => {
  statusText.textContent = text;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createRandomPromptTime = () => {
  const startHour = Number(startHourInput.value);
  const endHour = Number(endHourInput.value);

  if (Number.isNaN(startHour) || Number.isNaN(endHour)) {
    throw new Error("Start and end hour must be valid numbers.");
  }

  if (startHour < 5 || endHour > 23) {
    throw new Error("Choose a daytime range between 05 and 23.");
  }

  if (startHour >= endHour) {
    throw new Error("Start hour must be earlier than end hour.");
  }

  const chosenHour = randomInt(startHour, endHour - 1);
  const chosenMinute = randomInt(0, 59);

  const now = new Date();
  now.setHours(chosenHour, chosenMinute, 0, 0);

  promptDateEl.textContent = formatDate(now);
  promptTimeEl.textContent = formatTime(now);
  promptWindowEl.textContent = `${formatHour(startHour)}:00 – ${formatHour(endHour)}:00`;

  setStatus("Prompt scheduled. User gets one random selfie request today.");
};

const renderUserCard = (container, user) => {
  container.innerHTML = "";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = user.name.slice(0, 2).toUpperCase();

  const name = document.createElement("h3");
  name.textContent = user.name;

  const details = document.createElement("p");
  details.textContent = `${user.city} • ${user.streak}-day streak`;

  const sharing = document.createElement("p");
  sharing.textContent = "Can see each other’s selfie once both upload.";

  container.append(avatar, name, details, sharing);
};

const pairRandomUsers = () => {
  const firstIndex = randomInt(0, users.length - 1);
  let secondIndex = randomInt(0, users.length - 1);

  while (firstIndex === secondIndex) {
    secondIndex = randomInt(0, users.length - 1);
  }

  const first = users[firstIndex];
  const second = users[secondIndex];

  renderUserCard(userAEl, first);
  renderUserCard(userBEl, second);
  setStatus(`Paired ${first.name} with ${second.name} for today's selfie swap.`);
};

generateTimeBtn.addEventListener("click", () => {
  try {
    createRandomPromptTime();
  } catch (error) {
    setStatus(error.message);
  }
});

pairUsersBtn.addEventListener("click", pairRandomUsers);

createRandomPromptTime();
pairRandomUsers();
