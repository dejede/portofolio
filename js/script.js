document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero-img");
  const lazyImages = document.querySelectorAll(".lazy");
  /* 1️⃣ HERO FADE */
  if (hero) {
    if (hero.complete) {
      hero.classList.add("loaded");
    } else {
      hero.addEventListener("load", () => hero.classList.add("loaded"), { once: true });
    }
  }
  /* 2️⃣ DETECT CONNECTION */
  const connection = navigator.connection || {};
  const slowConnection = connection.saveData || 
                         connection.effectiveType === "2g" || 
                         connection.effectiveType === "slow-2g";
  /* 3️⃣ LOAD FIRST 3 IMAGES IMMEDIATELY */
  const initialBatch = 3;
  lazyImages.forEach((img, index) => {
    if (index < initialBatch) {
      loadImage(img);
    }
  });
  /* 4️⃣ INTERSECTION OBSERVER */
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: slowConnection ? "50px" : "150px"
  });
  lazyImages.forEach((img, index) => {
    if (index >= initialBatch) {
      observer.observe(img);
    }
  });
  function loadImage(img){
    if (!img.dataset.src) return;
    img.src = img.dataset.src;
    img.decoding = "async";
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    }, { once: true });
    delete img.dataset.src;
  }
/* 5️⃣ DROPDOWN - highlight ngikutin sentuhan/drag jari (mode mobile) */
const dropdownContent = document.querySelector('.dropdown-content');

if (dropdownContent) {
  let activeItem = null;
  let isPressing = false;

  function setActive(item) {
    if (item === activeItem) return;
    if (activeItem) activeItem.classList.remove('mobile-active');
    if (item) item.classList.add('mobile-active');
    activeItem = item;
  }

  function findItemAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('.dropdown-content a') : null;
  }

  dropdownContent.addEventListener('pointerdown', (e) => {
    isPressing = true;
    setActive(findItemAt(e.clientX, e.clientY));
  });

  dropdownContent.addEventListener('pointermove', (e) => {
    if (!isPressing) return;
    setActive(findItemAt(e.clientX, e.clientY));
  });

  function clearActive() {
    isPressing = false;
    if (activeItem) {
      activeItem.classList.remove('mobile-active');
      activeItem = null;
    }
  }

  dropdownContent.addEventListener('pointerup', clearActive);
  dropdownContent.addEventListener('pointercancel', clearActive);
  dropdownContent.addEventListener('pointerleave', clearActive);
}
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(drop => {
        drop.classList.remove('show-mobile');
      });
      // Tutup juga "gerbang" overflow di nav-links saat dropdown ditutup dari luar
      document.querySelector('.nav-links')?.classList.remove('dropdown-open');
    }
    if (navMenu && hamburger) {
      const isClickInside = navMenu.contains(e.target) || hamburger.contains(e.target);
      if (!isClickInside && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    }
  });
});
// Fungsi Global untuk Dropdown Tools
function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("toolDropdown");
  const navLinks = document.querySelector(".nav-links");
  if (dropdown) {
    dropdown.classList.toggle("show-mobile");
    // Buka overflow di nav-links via JS, tidak gantung ke dukungan :has() di browser
    if (navLinks) {
      navLinks.classList.toggle("dropdown-open", dropdown.classList.contains("show-mobile"));
    }
  }
}