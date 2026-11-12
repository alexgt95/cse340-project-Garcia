// ── Hamburger menu toggle ──────────────────────────────────────
const hamburgerBtn = document.getElementById('hamburger'); //Referring to the HTML element
const mainNav = document.querySelector('header nav'); //Look for a <nav> tag that is a descendant of a <header> tag

if (hamburgerBtn && mainNav) {
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.toggle('open'); // nav .open in css added to the HTML. const isOpen is for JS to track whether its open
    mainNav.classList.toggle('open'); //CSS uses "open" transition the menu into view
    hamburgerBtn.setAttribute('aria-expanded', isOpen); //Accesibility: This tells screen readers used by visually impaired users whether the menu is currently expanded or collapsed.
  });

  // Close nav when any nav link is clicked (navigating on mobile)
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburgerBtn.classList.remove('open');
      mainNav.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav when clicking anywhere outside the header
  document.addEventListener('click', e => {
    if (!e.target.closest('header')) {
      hamburgerBtn.classList.remove('open');
      mainNav.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Home page: enlarged image modal ───────────────────────────
function initImageModal() {
  const triggers = document.querySelectorAll(".modal-trigger");
  if (!triggers.length) return;

  let overlay = null;

  function closeModal() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.classList.remove("modal-open");
  }

  function openModal(img) {
    closeModal();
    overlay = document.createElement("div");
    overlay.className = "image-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Enlarged image");

    const enlarged = document.createElement("img");
    enlarged.className = "image-modal-img";
    enlarged.src = img.currentSrc || img.src;
    enlarged.alt = img.alt;

    overlay.appendChild(enlarged);
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  triggers.forEach((img) => {
    img.addEventListener("click", () => openModal(img));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

initImageModal();

// Contact Form (demo only — no backend)
const feedbackElement = document.getElementById("feedback");
const formElement = document.querySelector(".contact-form-1 form");

if (formElement && feedbackElement) {
  formElement.addEventListener("submit", function (e) {
    e.preventDefault();

    feedbackElement.textContent =
      "Thank you! This is a demo form — your message was not sent.";
    feedbackElement.style.display = "block";

    formElement.reset();
  });
}
