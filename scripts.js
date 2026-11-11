(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menu-btn");
  const dock = document.getElementById("dock");
  const main = document.getElementById("main");
  const footer = document.querySelector(".footer");
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true
    });
  }

  function scrollY() {
    return lenis ? lenis.scroll : window.scrollY;
  }

  function scrollProgress() {
    if (lenis) return lenis.progress || 0;
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    return limit > 0 ? window.scrollY / limit : 0;
  }

  function paintChrome() {
    const y = scrollY();
    nav.classList.toggle("is-stuck", y > 24);
    progress.style.transform = "scaleX(" + scrollProgress() + ")";
    const showDock = y > 120 && !document.body.classList.contains("menu-open") && !document.body.classList.contains("lightbox-open");
    dock.classList.toggle("is-on", showDock);
    dock.inert = !showDock;
  }

  if (lenis) lenis.on("scroll", paintChrome);
  else window.addEventListener("scroll", paintChrome, { passive: true });
  paintChrome();

  function scrollToHash(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -96 });
    else {
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    if (!document.querySelector(hash)) return;
    event.preventDefault();
    closeMenu();
    scrollToHash(hash);
  });

  if (location.hash && document.querySelector(location.hash)) {
    requestAnimationFrame(function () { scrollToHash(location.hash); });
  }

  function setLocked(locked) {
    document.documentElement.classList.toggle("is-locked", locked);
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
  }

  function closeMenu() {
    if (menu.hasAttribute("hidden")) return;
    menu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    main.inert = false;
    footer.inert = false;
    setLocked(false);
    paintChrome();
  }

  function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    main.inert = true;
    footer.inert = true;
    setLocked(true);
    paintChrome();
  }

  menuBtn.addEventListener("click", function () {
    if (menu.hasAttribute("hidden")) openMenu();
    else closeMenu();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !menu.hasAttribute("hidden")) {
      closeMenu();
      menuBtn.focus();
    }
  });

  const reveals = document.querySelectorAll(".reveal, .reveal-stagger");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  const sectionLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  const sections = sectionLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        sectionLinks.forEach(function (link) {
          if (link.getAttribute("href") === id) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    sections.forEach(function (section) { spy.observe(section); });
  }

  function bindScroller(scroller, prev, next) {
    if (!scroller || !prev || !next) return;
    function step(direction) {
      const card = scroller.querySelector(".frame");
      const amount = card ? card.getBoundingClientRect().width + 14 : scroller.clientWidth * 0.8;
      scroller.scrollBy({ left: direction * amount, behavior: reduceMotion ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    scroller.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch") return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = scroller.scrollLeft;
      scroller.setPointerCapture(event.pointerId);
    });
    scroller.addEventListener("touchstart", function (event) {
      moved = false;
      startX = event.touches[0].clientX;
    }, { passive: true });
    scroller.addEventListener("touchmove", function (event) {
      if (Math.abs(event.touches[0].clientX - startX) > 8) moved = true;
    }, { passive: true });
    scroller.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 6) moved = true;
      scroller.scrollLeft = startScroll - delta;
    });
    scroller.addEventListener("pointerup", function () { dragging = false; });
    scroller.addEventListener("click", function (event) {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  bindScroller(document.getElementById("film"), document.getElementById("film-prev"), document.getElementById("film-next"));
  const gallery = document.getElementById("gallery-scroller");
  bindScroller(gallery, document.getElementById("gallery-prev"), document.getElementById("gallery-next"));

  const galleryCount = document.getElementById("gallery-count");
  const galleryFrames = gallery ? gallery.querySelectorAll(".frame") : [];
  function paintGalleryCount() {
    if (!gallery || !galleryFrames.length) return;
    const card = galleryFrames[0].getBoundingClientRect().width + 14;
    const index = Math.min(galleryFrames.length, Math.max(1, Math.round(gallery.scrollLeft / card) + 1));
    galleryCount.textContent = String(index).padStart(2, "0") + " / " + String(galleryFrames.length).padStart(2, "0");
  }
  if (gallery) {
    gallery.addEventListener("scroll", paintGalleryCount, { passive: true });
    paintGalleryCount();
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCap = document.getElementById("lightbox-cap");
  const groups = new Map();
  let activeGroup = [];
  let activeIndex = 0;
  let lastFocus = null;

  document.querySelectorAll("[data-lightbox]").forEach(function (button) {
    const group = button.dataset.group || "all";
    if (!groups.has(group)) groups.set(group, []);
    const list = groups.get(group);
    const index = list.length;
    list.push(button);
    button.addEventListener("click", function () { openLightbox(group, index); });
  });

  function showSlide(index) {
    const button = activeGroup[index];
    const image = button.querySelector("img");
    lightboxImg.src = image.currentSrc || image.src;
    lightboxImg.alt = image.alt;
    const caption = button.dataset.caption || image.alt;
    const label = String(index + 1).padStart(2, "0") + "  /  " + String(activeGroup.length).padStart(2, "0");
    lightboxCap.textContent = label + "  ·  " + caption;
  }

  function openLightbox(group, index) {
    activeGroup = groups.get(group) || [];
    activeIndex = index;
    lastFocus = document.activeElement;
    showSlide(activeIndex);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    nav.inert = true;
    main.inert = true;
    footer.inert = true;
    setLocked(true);
    paintChrome();
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
    nav.inert = false;
    main.inert = false;
    footer.inert = false;
    setLocked(false);
    paintChrome();
    if (lastFocus) lastFocus.focus();
  }

  function moveLightbox(step) {
    if (!activeGroup.length) return;
    activeIndex = (activeIndex + step + activeGroup.length) % activeGroup.length;
    showSlide(activeIndex);
  }

  lightbox.addEventListener("click", function (event) {
    if (event.target.closest("[data-close]")) closeLightbox();
  });
  document.getElementById("lightbox-prev").addEventListener("click", function () { moveLightbox(-1); });
  document.getElementById("lightbox-next").addEventListener("click", function () { moveLightbox(1); });

  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
    if (event.key === "Tab") {
      const focusable = lightbox.querySelectorAll("button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const audio = document.getElementById("bgm");
  const soundBtn = document.getElementById("sound");
  const iconOff = soundBtn.querySelector(".icon-off");
  const iconOn = soundBtn.querySelector(".icon-on");

  function setSound(playing) {
    soundBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    soundBtn.setAttribute("aria-label", playing ? "Pause the forest sound" : "Play the forest sound");
    iconOff.hidden = playing;
    iconOn.hidden = !playing;
  }

  soundBtn.addEventListener("click", function () {
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setSound(false);
      return;
    }
    audio.volume = 0.35;
    audio.play().then(function () { setSound(true); }).catch(function () { setSound(false); });
  });

  const form = document.getElementById("book-form");
  const checkin = document.getElementById("checkindate");
  const checkout = document.getElementById("checkoutdate");
  const status = document.getElementById("form-status");

  function localISO(date) {
    const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return shifted.toISOString().slice(0, 10);
  }

  const today = localISO(new Date());
  checkin.min = today;
  checkout.min = today;

  checkin.addEventListener("change", function () {
    if (!checkin.value) return;
    const next = new Date(checkin.value + "T00:00:00");
    next.setDate(next.getDate() + 1);
    checkout.min = localISO(next);
    if (checkout.value && checkout.value <= checkin.value) checkout.value = checkout.min;
  });

  function setError(id, message) {
    const field = document.getElementById(id).closest(".field");
    const slot = document.getElementById(id + "-error");
    field.classList.toggle("is-invalid", Boolean(message));
    slot.textContent = message || "";
  }

  function pretty(iso) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const adults = document.getElementById("adultsnumber").value.trim();
    const children = document.getElementById("children").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const note = document.getElementById("note").value.trim();
    let firstInvalid = null;

    function fail(id, message) {
      setError(id, message);
      if (!firstInvalid) firstInvalid = document.getElementById(id);
    }

    setError("name", "");
    setError("checkindate", "");
    setError("checkoutdate", "");
    setError("adultsnumber", "");
    setError("children", "");
    setError("phone", "");

    if (name.length < 2) fail("name", "Please enter your name.");
    if (!checkin.value) fail("checkindate", "Choose a check-in date.");
    else if (checkin.value < today) fail("checkindate", "Check-in cannot be in the past.");
    if (!checkout.value) fail("checkoutdate", "Choose a check-out date.");
    else if (checkin.value && checkout.value <= checkin.value) fail("checkoutdate", "Check-out must be after check-in.");
    const adultCount = Number(adults);
    if (!adults || !Number.isInteger(adultCount) || adultCount < 1) fail("adultsnumber", "Add at least one adult.");
    if (children !== "" && (!Number.isInteger(Number(children)) || Number(children) < 0)) fail("children", "Enter a number, or leave this blank.");
    const digits = phone.replace(/\D/g, "");
    if (phone && digits.length < 8) fail("phone", "Enter a phone number we can reach.");

    if (firstInvalid) {
      status.textContent = "Please complete the highlighted fields.";
      status.classList.add("is-error");
      firstInvalid.focus();
      return;
    }

    status.classList.remove("is-error");
    let message = "Hi, I am " + name + ", and I am reaching out to explore room availability for " + adultCount + (adultCount === 1 ? " adult" : " adults");
    if (children && Number(children) > 0) {
      message += " and " + children + (Number(children) === 1 ? " child" : " children");
    }
    message += " from " + pretty(checkin.value) + " to " + pretty(checkout.value) + ". Could you kindly share information on the availability and rates?";
    if (phone) message += " Phone: " + phone + ".";
    if (note) message += " " + note;

    window.open("https://wa.me/919037855944?text=" + encodeURIComponent(message), "_blank", "noopener");
    status.textContent = "WhatsApp should open with your message. If it does not, call us.";
  });
})();
