// booking.js — pick or change a service, remember it across pages, take a booking request
import flatpickr from "https://cdn.jsdelivr.net/npm/flatpickr/+esm";
import { fetchServices } from "./fetchServices.js";
import { escapeHtml } from "./escapeHtml.js";
import "./script.js";

const params = new URLSearchParams(window.location.search);

const serviceSelect = document.getElementById("svc");
const lengthSelect = document.getElementById("len");
const priceInput = document.getElementById("prc");
const summary = document.getElementById("booking-summary");
const form = document.getElementById("booking-form");
const feedback = document.getElementById("booking-feedback");
const appointmentsList = document.getElementById("appointments-list");

let services = [];

async function init() {
  try {
    services = await fetchServices();

    services.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = s.name;
      serviceSelect.appendChild(opt);
    });

    const draft = loadDraft();
    serviceSelect.value = params.get("service") || draft?.service || "";
    lengthSelect.value = params.get("length") || draft?.length || "";
    if (draft) {
      document.getElementById("cust-name").value = draft.name || "";
      document.getElementById("cust-email").value = draft.email || "";
    }

    updateSummary();
    saveDraft();
  } catch (err) {
    console.error("Failed to load services:", err);
    if (serviceSelect) {
      serviceSelect.innerHTML =
        '<option value="">Services unavailable — refresh the page</option>';
    }
    if (summary) {
      summary.textContent =
        "Sorry — we couldn't load services. Please refresh and try again.";
    }
  }
}

function updateSummary() {
  const s = services.find((s) => s.name === serviceSelect.value);
  const price = s ? s.price[lengthSelect.value] || 0 : 0;
  priceInput.value = price || "";

  if (serviceSelect.value && lengthSelect.value) {
    summary.textContent = `You're booking: ${serviceSelect.value} — ${lengthSelect.value} hair — $${price}`;
  } else {
    summary.textContent = "Choose a service and hair length to see the price.";
  }
}

function saveDraft() {
  localStorage.setItem(
    "bookingDraft",
    JSON.stringify({
      service: serviceSelect.value,
      length: lengthSelect.value,
      name: document.getElementById("cust-name").value,
      email: document.getElementById("cust-email").value,
    })
  );
}

function loadDraft() {
  return JSON.parse(localStorage.getItem("bookingDraft") || "null");
}

function loadAppointments() {
  return JSON.parse(localStorage.getItem("appointments") || "[]");
}

function saveAppointments(list) {
  localStorage.setItem("appointments", JSON.stringify(list));
}

function renderAppointments() {
  const upcoming = loadAppointments().filter(
    (a) => new Date(a.datetime.replace(" ", "T")) > new Date()
  );
  saveAppointments(upcoming);

  if (upcoming.length === 0) {
    appointmentsList.innerHTML = "<p>No upcoming appointments.</p>";
    return;
  }

  upcoming.sort((a, b) => a.datetime.localeCompare(b.datetime));

  appointmentsList.innerHTML = upcoming
    .map(
      (a) => `
    <p>
      <strong>${escapeHtml(a.service)}</strong> — ${escapeHtml(a.length)} hair — $${escapeHtml(a.price)}<br>
      ${escapeHtml(a.datetime)}<br>
      ${a.name ? `<span class="appt-contact">${escapeHtml(a.name)}${a.email ? ` · ${escapeHtml(a.email)}` : ""}</span><br>` : ""}
      <button class="btn remove-appt" data-id="${a.id}" type="button">Remove</button>
    </p>
  `
    )
    .join("");
}

appointmentsList.addEventListener("click", (e) => {
  if (!e.target.classList.contains("remove-appt")) return;
  const id = Number(e.target.dataset.id);
  saveAppointments(loadAppointments().filter((a) => a.id !== id));
  renderAppointments();
});

form.addEventListener("input", () => {
  updateSummary();
  saveDraft();
});

flatpickr("#appt-date", {
  enableTime: true,
  minDate: "today",
  minTime: "09:00",
  maxTime: "18:00",
  minuteIncrement: 30,
  dateFormat: "Y-m-d H:i",
  disable: [(d) => d.getDay() === 0],
});

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const when = document.getElementById("appt-date").value;
  if (!when) {
    feedback.textContent = "Please pick a date and time for your appointment.";
    return;
  }

  const name = document.getElementById("cust-name").value.trim();
  const email = document.getElementById("cust-email").value.trim();

  const appointments = loadAppointments();
  appointments.push({
    id: Date.now(),
    service: serviceSelect.value,
    length: lengthSelect.value,
    price: priceInput.value,
    datetime: when,
    name,
    email,
  });
  saveAppointments(appointments);

  showToast(
    `Thanks ${name}! ${serviceSelect.value} requested for ${when}.`
  );
  localStorage.removeItem("bookingDraft");
  form.reset();
  updateSummary();
  renderAppointments();
});

init();
renderAppointments();
