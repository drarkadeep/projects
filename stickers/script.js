// ─── Populate header from meta tags ───
(function () {
  const title =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.title;
  const desc =
    document.querySelector('meta[name="description"]')?.content || "";
  document.getElementById("headerTitle").textContent = title;
  document.getElementById("headerTagline").textContent = desc;
})();

// ─── Collapse header on scroll (hysteresis, layout-shift-safe) ───
(function () {
  const header = document.getElementById("siteHeader");
  const galleryWrap = document.querySelector(".gallery-wrap");
  let isCollapsed = false;
  let ticking = false;
  const COLLAPSE_AT = 80;
  const EXPAND_AT = 30; // hysteresis: un-collapse well before 0

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!isCollapsed && y > COLLAPSE_AT) {
          // Measure header height BEFORE collapsing
          const heightBefore = header.offsetHeight;
          header.classList.add("collapsed");
          // Measure header height AFTER collapsing
          const heightAfter = header.offsetHeight;
          const diff = heightBefore - heightAfter;
          // Compensate so scrollY doesn't shift
          if (diff > 0 && galleryWrap) {
            galleryWrap.style.paddingTop = `${diff + 12}px`; // 12px is the original padding
          }
          isCollapsed = true;
        } else if (isCollapsed && y <= EXPAND_AT) {
          // Remove compensation and un-collapse
          if (galleryWrap) {
            galleryWrap.style.paddingTop = "";
          }
          header.classList.remove("collapsed");
          isCollapsed = false;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ─── Info modal ───
const infoModal = document.getElementById("infoModal");
const infoModalTitle = document.getElementById("infoModalTitle");
const infoModalBody = document.getElementById("infoModalBody");
const infoCloseBtn = document.getElementById("infoCloseBtn");

const INFO_CONTENT = {
  "how-to-use": {
    title: "How to use?",
    body: `
      <ul>
        <li>Scroll through the gallery — stickers load as you go</li>
        <li>Use the search bar at the top to find stickers by their text</li>
        <li>Tap any sticker to open it full screen</li>
        <li>Hit <strong>↓ Save</strong> to download it to your device</li>
        <li>Send the saved file on WhatsApp, Telegram, iMessage — any messenger</li>
        <li>Hit <strong>☆ Star</strong> to pin your favorites to the top of the page</li>
        <li>Starred stickers move out of the main grid into their own section</li>
        <li>Hit <strong>✕ Hide</strong> to remove stickers you never want to see</li>
        <li>Hidden stickers won't load — scroll past fewer "Oi DEKHO" stickers</li>
        <li>Your stars and hides are saved in your browser — they survive refreshes</li>
        <li>Use <strong>Unstar All</strong> or <strong>Unhide All</strong> at the bottom to reset</li>
      </ul>
    `,
  },
  "when-to-use": {
    title: "When to use?",
    body: `
      <ul>
        <li>Never 'in formal' conversations. Only 'informal' conversations.</li>
        <li>When arguing with customer support and words have failed you</li>
        <li>When your friend sends a terrible take and you need to respond without typing</li>
        <li>When words are simply not enough</li>
        <li>When you are a Bengali <em>(partially mandatory)</em></li>
        <li>When the recipient is Bengali <em>(less partially mandatory)</em></li>
        <li>When neither party is Bengali but both appreciate chaotic energy</li>
        <li>When explaining your mood would take a paragraph but a cat sticker does it in 0.2 seconds</li>
        <li>When the group chat has gone silent and someone must break the ice with a judgmental cat</li>
        <li>When your therapist asks "how are you feeling?" and you want to answer honestly</li>
        <li>When the vibe is immaculate and you need to ruin it</li>
        <li>When you realize you've scrolled this entire list and are now emotionally invested in stickers of cats with Bengali text</li>
      </ul>
    `,
  },
};

function openInfoModal(type) {
  const content = INFO_CONTENT[type];
  if (!content) return;
  infoModalTitle.textContent = content.title;
  infoModalBody.innerHTML = content.body;
  infoModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeInfoModal() {
  infoModal.classList.remove("active");
  document.body.style.overflow = "";
}

document.getElementById("btnHowToUse").addEventListener("click", () => {
  openInfoModal("how-to-use");
});

document.getElementById("btnWhenToUse").addEventListener("click", () => {
  openInfoModal("when-to-use");
});

infoCloseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeInfoModal();
});

infoModal.addEventListener("click", (e) => {
  if (e.target === infoModal) {
    closeInfoModal();
  }
});

// ─── LocalStorage helpers ───
function getSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}
function saveSet(key, s) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

let starredSet = getSet("stickers_starred");
let hiddenSet = getSet("stickers_hidden");

// ─── Gallery logic ───
const TOTAL = 123;
const allStickers = Array.from(
  { length: TOTAL },
  (_, i) => `assets/${i + 1}.webp`,
);

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const gallery = document.getElementById("gallery");
const starredGallery = document.getElementById("starredGallery");
const starredSection = document.getElementById("starredSection");
const bottomActions = document.getElementById("bottomActions");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalDescription = document.getElementById("modalDescription");
const closeBtn = document.getElementById("closeBtn");
const modalPrevBtn = document.getElementById("modalPrevBtn");
const modalNextBtn = document.getElementById("modalNextBtn");
const modalStarBtn = document.getElementById("modalStarBtn");
const modalHideBtn = document.getElementById("modalHideBtn");
const modalDownloadBtn = document.getElementById("modalDownloadBtn");

let currentModalSrc = null;
let stickerDescriptions = {};
let descriptionsLoaded = false;

fetch("descriptions.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Could not load descriptions (${response.status})`);
    }
    return response.json();
  })
  .then((descriptions) => {
    stickerDescriptions = descriptions;
    descriptionsLoaded = true;
    updateModalDescription();
  })
  .catch((error) => {
    descriptionsLoaded = true;
    console.warn(error);
    updateModalDescription();
  });

function createCard(src, index) {
  const card = document.createElement("div");
  card.className = "sticker-card";
  card.dataset.src = src;
  const stickerNumber = src.match(/\d+/)?.[0] || "";

  card.innerHTML = `
    <div class="loader"><div class="loader-spinner"></div></div>
    <img class="sticker-img" data-src="${src}" alt="Sticker ${stickerNumber}">
  `;

  card.addEventListener("click", () => openModal(src));
  return card;
}

// Shuffled order (computed once)
const shuffledStickers = shuffle(allStickers);

let searchQuery = "";

function renderGallery() {
  gallery.innerHTML = "";
  starredGallery.innerHTML = "";

  const query = searchQuery.trim().toLowerCase();
  const matchesQuery = (src) => {
    if (!query) return true;
    const desc = (stickerDescriptions[src] || "").toLowerCase();
    return desc.includes(query);
  };

  // Starred section
  const starredArr = shuffledStickers.filter(
    (s) => starredSet.has(s) && !hiddenSet.has(s) && matchesQuery(s),
  );
  if (starredArr.length > 0) {
    starredSection.classList.add("has-stars");
    starredArr.forEach((src, i) => {
      starredGallery.appendChild(createCard(src, i));
    });
  } else {
    starredSection.classList.remove("has-stars");
  }

  // Main gallery: exclude hidden AND starred
  const mainStickers = shuffledStickers.filter(
    (s) => !hiddenSet.has(s) && !starredSet.has(s) && matchesQuery(s),
  );
  mainStickers.forEach((src, i) => {
    gallery.appendChild(createCard(src, i));
  });

  // If no stickers match search
  if (mainStickers.length === 0 && starredArr.length === 0 && query) {
    const noResults = document.createElement("div");
    noResults.className = "no-results";
    noResults.textContent = "No stickers found matching that search.";
    noResults.style.columnSpan = "all";
    noResults.style.textAlign = "center";
    noResults.style.padding = "40px 0";
    noResults.style.color = "#666";
    noResults.style.fontSize = "0.8rem";
    gallery.appendChild(noResults);
  }

  // Bottom action buttons
  bottomActions.innerHTML = "";
  if (hiddenSet.size > 0) {
    const btn = document.createElement("button");
    btn.textContent = `unhide all (${hiddenSet.size})`;
    btn.addEventListener("click", () => {
      hiddenSet.clear();
      saveSet("stickers_hidden", hiddenSet);
      renderGallery();
    });
    bottomActions.appendChild(btn);
  }
  if (starredSet.size > 0) {
    const btn = document.createElement("button");
    btn.textContent = `unstar all (${starredSet.size})`;
    btn.addEventListener("click", () => {
      starredSet.clear();
      saveSet("stickers_starred", starredSet);
      renderGallery();
    });
    bottomActions.appendChild(btn);
  }

  observeAll();
}

// ─── Lazy loading ───
const observerOptions = {
  root: null,
  rootMargin: "100px 0px 300px 0px",
  threshold: 0,
};

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const card = entry.target;
      const img = card.querySelector(".sticker-img");
      const src = img.dataset.src;

      if (src) {
        const rect = card.getBoundingClientRect();
        const delay = Math.max(0, Math.min(rect.top / 10, 100));

        setTimeout(() => {
          img.src = src;
          img.onload = () => card.classList.add("loaded");
          img.onerror = () => card.classList.add("loaded");
        }, delay);

        img.dataset.src = "";
        imageObserver.unobserve(card);
      }
    }
  });
}, observerOptions);

function observeAll() {
  document.querySelectorAll(".sticker-card").forEach((card) => {
    imageObserver.observe(card);
  });
}

// ─── Initial render ───
renderGallery();

// ─── Sticker modal functions ───
function updateModalButtons() {
  if (!currentModalSrc) return;
  const isStarred = starredSet.has(currentModalSrc);
  modalStarBtn.textContent = isStarred ? "★ Starred" : "☆ Star";
  modalStarBtn.classList.toggle("starred", isStarred);
}

function updateModalDescription() {
  if (!currentModalSrc) return;
  const description = stickerDescriptions[currentModalSrc];
  modalDescription.textContent = descriptionsLoaded
    ? description || "English explanation unavailable."
    : "Loading explanation...";
  modalImg.alt = description || "Sticker fullscreen view";
}

function showModalSticker(src) {
  currentModalSrc = src;
  modalImg.src = src;
  updateModalDescription();
  updateModalButtons();
}

function updateModalNavigation() {
  const hasMultipleStickers =
    shuffledStickers.filter((src) => !hiddenSet.has(src)).length > 1;
  modalPrevBtn.disabled = !hasMultipleStickers;
  modalNextBtn.disabled = !hasMultipleStickers;
}

function navigateModal(direction) {
  if (!currentModalSrc) return;
  const visibleStickers = shuffledStickers.filter(
    (src) => !hiddenSet.has(src),
  );
  if (visibleStickers.length < 2) return;

  const currentIndex = visibleStickers.indexOf(currentModalSrc);
  const nextIndex =
    (currentIndex + direction + visibleStickers.length) %
    visibleStickers.length;
  showModalSticker(visibleStickers[nextIndex]);
}

function openModal(src) {
  showModalSticker(src);
  updateModalNavigation();
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
  currentModalSrc = null;
  setTimeout(() => {
    modalImg.src = "";
    modalImg.alt = "Sticker fullscreen view";
    modalDescription.textContent = "";
  }, 300);
}

// Star from modal
modalStarBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentModalSrc) return;
  if (starredSet.has(currentModalSrc)) {
    starredSet.delete(currentModalSrc);
  } else {
    starredSet.add(currentModalSrc);
  }
  saveSet("stickers_starred", starredSet);
  updateModalButtons();
  renderGallery();
});

// Hide from modal
modalHideBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentModalSrc) return;
  hiddenSet.add(currentModalSrc);
  starredSet.delete(currentModalSrc);
  saveSet("stickers_hidden", hiddenSet);
  saveSet("stickers_starred", starredSet);
  closeModal();
  renderGallery();
});

// Download from modal
modalDownloadBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentModalSrc) return;
  const a = document.createElement("a");
  a.href = currentModalSrc;
  a.download = currentModalSrc.split("/").pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeModal();
});

modalPrevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  navigateModal(-1);
});

modalNextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  navigateModal(1);
});

modal.addEventListener("click", (e) => {
  if (
    e.target === modal ||
    e.target === document.querySelector(".modal-content")
  ) {
    closeModal();
  }
});

// Close any modal on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modal.classList.contains("active")) closeModal();
    if (infoModal.classList.contains("active")) closeInfoModal();
  }
  if (!modal.classList.contains("active")) return;
  if (e.key === "ArrowLeft") navigateModal(-1);
  if (e.key === "ArrowRight") navigateModal(1);
});

modalImg.addEventListener("click", (e) => {
  e.stopPropagation();
});

// ─── Search input handling ───
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchQuery ? "flex" : "none";
    }
    renderGallery();
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    searchQuery = "";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    clearSearchBtn.style.display = "none";
    renderGallery();
  });
}
