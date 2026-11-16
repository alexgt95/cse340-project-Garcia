import { fetchServices } from "./fetchServices.js";
import { escapeHtml } from "./escapeHtml.js";

let services = [];

const serviceContainer = document.querySelector("#service-container");
const categoryDropdown = document.querySelector("#category");


export async function loadServices() {
  try {
    services = await fetchServices();
    renderServices(services);
  } catch (err) {
    console.error("Failed to load services:", err);
    if (serviceContainer) {
      serviceContainer.innerHTML =
        "<p>Sorry — our services couldn't load right now. Please refresh the page.</p>";
    }
  }
}

function renderServices(serviceList) {
  if (!serviceContainer) return;

  serviceContainer.innerHTML = serviceList
    .map((service) => serviceTemplate(service))
    .join("");
}

function serviceTemplate(service) {
  const name = escapeHtml(service.name);
  const description = escapeHtml(service.description);
  const duration = escapeHtml(service.duration);
  const image = escapeHtml(service.image);
  const webpImage = escapeHtml(service.image.replace(/\.(jpg|png)$/i, ".webp"));
  const idSuffix = service.name.replace(/\s/g, "");

  const categories = service.category
    .map((cat) => `<span>${escapeHtml(cat)}</span>`)
    .join("");

  return `
    <section class="service-card">
      <div class="service-image">
        <picture style="display: contents;">
          <source srcset="${webpImage}" type="image/webp">
          <img src="${image}" alt="${name}">
        </picture>
      </div>

      <div class="service-info">

        <div class="service-category">
          ${categories}
        </div>

        <h2>${name}</h2>

        <p class="service-description">
          ${description}
        </p>

        <label for="length-${idSuffix}">
          Select hair length:
        </label>

        <select
          class="hair-length"
          id="length-${idSuffix}"
          required
          oninvalid="this.setCustomValidity('Please choose a hair length.')"
          onchange="this.setCustomValidity('')">
          <option value="">--Choose--</option>
          <option value="short">Short Hair</option>
          <option value="mid">Mid Length</option>
          <option value="long">Long Hair</option>
        </select>

        <p class="service-duration hidden">
          <strong>Duration:</strong> ${duration}
        </p>

        <p class="service-price hidden">
          <strong>Price:</strong> $0
        </p>

        <button class="select-service-btn btn" type="button">
          Select
        </button>

      </div>
    </section>
  `;
}

function getPrice(service, length) {
  return service.price[length] || 0;
}

if (categoryDropdown) {
  categoryDropdown.addEventListener("change", function () {
    const selectedCategory = categoryDropdown.value;

    let filteredServices =
      selectedCategory === "All"
        ? services
        : services.filter((service) =>
            service.category.includes(selectedCategory)
          );

    filteredServices.sort((a, b) => a.name.localeCompare(b.name));

    renderServices(filteredServices);
  });
}

if (serviceContainer) {
  serviceContainer.addEventListener("change", function (e) {
    if (!e.target.classList.contains("hair-length")) return;

    const select = e.target;
    const serviceCard = select.closest(".service-card");

    const priceElement = serviceCard.querySelector(".service-price");
    const durationElement = serviceCard.querySelector(".service-duration");
    const selectBtn = serviceCard.querySelector(".select-service-btn");

    const selectedLength = select.value;

    const serviceObj = services.find(
      (service) => service.name === serviceCard.querySelector("h2").textContent
    );

    const dynamicPrice = getPrice(serviceObj, selectedLength);

    priceElement.innerHTML = `<strong>Price:</strong> $${dynamicPrice}`;

    durationElement.classList.remove("hidden");
    priceElement.classList.remove("hidden");
    selectBtn.classList.remove("hidden");
  });

  serviceContainer.addEventListener("click", function (e) {
    if (!e.target.classList.contains("select-service-btn")) return;
    const selectBtn = e.target;
    const serviceCard = selectBtn.closest(".service-card");
    const select = serviceCard.querySelector(".hair-length");

    if (!select.value) {
      select.setCustomValidity("Please choose a hair length.");
      select.reportValidity();

      return;
    }
    select.setCustomValidity("");
    const serviceObj = services.find(
      (service) => service.name === serviceCard.querySelector("h2").textContent
    );

    const dynamicPrice = getPrice(serviceObj, select.value);
    const params = new URLSearchParams({
      service: serviceObj.name,
      length: select.value,
      price: dynamicPrice,
    });

    window.location.href = `appointment.html?${params}`;
  });
}
