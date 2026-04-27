window.addEventListener("load", () => document.body.classList.add("loaded"));

const isMobile = window.matchMedia("(max-width: 900px)").matches;
const prefersReduce = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (isMobile || prefersReduce) document.body.classList.add("reduce-motion");

const slides = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
];

const imgA = document.getElementById("imgA");
const imgB = document.getElementById("imgB");
const model = document.getElementById("heroModel");

let index = 0;
imgA.src = slides[index];
imgB.src = slides[(index + 1) % slides.length];

let showingA = true;
let timer = null;
const INTERVAL = isMobile || prefersReduce ? 10000 : 6000;

function nextSlide() {
  index = (index + 1) % slides.length;
  const nextUrl = slides[index];

  if (showingA) {
    imgB.src = nextUrl;
    imgB.classList.add("show");
    imgA.classList.remove("show");
  } else {
    imgA.src = nextUrl;
    imgA.classList.add("show");
    imgB.classList.remove("show");
  }
  showingA = !showingA;
}

function startSlideshow() {
  if (timer) return;
  timer = setInterval(nextSlide, INTERVAL);
}
function stopSlideshow() {
  clearInterval(timer);
  timer = null;
}

startSlideshow();
model.addEventListener("mouseenter", stopSlideshow);
model.addEventListener("mouseleave", startSlideshow);

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");
const modalSecondary = document.getElementById("modalSecondary");
const modalPrimary = document.getElementById("modalPrimary");

const contentMap = {
  students: {
    title: "250K+ Assisted Students",
    body: "SkillEdge has helped 250,000+ learners with structured courses, mentoring, and projects.",
  },
  live: {
    title: "Live Class – Today at 6:00 PM",
    body: "Join today’s live session with expert guidance, Q&A, and practical tasks.",
  },
  progress: {
    title: "Congratulations – Progress Improved",
    body: "Track modules, quizzes, milestones and improve faster with SkillEdge.",
  },
};

function openModal(type) {
  const data = contentMap[type] || {
    title: "Info",
    body: "Details not found.",
  };
  modalTitle.textContent = data.title;
  modalBody.textContent = data.body;
  modal.classList.add("show");
}
function closeModal() {
  modal.classList.remove("show");
}

document.querySelectorAll(".badge[data-type]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.dataset.type));
});

modalClose.addEventListener("click", closeModal);
modalSecondary.addEventListener("click", closeModal);
modalPrimary.addEventListener("click", () => {
  closeModal();
  alert("Explore clicked ✅");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* =========================
         ✅ COUNT UP: fast start -> slow stop (ease-out)
         Runs when section enters viewport
         ========================= */
(function () {
  const section = document.getElementById("success");
  const counters = document.querySelectorAll(".count");
  if (!section || !counters.length) return;

  const prefersReduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function animateCount(el, target, duration) {
    if (prefersReduce) {
      el.textContent = target.toLocaleString();
      return;
    }

    const start = 0;
    const t0 = performance.now();

    function frame(now) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = easeOutQuint(p);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = val.toLocaleString();

      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  let played = false;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !played) {
          played = true;
          counters.forEach((c, i) => {
            const target = Number(c.dataset.target || 0);
            const base = 1200;
            const dur = base + i * 220;
            animateCount(c, target, dur);
          });
        }
      });
    },
    { threshold: 0.35 },
  );

  io.observe(section);
})();

/* =========================
           ✅ LOGO MARQUEE:
           hover pause, leave -> resume
           Auto + drag works
           Logos clearer: Clearbit -> Favicon fallback
           ========================= */
(function () {
  const marquee = document.getElementById("marquee");
  const track = document.getElementById("track");

  if (!marquee || !track) return;

  // ✅ Load logos + crisp fallback
  function setLogos() {
    const pills = track.querySelectorAll(".logoPill");
    pills.forEach((pill) => {
      const domain = pill.getAttribute("data-domain");
      const name = pill.getAttribute("data-name") || "";
      const img = pill.querySelector(".logoImg");
      const text = pill.querySelector(".logoText");

      if (text) text.textContent = name;

      img.src = "https://cdn.simpleicons.org/" + domain.replace(".com", "");

      img.onerror = () => {
        img.onerror = null;
        img.src = "https://www.google.com/s2/favicons?sz=256&domain=" + domain;
      };
    });
  }
  setLogos();

  // ✅ Subtle grayscale -> color hover (premium)
  // ✅ CLEAR LOGO LOOK (no grayscale, no shadow feeling)
  document.querySelectorAll(".logoImg").forEach((img) => {
    img.style.filter = "none";
    img.style.opacity = "1";
  });

  let x = 0;
  let speed = 0.55;
  let isRunning = false;
  let isDragging = false;

  function getTrackHalf() {
    return track.scrollWidth / 2;
  }

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate() {
    if (!isRunning || prefersReduced) return;

    x -= speed;
    const half = getTrackHalf();

    if (x <= -half) x += half;
    if (x > 0) x -= half;

    track.style.transform = `translate3d(${x}px, 0, 0)`;
    requestAnimationFrame(animate);
  }

  setTimeout(() => {
    if (prefersReduced) return;
    isRunning = true;
    requestAnimationFrame(animate);
  }, 800);

  function pause() {
    isRunning = false;
  }
  function resume() {
    if (prefersReduced) return;
    if (!isDragging) {
      isRunning = true;
      requestAnimationFrame(animate);
    }
  }

  marquee.addEventListener("mouseenter", pause);
  marquee.addEventListener("mouseleave", resume);

  let startX = 0;
  let startTranslate = 0;

  marquee.addEventListener("pointerdown", (e) => {
    isDragging = true;
    pause();
    marquee.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startTranslate = x;
  });

  marquee.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    x = startTranslate + dx;

    const half = getTrackHalf();
    while (x <= -half) x += half;
    while (x > 0) x -= half;

    track.style.transform = `translate3d(${x}px, 0, 0)`;
  });

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    resume();
  }
  marquee.addEventListener("pointerup", endDrag);
  marquee.addEventListener("pointercancel", endDrag);
  marquee.addEventListener("pointerleave", endDrag);

  window.addEventListener("resize", () => {
    const half = getTrackHalf();
    while (x <= -half) x += half;
    while (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  });
})();

/* =========================
       ✅ WHAT SECTION interactions (cards + buttons -> modal)
    ========================= */
(function () {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const info = {
    trainers: {
      title: "For Trainers — Manage Training Easily",
      body:
        "• Create batches & schedules\n" +
        "• Auto attendance + reminders\n" +
        "• Upload assignments + evaluate\n" +
        "• Fee/invoice records + reports\n" +
        "• Certificates & progress analytics\n\n" +
        "Best Add-ons: Trainer dashboard, payout reports, batch-wise performance.",
    },
    students: {
      title: "For Students — Learn, Track & Grow",
      body:
        "• Join using code\n" +
        "• See timetable & notifications\n" +
        "• Submit assignments, give tests\n" +
        "• Track progress + leaderboard\n" +
        "• Download certificates\n\n" +
        "Best Add-ons: Gamification, streaks, doubt chat, downloadable notes.",
    },
    startTraining: {
      title: "Start Training",
      body:
        "Next step ideas:\n" +
        "1) Trainer Login\n2) Create Batch\n3) Add Students\n4) Schedule Class\n5) Take Attendance",
    },
    joinCode: {
      title: "Join with Code",
      body:
        "Student flow:\n" +
        "1) Enter Join Code\n2) Batch mapped\n3) Timetable shows\n4) Start learning + assignments",
    },
    howItWorks: {
      title: "How SkillEdge Works",
      body:
        "One platform:\n" +
        "• Admin manages institutes\n" +
        "• Trainers manage batches\n" +
        "• Students learn + progress\n" +
        "Everything synced in one dashboard.",
    },
  };

  function open(title, body) {
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modal.classList.add("show");
  }

  // Card click
  document.querySelectorAll(".roleCard").forEach((card) => {
    const role = card.getAttribute("data-role");
    card.addEventListener("click", (e) => {
      // if button clicked, it will handle separately
      const isBtn = e.target && e.target.closest && e.target.closest("button");
      if (isBtn) return;
      const data = info[role];
      if (data) open(data.title, data.body);
    });

    // Enter key accessibility
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const data = info[role];
        if (data) open(data.title, data.body);
      }
    });
  });

  // Buttons click
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest(".roleActions button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");

    // ✅ Links (tum yahan apne pages set kar sakte ho)
    if (action === "start-training") {
      // window.location.href = "trainer-login.html"; // optional
      open(info.startTraining.title, info.startTraining.body);
    }
    if (action === "join-code") {
      // window.location.href = "student-join.html"; // optional
      open(info.joinCode.title, info.joinCode.body);
    }
    if (action === "see-features") {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth" });
    }
    if (action === "how-it-works") {
      open(info.howItWorks.title, info.howItWorks.body);
    }
  });
})();

/* =========================
           ✅ Classroom: Reveal + Video Modal
        ========================= */
(function () {
  // reveal
  const revealEl = document.querySelector(".classroomCard.reveal");
  if (revealEl) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            revealEl.classList.add("show");
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(revealEl);
  }

  // video modal
  const videoModal = document.getElementById("videoModal");
  const demoFrame = document.getElementById("demoFrame");
  const playBtn = document.getElementById("playVideoBtn");
  const watchBtn = document.getElementById("watchDemoBtn");
  const closeBtn = document.getElementById("videoClose");
  const close2 = document.getElementById("videoSecondary");

  // ✅ You can change this to your own YouTube link later
  const DEMO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";

  function openVideo() {
    if (!videoModal || !demoFrame) return;
    demoFrame.src = DEMO_URL;
    videoModal.classList.add("show");
    videoModal.setAttribute("aria-hidden", "false");
  }

  function closeVideo() {
    if (!videoModal || !demoFrame) return;
    videoModal.classList.remove("show");
    videoModal.setAttribute("aria-hidden", "true");
    demoFrame.src = ""; // stop video
  }

  if (playBtn) playBtn.addEventListener("click", openVideo);
  if (watchBtn) watchBtn.addEventListener("click", openVideo);
  if (closeBtn) closeBtn.addEventListener("click", closeVideo);
  if (close2) close2.addEventListener("click", closeVideo);

  if (videoModal) {
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeVideo();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVideo();
  });
})();

/* =========================
         ✅ UI FEATURES: click -> highlight preview
         + reveal on scroll
      ========================= */
// ✅ ADDED: init call cards (data-img -> background)
(function () {
  document.querySelectorAll("[data-callcard]").forEach((card) => {
    card.classList.add("show");
    card.querySelectorAll("[data-img]").forEach((el) => {
      const imgDiv = el.querySelector(".img");
      if (!imgDiv) return;
      imgDiv.style.backgroundImage = `url('${el.getAttribute("data-img")}')`;
    });
  });
})();

// ✅ UI Features reveal on scroll (safe)
(function () {
  const ui = document.querySelector(".uiFeaturesCard.uiReveal");
  if (!ui) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          ui.classList.add("show");
          io.disconnect();
        }
      });
    },
    { threshold: 0.22 },
  );
  io.observe(ui);
})();

(function () {
  // reveal
  const revealEl = document.querySelector(".classroomCard.reveal");
  if (revealEl) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            revealEl.classList.add("show");
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(revealEl);
  }

  // video modal
  const videoModal = document.getElementById("videoModal");
  const demoFrame = document.getElementById("demoFrame");
  const playBtn = document.getElementById("playVideoBtn");
  const watchBtn = document.getElementById("watchDemoBtn");
  const closeBtn = document.getElementById("videoClose");
  const close2 = document.getElementById("videoSecondary");

  const DEMO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";

  function openVideo() {
    if (!videoModal || !demoFrame) return;
    demoFrame.src = DEMO_URL;
    videoModal.classList.add("show");
    videoModal.setAttribute("aria-hidden", "false");
  }

  function closeVideo() {
    if (!videoModal || !demoFrame) return;
    videoModal.classList.remove("show");
    videoModal.setAttribute("aria-hidden", "true");
    demoFrame.src = "";
  }

  playBtn && playBtn.addEventListener("click", openVideo);
  watchBtn && watchBtn.addEventListener("click", openVideo);
  closeBtn && closeBtn.addEventListener("click", closeVideo);
  close2 && close2.addEventListener("click", closeVideo);

  if (videoModal) {
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeVideo();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVideo();
  });
})();

/* =========================
   ✅ Tools Card: reveal on scroll
========================= */
(function () {
  const card = document.querySelector(".toolsCard.toolsReveal");
  if (!card) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          card.classList.add("show");
          io.disconnect();
        }
      });
    },
    { threshold: 0.22 },
  );

  io.observe(card);
})();

// Scroll reveal (motion)
(function () {
  const left = document.getElementById("leftCard");
  const right = document.getElementById("rightText");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show() {
    left.classList.add("show");
    right.classList.add("show");
  }

  if (reduce) {
    show();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          show();
          io.disconnect();
        }
      });
    },
    { threshold: 0.25 },
  );

  io.observe(left);
})();

(function () {
  const wrap = document.getElementById("eduToolsReveal");
  if (!wrap) return;

  /* ✅ FIX: page load pe hi content visible */
  wrap.classList.add("eduShow");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  /* progress bar animation */
  const fills = wrap.querySelectorAll(".gbRow .fill");
  fills.forEach((el, idx) => {
    el.animate([{ transform: "scaleX(.2)" }, { transform: "scaleX(1)" }], {
      duration: 900,
      delay: 200 + idx * 120,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "forwards",
    });
  });
})();

const TG_ICONS = {
  html5:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  python:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  react:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  node: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  figma:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  docker:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  github:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  book: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg",
};

const TG_DATA = {
  courses: [
    {
      label: "WebDesign",
      icon: TG_ICONS.html5,
      title: "Full Stack Development",
      desc: "Learn complete web development with real projects, expert mentors & placement support.",
      price: "₹15,000",
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Python",
      icon: TG_ICONS.python,
      title: "Python Mastery",
      desc: "Build strong Python fundamentals + projects. Data handling, APIs and automation.",
      price: "₹12,500",
      img: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Java",
      icon: TG_ICONS.java,
      title: "Java Development",
      desc: "Core Java to Advanced Java. OOP, collections, JDBC, and mini projects.",
      price: "₹13,500",
      img: "https://www.shutterstock.com/shutterstock/videos/3538302901/thumb/12.jpg?ip=x480",
      stars: 5,
    },
    {
      label: "React JS",
      icon: TG_ICONS.react,
      title: "React JS (Frontend)",
      desc: "Modern UI with React, components, hooks, routing, APIs, and responsive layouts.",
      price: "₹9,999",
      img: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Node JS",
      icon: TG_ICONS.node,
      title: "Node JS (Backend)",
      desc: "Build APIs with Node, Express, auth, databases, and deployment basics.",
      price: "₹10,999",
      img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "UI / UX",
      icon: TG_ICONS.figma,
      title: "UI/UX Design",
      desc: "Design thinking, wireframes, prototypes, and modern UI systems for web apps.",
      price: "₹8,500",
      img: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
  ],
  practice: [
    {
      label: "Frontend",
      icon: TG_ICONS.react,
      title: "Questions Series & Mock Interviews",
      desc: "Practice more. Learn faster. Improve coding skills and prepare for top IT careers.",
      price: "₹9,990",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Backend",
      icon: TG_ICONS.node,
      title: "Backend Practice Pack",
      desc: "APIs, databases, auth, performance & deployment — interview focused questions.",
      price: "₹8,990",
      img: "https://images.unsplash.com/photo-1555066932-e78dd8fb77bb?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Full Stack",
      icon: TG_ICONS.github,
      title: "Full Stack Interview Kit",
      desc: "Frontend + backend + system thinking with curated interview patterns.",
      price: "₹11,990",
      img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Python",
      icon: TG_ICONS.python,
      title: "Python Practice Series",
      desc: "Logic building, file handling, APIs, mini projects and interview sets.",
      price: "₹5,990",
      img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "DevOps",
      icon: TG_ICONS.docker,
      title: "DevOps Scenario Questions",
      desc: "CI/CD, Docker, Kubernetes, monitoring, and real-world scenarios.",
      price: "₹10,990",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
  ],
  books: [
    {
      label: "Python",
      icon: TG_ICONS.python,
      title: "Python Beginner to Advanced",
      desc: "Structured learning with examples + exercises to build strong Python foundations.",
      price: "₹450",
      img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Web Dev",
      icon: TG_ICONS.html5,
      title: "Web Development Guide",
      desc: "HTML, CSS, JS + projects. Start from basics and build real pages.",
      price: "₹399",
      img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Java",
      icon: TG_ICONS.java,
      title: "Java Handbook",
      desc: "OOPs, collections, and core concepts explained with examples.",
      price: "₹499",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "React",
      icon: TG_ICONS.react,
      title: "React Quick Start",
      desc: "React fundamentals, hooks, routing, and UI patterns.",
      price: "₹550",
      img: "https://images.unsplash.com/photo-1551650975-7a24f7f9f7b1?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Node",
      icon: TG_ICONS.node,
      title: "Node + API Design",
      desc: "Build REST APIs with best practices, auth and deployment.",
      price: "₹650",
      img: "https://images.unsplash.com/photo-1555949963-7aa78ddee0df?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
    {
      label: "Book",
      icon: TG_ICONS.book,
      title: "Project Practice Book",
      desc: "Mini to major projects to strengthen your logic & confidence.",
      price: "₹599",
      img: "https://images.unsplash.com/photo-1526374870839-e155464bb9b2?auto=format&fit=crop&w=900&q=80",
      stars: 5,
    },
  ],
};

function tgStars(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += `<span class="tgStar"></span>`;
  return out;
}

function tgSetCard(item, ids) {
  document.getElementById(ids.img).src = item.img;
  document.getElementById(ids.title).textContent = item.title;
  document.getElementById(ids.desc).textContent = item.desc;
  document.getElementById(ids.price).textContent = item.price;
  document.getElementById(ids.stars).innerHTML = tgStars(item.stars);
  document.getElementById(ids.btn).onclick = () =>
    alert(`${item.title}\n${item.price}\n\n(Explore Click Working ✅)`);
}

function tgMount(sectionKey, pillsEl, ids) {
  const list = TG_DATA[sectionKey];

  pillsEl.innerHTML = list
    .map(
      (it, idx) => `
      <div class="tgPill ${idx === 0 ? "active" : ""}" data-idx="${idx}">
        <div class="tgLogo">
          <img src="${it.icon}" alt="${it.label} logo">
          <span class="tgFallback">${(it.label || "X").slice(0, 2).toUpperCase()}</span>
        </div>
        <span class="tgPillText">${it.label}</span>
      </div>
    `,
    )
    .join("");

  pillsEl.querySelectorAll(".tgLogo img").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.display = "none";
      const fb = img.parentElement.querySelector(".tgFallback");
      if (fb) fb.style.display = "block";
    });
  });

  tgSetCard(list[0], ids);

  pillsEl.addEventListener("click", (e) => {
    const pill = e.target.closest(".tgPill");
    if (!pill) return;
    const idx = Number(pill.dataset.idx);

    pillsEl
      .querySelectorAll(".tgPill")
      .forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    tgSetCard(list[idx], ids);
  });
}

tgMount("courses", document.getElementById("tgPillsCourses"), {
  img: "tgImgCourses",
  title: "tgTitleCourses",
  desc: "tgDescCourses",
  price: "tgPriceCourses",
  stars: "tgStarsCourses",
  btn: "tgBtnCourses",
});
tgMount("practice", document.getElementById("tgPillsPractice"), {
  img: "tgImgPractice",
  title: "tgTitlePractice",
  desc: "tgDescPractice",
  price: "tgPricePractice",
  stars: "tgStarsPractice",
  btn: "tgBtnPractice",
});
tgMount("books", document.getElementById("tgPillsBooks"), {
  img: "tgImgBooks",
  title: "tgTitleBooks",
  desc: "tgDescBooks",
  price: "tgPriceBooks",
  stars: "tgStarsBooks",
  btn: "tgBtnBooks",
});

document.querySelectorAll("[data-tg-seeall]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    alert(`SEE ALL → ${a.dataset.tgSeeall.toUpperCase()} (Working ✅)`);
  });
});

// reveal
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll(".tg-reveal");
  if (reduce) {
    els.forEach((el) => el.classList.add("show"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("show");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.16 },
  );
  els.forEach((el) => io.observe(el));
})();

/* =========================
           7 Testimonials (Images + Logos)
        ========================== */
const TG_TESTIMONIALS = [
  {
    name: "Gloria Rose",
    role: "UI Designer",
    company: "Google",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg",
    heroImg:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    quote:
      "Training was practical and structured. I improved my portfolio and started getting interview calls within weeks.",
    stars: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Full Stack Trainee",
    company: "Microsoft",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg",
    heroImg:
      "https://images.unsplash.com/photo-1520975958225-25b3a57c3f74?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1520975958225-25b3a57c3f74?auto=format&fit=crop&w=300&q=80",
    quote:
      "Projects + mentor support was the best part. I finally understood APIs, auth, and deployment in a clean way.",
    stars: 5,
  },
  {
    name: "Neha Sharma",
    role: "Python Learner",
    company: "Amazon",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
    heroImg:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=300&q=80",
    quote:
      "Python concepts became super clear. Practice sets were interview-focused and improved my speed a lot.",
    stars: 5,
  },
  {
    name: "Rohit Verma",
    role: "Frontend Developer",
    company: "Meta",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg",
    heroImg:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    quote:
      "UI improvements and component thinking changed everything. Now I build clean responsive pages confidently.",
    stars: 5,
  },
  {
    name: "Simran Kaur",
    role: "QA / Testing",
    company: "IBM",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ibm/ibm-original.svg",
    heroImg:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    quote:
      "Mock interviews + test case practice was amazing. I learned bug reporting and automation basics properly.",
    stars: 5,
  },
  {
    name: "Aman Singh",
    role: "DevOps Beginner",
    company: "Docker",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    heroImg:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80",
    quote:
      "CI/CD and Docker became easy. The scenario questions were exactly what companies ask in real interviews.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "UI/UX Student",
    company: "Figma",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
    heroImg:
      "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=300&q=80",
    quote:
      "Wireframes to prototypes — everything was guided. My designs look professional and consistent now.",
    stars: 5,
  },
];

const els = {
  hero: document.getElementById("tgHeroImg"),
  avatar: document.getElementById("tgAvatar"),
  quote: document.getElementById("tgQuote"),
  name: document.getElementById("tgName"),
  role: document.getElementById("tgRole"),
  logo: document.getElementById("tgLogo"),
  company: document.getElementById("tgCompany"),
  stars: document.getElementById("tgStars"),
  prev: document.getElementById("tgPrev"),
  next: document.getElementById("tgNext"),
  dots: document.getElementById("tgDots"),
  photoWrap: document.getElementById("tgPhotoWrap"),
  card: document.getElementById("tgCard"),
  writeBtn: document.getElementById("tgWriteBtn"),
  panel: document.getElementById("tgTestiPanel"),
};

let idx = 0;

function starHTML(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += `<span class="star"></span>`;
  return out;
}

function renderDots() {
  els.dots.innerHTML = TG_TESTIMONIALS.map(
    (_, i) =>
      `<button class="dot ${i === idx ? "active" : ""}" type="button" aria-label="Go to testimonial ${i + 1}" data-dot="${i}"></button>`,
  ).join("");
}

function animateSwap() {
  [els.photoWrap, els.card].forEach((el) => {
    el.classList.remove("fadeSwap");
    void el.offsetWidth;
    el.classList.add("fadeSwap");
  });
}

function setTestimonial(i) {
  idx = (i + TG_TESTIMONIALS.length) % TG_TESTIMONIALS.length;
  const t = TG_TESTIMONIALS[idx];

  els.hero.src = t.heroImg;
  els.avatar.src = t.avatar;
  els.quote.textContent = `"${t.quote}"`;
  els.name.textContent = t.name;
  els.role.textContent = t.role;
  els.logo.src = t.logo;
  els.company.textContent = t.company;
  els.stars.innerHTML = starHTML(t.stars);

  renderDots();
  animateSwap();
}

els.prev.addEventListener("click", () => setTestimonial(idx - 1));
els.next.addEventListener("click", () => setTestimonial(idx + 1));

els.dots.addEventListener("click", (e) => {
  const b = e.target.closest("[data-dot]");
  if (!b) return;
  setTestimonial(Number(b.dataset.dot));
});

// Optional: keyboard support
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") setTestimonial(idx - 1);
  if (e.key === "ArrowRight") setTestimonial(idx + 1);
});

// Write button demo
els.writeBtn.addEventListener("click", () => {
  alert(
    "Write your assessment (demo) ✅\n\nNext step: open a form / modal here.",
  );
});

// Init
setTestimonial(0);

// Reveal on scroll
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(".tgTesti .reveal");
  if (reduce) {
    targets.forEach((t) => t.classList.add("show"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("show");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.16 },
  );
  targets.forEach((t) => io.observe(t));
})();

// Optional demo: card click
document.querySelectorAll(".tgNewsCard").forEach((card) => {
  card.addEventListener("click", (e) => {
    const read = e.target.closest("[data-readmore]");
    if (read) e.preventDefault();
    alert(
      "Open News Details (Demo) ✅\n\nNext: yaha aap link / page open kara sakte ho.",
    );
  });
});

// reveal on scroll
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll(".tgNews .reveal");
  if (reduce) {
    els.forEach((el) => el.classList.add("show"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("show");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.16 },
  );
  els.forEach((el) => io.observe(el));
})();

(() => {
  const footer = document.querySelector(".tg-footer");
  if (!footer) return;

  /* reveal animation */
  const items = footer.querySelectorAll(
    ".tg-footer-contact-bar, .tg-newsletter-section, .tg-footer-col, .tg-footer-bottom",
  );

  items.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = `.7s ease ${i * 80}ms`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.15 },
  );

  items.forEach((el) => io.observe(el));

  /* newsletter submit */
  const form = footer.querySelector(".tg-big-sub-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Subscribed successfully!");
      form.reset();
    });
  }
})();
