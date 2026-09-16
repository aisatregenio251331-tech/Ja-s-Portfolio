/* =========================================================
   ALLYA JANE REGENIO — INTERACTION SYSTEM
   ========================================================= */

(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  document.documentElement.dataset.theme = localStorage.getItem("allya-theme") || "light";

  if (!window.gsap || !window.ScrollTrigger) {
    document.body.classList.add("no-gsap");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- LENIS ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(1000, 16);
  }

  /* ---------- LOADER ---------- */
  const loader = $(".loader");
  if (loader) {
    const count = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        loader.style.pointerEvents = "none";
        initPage();
      }
    });

    tl.to(count, {
      value: 100,
      duration: reduceMotion ? .2 : 1.65,
      ease: "none",
      onUpdate: () => $(".loader__count").textContent = String(Math.floor(count.value)).padStart(2, "0")
    })
    .to(".loader__name", { yPercent: -115, duration: .8, ease: "power4.inOut" }, "+=.08")
    .to(".loader__bar span", { scaleX: 1, transformOrigin: "left", duration: .5 }, "<")
    .to(loader, { clipPath: "inset(0 0 100% 0)", duration: .9, ease: "power4.inOut" }, "-=.2");
  } else {
    initPage();
  }

  function initPage() {
    initHero();
    initTheme();
    initNav();
    initCursor();
    initAboutStack();
    initPhilosophy();
    initSkills();
    initStories();
    initArchive();
    initMusic();
    initRevealSystem();
    ScrollTrigger.refresh();
  }

  /* ---------- THEME ---------- */
  function initTheme() {
    const toggle = $(".theme-toggle");
    if (!toggle) return;

    updateThemeButton();

    toggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("allya-theme", next);
      toggle.setAttribute("aria-pressed", next === "dark");
      toggle.setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} mode`);

      if (window.allyaScene) window.allyaScene.setTheme(next);
    });

    function updateThemeButton() {
      const dark = document.documentElement.dataset.theme === "dark";
      toggle.setAttribute("aria-pressed", dark);
      toggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
    }
  }

  /* ---------- NAV ---------- */
  function initNav() {
    const menu = $(".menu-toggle");
    const links = $(".nav-links");
    if (!menu || !links) return;

    menu.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", open);
      menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    $$(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        menu.setAttribute("aria-expanded", "false");
      });
    });

    $$(".nav-links a").forEach(link => {
      link.addEventListener("click", e => {
        const target = $(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis ? lenis.scrollTo(target, { offset: -55 }) : target.scrollIntoView();
      });
    });
  }

  /* ---------- THREE.JS HERO ---------- */
  function initHero() {
    const canvas = $("#hero-canvas");
    if (!canvas || !window.THREE || reduceMotion) return;

    const isMobile = window.innerWidth < 700;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    camera.position.z = 7.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.6));

    const group = new THREE.Group();
    scene.add(group);

    const material = new THREE.MeshBasicMaterial({
      color: document.documentElement.dataset.theme === "dark" ? 0xf2f0e9 : 0x11110f,
      wireframe: true,
      transparent: true,
      opacity: .23
    });

    const geometry = isMobile
      ? new THREE.IcosahedronGeometry(1.55, 1)
      : new THREE.IcosahedronGeometry(1.75, 2);

    const object = new THREE.Mesh(geometry, material);
    object.scale.set(1.15, .75, 1.15);
    object.rotation.set(.4, -.4, .1);
    group.add(object);

    const planeMat = new THREE.MeshBasicMaterial({
      color: material.color,
      wireframe: true,
      transparent: true,
      opacity: .08
    });

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 9, isMobile ? 8 : 20, isMobile ? 5 : 14),
      planeMat
    );
    plane.rotation.x = -Math.PI / 2.45;
    plane.position.set(0, -2.2, -.5);
    scene.add(plane);

    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement.clientWidth;
      const h = canvas.clientHeight || canvas.parentElement.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    let mx = 0, my = 0, targetX = 0, targetY = 0;
    window.addEventListener("pointermove", e => {
      mx = (e.clientX / innerWidth - .5) * 2;
      my = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

    let raf;
    const clock = new THREE.Clock();

    function render() {
      const t = clock.getElapsedTime();
      targetX += (mx - targetX) * .025;
      targetY += (my - targetY) * .025;

      group.rotation.y = t * .08 + targetX * .18;
      group.rotation.x = Math.sin(t * .18) * .12 + targetY * .1;
      plane.position.x = targetX * .15;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    }
    render();

    const themeColor = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      material.color.set(dark ? 0xf2f0e9 : 0x11110f);
      planeMat.color.set(dark ? 0xf2f0e9 : 0x11110f);
    };

    window.allyaScene = {
      setTheme: themeColor,
      destroy: () => {
        cancelAnimationFrame(raf);
        geometry.dispose();
        material.dispose();
        plane.geometry.dispose();
        planeMat.dispose();
        renderer.dispose();
      }
    };

    window.addEventListener("resize", resize, { passive: true });
  }

  /* ---------- CURSOR ---------- */
  function initCursor() {
    if (coarse || reduceMotion) return;
    const cursor = $(".cursor");
    if (!cursor) return;

    const label = $(".cursor__label");
    const x = gsap.quickTo(cursor, "x", { duration: .18, ease: "power3" });
    const y = gsap.quickTo(cursor, "y", { duration: .18, ease: "power3" });

    window.addEventListener("pointermove", e => {
      x(e.clientX);
      y(e.clientY);
    }, { passive: true });

    $$("[data-cursor]").forEach(el => {
      el.addEventListener("mouseenter", () => {
        label.textContent = el.dataset.cursor;
        cursor.classList.add("is-active");
      });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    });
  }

  /* ---------- ABOUT CARD STACK ---------- */
  function initAboutStack() {
    const cards = $$(".photo-card");
    if (!cards.length) return;

    if (window.innerWidth > 900 && !reduceMotion) {
      gsap.to(cards, {
        y: i => [-20, 10, -5, 22][i],
        rotation: i => [-7, 5, -3, 7][i],
        stagger: .08,
        scrollTrigger: {
          trigger: ".photo-stack",
          start: "top 70%",
          end: "bottom 30%",
          scrub: 1.1
        }
      });

      cards.forEach((card, i) => {
        card.addEventListener("mouseenter", () => gsap.to(card, { scale: 1.035, zIndex: 20, duration: .35 }));
        card.addEventListener("mouseleave", () => gsap.to(card, { scale: 1, zIndex: i + 1, duration: .45 }));
      });
    } else {
      cards.forEach(card => {
        card.style.position = "absolute";
      });
    }
  }

  /* ---------- PHILOSOPHY ---------- */
  function initPhilosophy() {
    if (reduceMotion) return;
    $$(".philosophy__line").forEach((line, i) => {
      gsap.fromTo(line, {
        xPercent: i % 2 ? 16 : -12,
        opacity: .25
      }, {
        xPercent: i % 2 ? -8 : 8,
        opacity: 1,
        scrollTrigger: {
          trigger: ".philosophy",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4
        }
      });
    });
  }

  /* ---------- SKILLS ---------- */
  function initSkills() {
    const rows = $$(".skill-row");
    const preview = $(".skill-preview");
    const text = $("[data-skill-preview]");
    const img = $("[data-skill-preview-img]");
    if (!rows.length) return;

    // skills-5.jpg was not provided, so EDITING reuses skills-1.jpg
    const skillImages = {
      "WRITING A NOVEL": "assets/skills-1.jpg",
      "DRAWING": "assets/skills-2.jpg",
      "DESIGNING": "assets/skills-3.jpg",
      "PHOTOGRAPHY": "assets/skills-4.jpg",
      "EDITING": "assets/skills-6.jpg"
    };

    rows.forEach(row => {
      row.addEventListener("mouseenter", () => {
        if (preview && !coarse) {
          text.textContent = row.dataset.skill;
          if (img) img.src = skillImages[row.dataset.skill] || skillImages["WRITING A NOVEL"];
          preview.style.opacity = "1";
          gsap.fromTo(preview, { rotate: -4, y: -10 }, { rotate: 2, y: 0, duration: .45, ease: "power3.out" });
        }
      });
      row.addEventListener("mouseleave", () => {
        if (preview && !coarse) preview.style.opacity = "0";
      });
    });
  }

  /* ---------- STORIES ---------- */
  function initStories() {
    if (reduceMotion) return;
    $$(".story-line").forEach((line, i) => {
      gsap.fromTo(line, {
        y: 45,
        opacity: 0,
        clipPath: "inset(100% 0 0 0)"
      }, {
        y: 0,
        opacity: 1,
        clipPath: "inset(0% 0 0 0)",
        duration: .85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: line,
          start: "top 88%"
        },
        delay: i * .035
      });
    });
  }

  /* ---------- ARCHIVE ---------- */
  function initArchive() {
    if (reduceMotion) return;
    $$(".archive-item").forEach((item, i) => {
      gsap.fromTo(item, {
        y: 70,
        rotate: i % 2 ? 2 : -2,
        opacity: 0
      }, {
        y: 0,
        rotate: 0,
        opacity: 1,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 88%"
        }
      });
    });
  }

  /* ---------- MUSIC ---------- */
  function initMusic() {
    const play = $(".play-button");
    const waveform = $(".waveform");
    const tracks = $$(".track");
    const nowPlaying = $("[data-now-playing]");
    if (!play || !waveform || !tracks.length) return;

    const audio = new Audio();
    audio.preload = "none";
    audio.volume = .8;
    audio.loop = true;

    let current = 0;
    let playing = false;
    let waveTween = null;

    const fmt = s => {
      if (!isFinite(s)) return "--:--";
      const m = Math.floor(s / 60), r = Math.floor(s % 60);
      return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
    };

    const setActiveTrack = () => {
      tracks.forEach((t, i) => t.classList.toggle("is-active", i === current));
      const name = tracks[current].querySelector("b").textContent;
      if (nowPlaying) {
        nowPlaying.hidden = !playing;
        nowPlaying.textContent = playing ? `NOW PLAYING — ${name}` : "";
      }
    };

    const loadTrack = (i, autoplay) => {
      current = i;
      audio.src = tracks[i].dataset.track;
      setActiveTrack();
      if (autoplay) {
        audio.play().catch(() => {});
        setPlaying(true);
      }
    };

    const setPlaying = state => {
      playing = state;
      play.querySelector("span").textContent = playing ? "PAUSE" : "PLAY";
      play.querySelector("i").textContent = playing ? "Ⅱ" : "▶";
      waveform.style.opacity = playing ? ".75" : ".25";

      if (playing && !reduceMotion) {
        gsap.killTweensOf(waveform);
        waveTween = gsap.fromTo(waveform, { scaleX: .2 }, {
          scaleX: 1, duration: 1.2, ease: "power2.inOut",
          repeat: -1, yoyo: true, transformOrigin: "left center"
        });
      } else {
        gsap.killTweensOf(waveform);
        gsap.set(waveform, { scaleX: 1 });
      }
      setActiveTrack();
    };

    play.addEventListener("click", () => {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        if (!audio.src) loadTrack(current, false);
        audio.play().then(() => setPlaying(true)).catch(() => {});
      }
    });

    tracks.forEach((track, i) => {
      track.addEventListener("click", () => {
        if (i === current) {
          play.click();
        } else {
          loadTrack(i, true);
        }
      });
    });

    audio.addEventListener("loadedmetadata", () => {
      tracks[current].querySelector("em").textContent = fmt(audio.duration);
    });
    audio.addEventListener("ended", () => loadTrack((current + 1) % tracks.length, true));
  }

  /* ---------- GENERAL REVEALS ---------- */
  function initRevealSystem() {
    if (reduceMotion) return;

    $$(".display-title, .eyebrow, .section-rule").forEach(el => {
      gsap.fromTo(el, {
        y: 30,
        opacity: 0,
        clipPath: "inset(100% 0 0 0)"
      }, {
        y: 0,
        opacity: 1,
        clipPath: "inset(0 0 0 0)",
        duration: .8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    gsap.to(".hero-portrait", {
      y: -40,
      rotate: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.to(".hero__title", {
      x: -25,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  }
})();
