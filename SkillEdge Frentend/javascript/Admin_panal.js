/* =========================
  UTIL + STATE
========================= */
const LS_KEY = "skilledge_admin_final_mix";
const uid = () =>
  "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
const rand6 = () => Math.floor(100000 + Math.random() * 900000);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
const todayISO = (off = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + off);
  return d.toISOString().slice(0, 10);
};
const money = (n) => "₹ " + Number(n || 0).toLocaleString("en-IN");
const $ = (q) => document.querySelector(q);

const defaultState = {
  meta: {
    institute: "SkillEdge IT Training",
    email: "support@skilledge.com",
    currency: "INR",
    tz: "Asia/Kolkata",
  },
  security: { twoFA: "Off", policy: "Standard", timeout: 30, attempts: 5 },
  rule: {
    minAttendance: 75,
    scope: "All Courses",
    note: "Students must maintain minimum attendance to be eligible for exams.",
  },

  categories: [
    { id: uid(), name: "Programming", visibility: "Public" },
    { id: uid(), name: "Data", visibility: "Public" },
  ],
  courses: [
    {
      id: uid(),
      title: "Python + DSA",
      category: "Programming",
      price: 7999,
      duration: "8 Weeks",
      status: "Published",
      desc: "From fundamentals to interview-ready.",
    },
    {
      id: uid(),
      title: "Full Stack Web",
      category: "Programming",
      price: 9999,
      duration: "10 Weeks",
      status: "Published",
      desc: "HTML/CSS/JS + real projects.",
    },
  ],
  students: [
    {
      id: uid(),
      roll: "SE-101",
      name: "Anjali Verma",
      batch: "Jan-2026",
      fees: "Pending",
      phone: "9876543210",
      email: "anjali@gmail.com",
      course: "Python + DSA",
      status: "Active",
      join: todayISO(-20),
    },
    {
      id: uid(),
      roll: "SE-102",
      name: "Rohit Sharma",
      batch: "Jan-2026",
      fees: "Paid",
      phone: "9123456780",
      email: "rohit@gmail.com",
      course: "Full Stack Web",
      status: "Active",
      join: todayISO(-12),
    },
  ],

  attendanceSessions: [], // {id,course,date,sessionName,presentIds[]}
  exams: [], // {id,name,course,date,max,pass,minAtt}
  results: [], // {id,examId,studentId,marks}

  payments: [
    {
      id: uid(),
      student: "Rohit Sharma",
      course: "Full Stack Web",
      amount: 9999,
      type: "One-time",
      mode: "UPI",
      status: "Paid",
      date: todayISO(-2),
      ref: "SE-" + rand6(),
    },
    {
      id: uid(),
      student: "Anjali Verma",
      course: "Python + DSA",
      amount: 7999,
      type: "Subscription",
      mode: "Card",
      status: "Pending",
      date: todayISO(-1),
      ref: "SE-" + rand6(),
    },
  ],

  users: [
    {
      id: uid(),
      name: "SkillEdge Super Admin",
      email: "admin@skilledge.com",
      phone: "9999999999",
      role: "Admin",
      status: "Active",
      perm: "Full",
    },
  ],

  templates: [
    {
      id: uid(),
      name: "SkillEdge Completion Certificate",
      isDefault: "Yes",
      color: "#C9A24D",
      signatory: "Director, SkillEdge",
      logoText: "SkillEdge",
      body: "This is to certify that {STUDENT_NAME} has successfully completed the course {COURSE_NAME} at SkillEdge.",
    },
  ],
};

function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}
let state = loadState();

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  refreshAll();
}

/* =========================
  UI HELPERS
========================= */
const toastEl = $("#toast");
const toast = (m) => {
  toastEl.textContent = m;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1100);
};

$("#todayDate").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
});
$("#sJoin").value = todayISO(0);
$("#aDate").value = todayISO(0);
$("#pDate").value = todayISO(0);
$("#exDate").value = todayISO(7);

/* sidebar toggle (mobile) */
const sidebar = $("#sidebar");
$("#toggleBtn").addEventListener("click", () =>
  sidebar.classList.toggle("open"),
);
document.addEventListener("click", (e) => {
  if (!matchMedia("(max-width: 980px)").matches) return;
  const inside =
    sidebar.contains(e.target) || $("#toggleBtn").contains(e.target);
  if (!inside) sidebar.classList.remove("open");
});

/* accordion open/close (no sidebar scroll) */
document.querySelectorAll(".accHead").forEach((h) => {
  h.addEventListener("click", () => {
    h.parentElement.classList.toggle("open");
  });
});

/* search modules (keeps no scroll; just hide items) */
$("#sideSearchInput").addEventListener("input", () => {
  const q = $("#sideSearchInput").value.toLowerCase().trim();
  document.querySelectorAll(".item").forEach((it) => {
    const key = (it.dataset.key || "").toLowerCase();
    it.style.display = key.includes(q) ? "" : "none";
  });
});

/* modal */
const modalBack = $("#modalBack");
const closeModal = () => modalBack.classList.remove("show");
$("#closeModal").addEventListener("click", closeModal);
modalBack.addEventListener("click", (e) => {
  if (e.target === modalBack) closeModal();
});
const openModal = (t, html) => {
  $("#modalTitle").textContent = t;
  $("#modalBody").innerHTML = html;
  modalBack.classList.add("show");
};

/* help + notifications */
$("#helpBtn").addEventListener("click", () => {
  openModal(
    "SkillEdge Admin – Help",
    `
    <div class="hint">
      <b>Modules included:</b><br>
      Dashboard, Reports (PDF/Excel), Students, Courses & Categories, Attendance, Exams (Export), Payments (Subscriptions), Certificates (Templates), Users & Roles (RBAC), HR Rule (Min Attendance), System & Security.<br><br>
      <b>Suggested Flow:</b> Courses → Students → Attendance → HR Rule → Exams → Payments → Reports Export
    </div>
  `,
  );
});
$("#notifyBtn").addEventListener("click", () => toast("Notifications (demo)"));
$("#resetDemo").addEventListener("click", () => {
  localStorage.removeItem(LS_KEY);
  state = structuredClone(defaultState);
  refreshAll();
  toast("Reset done");
});

/* nav */
const subMap = {
  dash: "Premium analytics + clean layout",
  reports: "Revenue reports + PDF/Excel export",
  students: "Enrollment + fees status",
  courses: "Categories + course catalog",
  attendance: "Sessions + month filter",
  exams: "Eligibility + results export",
  payments: "Invoices + subscriptions",
  cert: "Certificate templates",
  users: "RBAC role management",
  rules: "Minimum attendance rule",
  system: "Configuration + security",
};

document.querySelectorAll(".item").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".item")
      .forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    const sec = item.dataset.sec;
    document
      .querySelectorAll(".section")
      .forEach((s) => s.classList.remove("active"));
    $("#sec-" + sec).classList.add("active");

    $("#pageTitle").textContent = item
      .querySelector(".label b")
      .textContent.trim();
    $("#pageSub").textContent = subMap[sec] || "SkillEdge Admin";

    if (matchMedia("(max-width: 980px)").matches)
      sidebar.classList.remove("open");
  });
});

function clickNav(sec) {
  const it = document.querySelector(`.item[data-sec="${sec}"]`);
  if (it) it.click();
}

/* global search (table filter) */
$("#globalSearch").addEventListener("input", () => {
  const q = $("#globalSearch").value.toLowerCase().trim();
  [
    "#studentsTbody",
    "#courseTbody",
    "#payTbody",
    "#usersTbody",
    "#tplTbody",
    "#reportTbody",
    "#catTbody",
    "#examsTbody",
    "#resultsTbody",
  ].forEach((sel) => filterTable(sel, q));
});
function filterTable(tbodySel, q) {
  const tb = document.querySelector(tbodySel);
  if (!tb) return;
  [...tb.querySelectorAll("tr")].forEach((tr) => {
    tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

/* quick actions */
$("#qaAddStudent").addEventListener("click", () => clickNav("students"));
$("#qaAddPayment").addEventListener("click", () => clickNav("payments"));
$("#qaMarkAttendance").addEventListener("click", () => clickNav("attendance"));
$("#stAddBtnTop").addEventListener("click", () => $("#addStudentBtn").click());
$("#addPayTop").addEventListener("click", () => $("#addPayBtn").click());
$("#createExamBtn").addEventListener("click", () => {
  clickNav("exams");
  $("#exName").focus();
});
$("#goAddCourse").addEventListener("click", () => {
  clickNav("courses");
  $("#cTitle").focus();
});

/* =========================
  KPI + CHARTS
========================= */
let revChart = null,
  payChart = null;
function monthPrefix(d) {
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-`;
}
function renderKPI() {
  $("#kpiStudents").textContent = state.students.length;
  $("#pillStudents").textContent = state.students.length;

  const activeCourses = state.courses.filter(
    (c) => c.status === "Published",
  ).length;
  $("#kpiCourses").textContent = activeCourses;
  $("#pillCourses").textContent = state.courses.filter(
    (c) => c.status !== "Archived",
  ).length;

  const pref = monthPrefix(new Date());
  const paidThisMonth = state.payments
    .filter((p) => p.status === "Paid" && (p.date || "").startsWith(pref))
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending = state.payments
    .filter((p) => p.status === "Pending")
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  $("#kpiRevenue").textContent = money(paidThisMonth);
  $("#kpiPending").textContent = money(pending);
  $("#pillRule").textContent = (state.rule.minAttendance || 75) + "%";
}
function buildCharts() {
  if (revChart) revChart.destroy();
  if (payChart) payChart.destroy();

  const labels = [],
    data = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(
      d.toLocaleString("en-IN", { month: "short" }) + " " + d.getFullYear(),
    );
    const pref = monthPrefix(d);
    const sum = state.payments
      .filter((p) => p.status === "Paid" && (p.date || "").startsWith(pref))
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    data.push(sum);
  }
  revChart = new Chart($("#revChart"), {
    type: "line",
    data: { labels, datasets: [{ label: "Revenue", data, tension: 0.35 }] },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } },
    },
  });

  const paid = state.payments
    .filter((p) => p.status === "Paid")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const pend = state.payments
    .filter((p) => p.status === "Pending")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  payChart = new Chart($("#payChart"), {
    type: "doughnut",
    data: { labels: ["Paid", "Pending"], datasets: [{ data: [paid, pend] }] },
    options: { responsive: true, plugins: { legend: { display: true } } },
  });
}

/* =========================
  DROPDOWNS
========================= */
function fillCourseDropdowns() {
  const published = state.courses.filter((c) => c.status !== "Archived");
  const courseOptions = published
    .map((c) => `<option value="${esc(c.title)}">${esc(c.title)}</option>`)
    .join("");

  $("#sCourse").innerHTML =
    courseOptions || `<option value="">Add a course first</option>`;
  $("#aCourse").innerHTML =
    courseOptions || `<option value="">Add a course first</option>`;
  $("#exCourse").innerHTML =
    courseOptions || `<option value="">Add a course first</option>`;
  $("#pCourse").innerHTML =
    courseOptions || `<option value="">Add a course first</option>`;

  $("#cCat").innerHTML =
    state.categories
      .map(
        (cat) => `<option value="${esc(cat.name)}">${esc(cat.name)}</option>`,
      )
      .join("") || `<option value="">Add a category first</option>`;
  $("#pStudent").innerHTML =
    state.students
      .map(
        (s) =>
          `<option value="${s.id}">${esc(s.roll)} • ${esc(s.name)}</option>`,
      )
      .join("") || `<option value="">Add students first</option>`;
}

/* =========================
  STUDENTS CRUD
========================= */
let selStudentId = null;
function renderStudents() {
  const tb = $("#studentsTbody");
  tb.innerHTML = "";
  state.students.forEach((st) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(st.roll || "-")}</td>
      <td>${esc(st.name)}</td>
      <td>${esc(st.batch || "-")}</td>
      <td>${esc(st.course)}</td>
      <td><span class="tag"><span class="dot"></span>${esc(st.fees || "-")}</span></td>
      <td><span class="tag"><span class="dot"></span>${esc(st.status)}</span></td>
      <td>${esc(st.phone || "-")}</td>
      <td>${esc(st.email || "-")}</td>
      <td>${esc(st.join || "-")}</td>
    `;
    tr.addEventListener("click", () => {
      selStudentId = st.id;
      $("#sRoll").value = st.roll || "";
      $("#sBatch").value = st.batch || "";
      $("#sFees").value = st.fees || "Pending";
      $("#sName").value = st.name;
      $("#sPhone").value = st.phone || "";
      $("#sEmail").value = st.email || "";
      $("#sCourse").value = st.course || "";
      $("#sStatus").value = st.status || "Active";
      $("#sJoin").value = st.join || todayISO(0);
      $("#updateStudentBtn").disabled = false;
      $("#deleteStudentBtn").disabled = false;
      toast("Student selected");
    });
    tb.appendChild(tr);
  });
}
function clearStudentForm() {
  selStudentId = null;
  $("#sRoll").value = "";
  $("#sBatch").value = "";
  $("#sFees").value = "Paid";
  $("#sName").value = "";
  $("#sPhone").value = "";
  $("#sEmail").value = "";
  $("#sStatus").value = "Active";
  $("#sJoin").value = todayISO(0);
  $("#updateStudentBtn").disabled = true;
  $("#deleteStudentBtn").disabled = true;
}
$("#stClearSel").addEventListener("click", () => {
  clearStudentForm();
  toast("Selection cleared");
});

$("#addStudentBtn").addEventListener("click", () => {
  const name = $("#sName").value.trim();
  const course = $("#sCourse").value;
  if (!name || !course) return toast("Name & Course are required");

  state.students.unshift({
    id: uid(),
    roll: $("#sRoll").value.trim() || "SE-" + rand6(),
    batch: $("#sBatch").value.trim() || "Batch",
    fees: $("#sFees").value,
    name,
    phone: $("#sPhone").value.trim(),
    email: $("#sEmail").value.trim(),
    course,
    status: $("#sStatus").value,
    join: $("#sJoin").value || todayISO(0),
  });
  clearStudentForm();
  saveState();
  toast("Student added");
});
$("#updateStudentBtn").addEventListener("click", () => {
  if (!selStudentId) return;
  const st = state.students.find((x) => x.id === selStudentId);
  if (!st) return;

  st.roll = $("#sRoll").value.trim();
  st.batch = $("#sBatch").value.trim();
  st.fees = $("#sFees").value;
  st.name = $("#sName").value.trim();
  st.phone = $("#sPhone").value.trim();
  st.email = $("#sEmail").value.trim();
  st.course = $("#sCourse").value;
  st.status = $("#sStatus").value;
  st.join = $("#sJoin").value || todayISO(0);

  clearStudentForm();
  saveState();
  toast("Student updated");
});
$("#deleteStudentBtn").addEventListener("click", () => {
  if (!selStudentId) return;
  state.attendanceSessions.forEach(
    (s) =>
      (s.presentIds = (s.presentIds || []).filter((id) => id !== selStudentId)),
  );
  state.results = state.results.filter((r) => r.studentId !== selStudentId);
  state.students = state.students.filter((x) => x.id !== selStudentId);
  clearStudentForm();
  saveState();
  toast("Student deleted");
});

/* =========================
  CATEGORIES + COURSES
========================= */
let selCatId = null,
  selCourseId = null;

function renderCategories() {
  const tb = $("#catTbody");
  tb.innerHTML = "";
  state.categories.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${esc(c.name)}</td><td>${esc(c.visibility)}</td>`;
    tr.addEventListener("click", () => {
      selCatId = c.id;
      $("#catName").value = c.name;
      $("#catVis").value = c.visibility;
      $("#delCatBtn").disabled = false;
      toast("Category selected");
    });
    tb.appendChild(tr);
  });
}
$("#addCatBtn").addEventListener("click", () => {
  const name = $("#catName").value.trim();
  if (!name) return toast("Category name required");
  if (state.categories.some((c) => c.name.toLowerCase() === name.toLowerCase()))
    return toast("Category already exists");
  state.categories.push({ id: uid(), name, visibility: $("#catVis").value });
  selCatId = null;
  $("#delCatBtn").disabled = true;
  $("#catName").value = "";
  saveState();
  toast("Category added");
});
$("#delCatBtn").addEventListener("click", () => {
  if (!selCatId) return;
  const cat = state.categories.find((c) => c.id === selCatId);
  if (!cat) return;
  if (state.courses.some((c) => c.category === cat.name))
    return toast("Cannot delete: Category used by courses");
  state.categories = state.categories.filter((c) => c.id !== selCatId);
  selCatId = null;
  $("#delCatBtn").disabled = true;
  $("#catName").value = "";
  saveState();
  toast("Category deleted");
});

function renderCourses() {
  const tb = $("#courseTbody");
  tb.innerHTML = "";
  state.courses.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(c.title)}</td><td>${esc(c.category)}</td><td>${money(c.price)}</td>
      <td>${esc(c.duration)}</td><td><span class="tag"><span class="dot"></span>${esc(c.status)}</span></td>
    `;
    tr.addEventListener("click", () => {
      selCourseId = c.id;
      $("#cTitle").value = c.title;
      $("#cCat").value = c.category;
      $("#cPrice").value = c.price;
      $("#cDur").value = c.duration;
      $("#cStatus").value = c.status;
      $("#cDesc").value = c.desc || "";
      $("#updateCourseBtn").disabled = false;
      $("#archiveCourseBtn").disabled = false;
      toast("Course selected");
    });
    tb.appendChild(tr);
  });
}
function clearCourseForm() {
  selCourseId = null;
  $("#cTitle").value = "";
  $("#cPrice").value = "";
  $("#cDur").value = "";
  $("#cStatus").value = "Published";
  $("#cDesc").value = "";
  $("#updateCourseBtn").disabled = true;
  $("#archiveCourseBtn").disabled = true;
}
$("#addCourseBtn").addEventListener("click", () => {
  const title = $("#cTitle").value.trim();
  const category = $("#cCat").value;
  if (!title || !category) return toast("Title & Category required");
  state.courses.unshift({
    id: uid(),
    title,
    category,
    price: Number($("#cPrice").value || 0),
    duration: $("#cDur").value.trim(),
    status: $("#cStatus").value,
    desc: $("#cDesc").value.trim(),
  });
  clearCourseForm();
  saveState();
  toast("Course added");
});
$("#updateCourseBtn").addEventListener("click", () => {
  if (!selCourseId) return;
  const c = state.courses.find((x) => x.id === selCourseId);
  if (!c) return;
  const oldTitle = c.title;

  c.title = $("#cTitle").value.trim();
  c.category = $("#cCat").value;
  c.price = Number($("#cPrice").value || 0);
  c.duration = $("#cDur").value.trim();
  c.status = $("#cStatus").value;
  c.desc = $("#cDesc").value.trim();

  if (oldTitle !== c.title) {
    state.students.forEach((s) => {
      if (s.course === oldTitle) s.course = c.title;
    });
    state.payments.forEach((p) => {
      if (p.course === oldTitle) p.course = c.title;
    });
    state.exams.forEach((ex) => {
      if (ex.course === oldTitle) ex.course = c.title;
    });
    state.attendanceSessions.forEach((ss) => {
      if (ss.course === oldTitle) ss.course = c.title;
    });
  }

  clearCourseForm();
  saveState();
  toast("Course updated");
});
$("#archiveCourseBtn").addEventListener("click", () => {
  if (!selCourseId) return;
  const c = state.courses.find((x) => x.id === selCourseId);
  if (!c) return;
  c.status = "Archived";
  clearCourseForm();
  saveState();
  toast("Course archived");
});

/* =========================
  ATTENDANCE
========================= */
function monthOptions() {
  const now = new Date();
  const arr = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
    arr.push({ val, label });
  }
  $("#aMonth").innerHTML = arr
    .map((x) => `<option value="${x.val}">${x.label}</option>`)
    .join("");
}
monthOptions();

function getCourseStudents(course) {
  return state.students.filter(
    (s) => s.course === course && s.status === "Active",
  );
}
function attendancePercent(studentId, course) {
  const sessions = state.attendanceSessions.filter((s) => s.course === course);
  if (sessions.length === 0) return 0;
  let present = 0;
  sessions.forEach((s) => {
    if ((s.presentIds || []).includes(studentId)) present++;
  });
  return Math.round((present / sessions.length) * 100);
}
function updateMonthSessionsCount() {
  const course = $("#aCourse").value;
  const month = $("#aMonth").value; // YYYY-MM
  const total = state.attendanceSessions.filter(
    (s) => s.course === course && (s.date || "").startsWith(month),
  ).length;
  $("#aTotalSessions").value = total;
}
$("#aCourse").addEventListener("change", updateMonthSessionsCount);
$("#aMonth").addEventListener("change", updateMonthSessionsCount);
$("#aDate").addEventListener("change", () => {
  const ym = ($("#aDate").value || todayISO()).slice(0, 7);
  $("#aMonth").value = ym;
  updateMonthSessionsCount();
});

function renderAttendanceTable() {
  const course = $("#aCourse").value;
  const list = getCourseStudents(course);
  const tb = $("#attendanceTbody");
  tb.innerHTML = "";

  const date = $("#aDate").value || todayISO(0);
  const existing = state.attendanceSessions.find(
    (x) => x.course === course && x.date === date,
  );
  const presentIds = existing ? existing.presentIds || [] : [];

  let p = 0,
    a = 0;
  list.forEach((st) => {
    const isPresent = presentIds.includes(st.id);
    if (isPresent) p++;
    else a++;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="width:90px"><input type="checkbox" ${isPresent ? "checked" : ""} data-id="${st.id}" style="width:18px;height:18px;cursor:pointer;"></td>
      <td>${esc(st.roll || "-")}</td>
      <td>${esc(st.name)}</td>
      <td>${esc(course)}</td>
      <td><span class="tag"><span class="dot"></span>${attendancePercent(st.id, course)}%</span></td>
    `;
    tb.appendChild(tr);
  });

  $("#aPresent").textContent = p;
  $("#aAbsent").textContent = a;

  tb.addEventListener(
    "change",
    () => {
      const checks = [...tb.querySelectorAll('input[type="checkbox"]')];
      const pp = checks.filter((x) => x.checked).length;
      $("#aPresent").textContent = pp;
      $("#aAbsent").textContent = checks.length - pp;
    },
    { once: true },
  );
}

$("#loadAttendance").addEventListener("click", () => {
  if (!$("#aCourse").value) return toast("Select a course first");
  $("#aMonth").value = ($("#aDate").value || todayISO()).slice(0, 7);
  updateMonthSessionsCount();
  renderAttendanceTable();
  toast("Students loaded");
});
$("#saveAttendance").addEventListener("click", () => {
  const course = $("#aCourse").value;
  const date = $("#aDate").value || todayISO(0);
  const sessionName = $("#aSession").value.trim() || "Session";
  if (!course) return toast("Select a course first");

  const presentIds = [
    ...$("#attendanceTbody").querySelectorAll('input[type="checkbox"]'),
  ]
    .filter((ch) => ch.checked)
    .map((ch) => ch.getAttribute("data-id"));

  const idx = state.attendanceSessions.findIndex(
    (x) => x.course === course && x.date === date,
  );
  if (idx >= 0) {
    state.attendanceSessions[idx].presentIds = presentIds;
    state.attendanceSessions[idx].sessionName = sessionName;
  } else {
    state.attendanceSessions.unshift({
      id: uid(),
      course,
      date,
      sessionName,
      presentIds,
    });
  }

  saveState();
  updateMonthSessionsCount();
  renderAttendanceTable();
  toast("Attendance saved");
});

/* =========================
  EXAMS + EXPORT
========================= */
let selExamId = null;

function renderExams() {
  const tb = $("#examsTbody");
  tb.innerHTML = "";
  state.exams.forEach((ex) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(ex.name)}</td><td>${esc(ex.course)}</td><td>${esc(ex.date)}</td>
      <td><span class="tag"><span class="dot"></span>${ex.minAtt}%</span></td>
      <td>${ex.pass}/${ex.max}</td>
    `;
    tr.addEventListener("click", () => {
      selExamId = ex.id;
      toast("Exam selected");
      renderEligibleResults();
    });
    tb.appendChild(tr);
  });
}

function renderEligibleResults() {
  const tb = $("#resultsTbody");
  tb.innerHTML = "";
  const ex = state.exams.find((x) => x.id === selExamId);
  if (!ex) {
    tb.innerHTML = `<tr><td colspan="6" style="color:#6B7280">Select an exam first.</td></tr>`;
    return;
  }

  const students = getCourseStudents(ex.course);
  if (students.length === 0) {
    tb.innerHTML = `<tr><td colspan="6" style="color:#6B7280">No active students in this course.</td></tr>`;
    return;
  }

  students.forEach((st) => {
    const att = attendancePercent(st.id, ex.course);
    const eligible = att >= ex.minAtt;
    const prev = state.results.find(
      (r) => r.examId === ex.id && r.studentId === st.id,
    );
    const marks = prev ? prev.marks : "";

    const status =
      marks !== "" && marks !== null && marks !== undefined
        ? Number(marks) >= ex.pass
          ? "Pass"
          : "Fail"
        : eligible
          ? "Eligible"
          : "Blocked";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${eligible ? "✅" : "❌"}</td>
      <td>${esc(st.roll || "-")}</td>
      <td>${esc(st.name)}</td>
      <td><span class="tag"><span class="dot"></span>${att}%</span></td>
      <td style="width:140px">
        <input type="number" min="0" max="${ex.max}" ${eligible ? "" : "disabled"}
          value="${esc(marks)}" data-st="${st.id}"
          style="width:110px;padding:10px 10px;border-radius:14px;border:1px solid rgba(11,37,69,.14);background:rgba(255,255,255,.88);">
      </td>
      <td><span class="tag"><span class="dot"></span>${status}</span></td>
    `;
    tb.appendChild(tr);
  });
}

$("#saveExamBtn").addEventListener("click", () => {
  const name = $("#exName").value.trim();
  const course = $("#exCourse").value;
  if (!name || !course) return toast("Exam name & course are required");

  state.exams.unshift({
    id: uid(),
    name,
    course,
    date: $("#exDate").value || todayISO(7),
    max: Number($("#exMax").value || 100),
    pass: Number($("#exPass").value || 40),
    minAtt: Number($("#exMinAtt").value || state.rule.minAttendance || 75),
  });
  clearExamForm();
  saveState();
  toast("Exam saved");
});
$("#clearExamForm").addEventListener("click", clearExamForm);
function clearExamForm() {
  $("#exName").value = "";
  $("#exDate").value = todayISO(7);
  $("#exMax").value = 100;
  $("#exPass").value = 40;
  $("#exMinAtt").value = state.rule.minAttendance || 75;
}
$("#loadEligibleBtn").addEventListener("click", () => {
  if (!selExamId) return toast("Select an exam first");
  renderEligibleResults();
  toast("Eligible list loaded");
});
$("#saveResultsBtn").addEventListener("click", () => {
  const ex = state.exams.find((x) => x.id === selExamId);
  if (!ex) return toast("Select an exam first");

  const inputs = [
    ...$("#resultsTbody").querySelectorAll('input[type="number"]'),
  ];
  inputs.forEach((inp) => {
    const sid = inp.getAttribute("data-st");
    const val = inp.value;
    if (val === "") return;
    const marks = Number(val);
    const idx = state.results.findIndex(
      (r) => r.examId === ex.id && r.studentId === sid,
    );
    if (idx >= 0) state.results[idx].marks = marks;
    else
      state.results.push({ id: uid(), examId: ex.id, studentId: sid, marks });
  });
  saveState();
  renderEligibleResults();
  toast("Results saved");
});

function examReportRows() {
  const ex = state.exams.find((x) => x.id === selExamId);
  if (!ex) return { ex: null, rows: [] };

  const students = getCourseStudents(ex.course);
  const rows = students.map((st) => {
    const att = attendancePercent(st.id, ex.course);
    const eligible = att >= ex.minAtt ? "Yes" : "No";
    const res = state.results.find(
      (r) => r.examId === ex.id && r.studentId === st.id,
    );
    const marks = res?.marks ?? "";
    const status =
      marks !== "" && marks !== null && marks !== undefined
        ? Number(marks) >= ex.pass
          ? "Pass"
          : "Fail"
        : eligible === "Yes"
          ? "Eligible"
          : "Blocked";

    return {
      Roll: st.roll || "-",
      Student: st.name,
      Attendance: att + "%",
      Eligible: eligible,
      Marks: marks,
      Status: status,
    };
  });

  return { ex, rows };
}

$("#exportExamPDF").addEventListener("click", () => {
  const { ex, rows } = examReportRows();
  if (!ex) return toast("Select an exam first");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text(`SkillEdge – Exam Results`, 40, 50);
  doc.setFontSize(10);
  doc.text(
    `Exam: ${ex.name} | Course: ${ex.course} | Date: ${ex.date}`,
    40,
    70,
  );

  const head = [
    ["Roll", "Student", "Attendance", "Eligible", "Marks", "Status"],
  ];
  const body = rows.map((r) => [
    r.Roll,
    r.Student,
    r.Attendance,
    r.Eligible,
    String(r.Marks),
    r.Status,
  ]);

  doc.autoTable({
    head,
    body,
    startY: 90,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [11, 37, 69] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 40, right: 40 },
  });

  doc.save(`SkillEdge_Exam_${ex.name.replaceAll(" ", "_")}.pdf`);
  toast("Exam PDF exported");
});

$("#exportExamExcel").addEventListener("click", () => {
  const { ex, rows } = examReportRows();
  if (!ex) return toast("Select an exam first");

  const sheetData = [
    ["Roll", "Student", "Attendance", "Eligible", "Marks", "Status"],
  ];
  rows.forEach((r) =>
    sheetData.push([
      r.Roll,
      r.Student,
      r.Attendance,
      r.Eligible,
      r.Marks,
      r.Status,
    ]),
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ExamResults");
  XLSX.writeFile(wb, `SkillEdge_Exam_${ex.name.replaceAll(" ", "_")}.xlsx`);
  toast("Exam Excel exported");
});

/* =========================
  PAYMENTS CRUD
========================= */
let selPayId = null;
function renderPayments() {
  const tb = $("#payTbody");
  tb.innerHTML = "";
  state.payments.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(p.student)}</td><td>${esc(p.course)}</td><td>${money(p.amount)}</td>
      <td><span class="tag"><span class="dot"></span>${esc(p.status)}</span></td>
      <td>${esc(p.date || "-")}</td><td>${esc(p.ref || "-")}</td>
    `;
    tr.addEventListener("click", () => {
      selPayId = p.id;
      const st = state.students.find((s) => s.name === p.student);
      if (st) $("#pStudent").value = st.id;
      $("#pCourse").value = p.course;
      $("#pAmount").value = p.amount;
      $("#pType").value = p.type;
      $("#pMode").value = p.mode;
      $("#pStatus").value = p.status;
      $("#pDate").value = p.date || todayISO(0);
      $("#pRef").value = p.ref || "";
      $("#updatePayBtn").disabled = false;
      $("#deletePayBtn").disabled = false;
      toast("Payment selected");
    });
    tb.appendChild(tr);
  });
}
function clearPayForm() {
  selPayId = null;
  $("#pAmount").value = "";
  $("#pType").value = "One-time";
  $("#pMode").value = "UPI";
  $("#pStatus").value = "Paid";
  $("#pDate").value = todayISO(0);
  $("#pRef").value = "";
  $("#updatePayBtn").disabled = true;
  $("#deletePayBtn").disabled = true;
}
$("#clearPaySel").addEventListener("click", () => {
  clearPayForm();
  toast("Selection cleared");
});

$("#addPayBtn").addEventListener("click", () => {
  const sid = $("#pStudent").value;
  const student = state.students.find((s) => s.id === sid)?.name;
  const course = $("#pCourse").value;
  const amount = Number($("#pAmount").value || 0);
  if (!student || !course || !amount)
    return toast("Student, course & amount are required");

  let ref = $("#pRef").value.trim();
  if (!ref) ref = "SE-" + rand6();
  state.payments.unshift({
    id: uid(),
    student,
    course,
    amount,
    type: $("#pType").value,
    mode: $("#pMode").value,
    status: $("#pStatus").value,
    date: $("#pDate").value || todayISO(0),
    ref,
  });
  clearPayForm();
  saveState();
  toast("Payment added");
});
$("#updatePayBtn").addEventListener("click", () => {
  if (!selPayId) return;
  const p = state.payments.find((x) => x.id === selPayId);
  if (!p) return;

  const sid = $("#pStudent").value;
  const student = state.students.find((s) => s.id === sid)?.name;

  p.student = student || p.student;
  p.course = $("#pCourse").value;
  p.amount = Number($("#pAmount").value || 0);
  p.type = $("#pType").value;
  p.mode = $("#pMode").value;
  p.status = $("#pStatus").value;
  p.date = $("#pDate").value || todayISO(0);
  p.ref = $("#pRef").value.trim() || p.ref;

  clearPayForm();
  saveState();
  toast("Payment updated");
});
$("#deletePayBtn").addEventListener("click", () => {
  if (!selPayId) return;
  state.payments = state.payments.filter((x) => x.id !== selPayId);
  clearPayForm();
  saveState();
  toast("Payment deleted");
});

/* =========================
  REPORTS + EXPORT
========================= */
$("#applyReport").addEventListener("click", applyReport);
function applyReport() {
  const status = $("#rStatus").value;
  const from = $("#rFrom").value;
  const to = $("#rTo").value;

  let rows = [...state.payments];
  if (status !== "ALL") rows = rows.filter((p) => p.status === status);
  if (from) rows = rows.filter((p) => (p.date || "") >= from);
  if (to) rows = rows.filter((p) => (p.date || "") <= to);

  $("#sumPaid").textContent = money(
    rows
      .filter((p) => p.status === "Paid")
      .reduce((s, p) => s + Number(p.amount || 0), 0),
  );
  $("#sumPending").textContent = money(
    rows
      .filter((p) => p.status === "Pending")
      .reduce((s, p) => s + Number(p.amount || 0), 0),
  );

  const tb = $("#reportTbody");
  tb.innerHTML = "";
  rows.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(p.student)}</td><td>${esc(p.course)}</td><td>${money(p.amount)}</td>
      <td>${esc(p.type)}</td><td>${esc(p.mode)}</td><td>${esc(p.status)}</td>
      <td>${esc(p.date || "-")}</td><td>${esc(p.ref || "-")}</td>
    `;
    tb.appendChild(tr);
  });

  renderKPI();
  buildCharts();
  toast("Report updated");
}
$("#exportPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text("SkillEdge – Payment Report", 40, 50);
  doc.setFontSize(10);
  doc.text("Generated: " + new Date().toLocaleString("en-IN"), 40, 70);

  const head = [
    ["Student", "Course", "Amount", "Type", "Mode", "Status", "Date", "Ref"],
  ];
  const body = [...$("#reportTbody").querySelectorAll("tr")].map((tr) =>
    [...tr.querySelectorAll("td")].map((td) => td.innerText),
  );

  doc.autoTable({
    head,
    body,
    startY: 90,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [11, 37, 69] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 40, right: 40 },
  });
  doc.save("SkillEdge_Payment_Report.pdf");
  toast("PDF exported");
});
$("#exportExcel").addEventListener("click", () => {
  const rows = [];
  rows.push([
    "Student",
    "Course",
    "Amount",
    "Type",
    "Mode",
    "Status",
    "Date",
    "Ref",
  ]);
  [...$("#reportTbody").querySelectorAll("tr")].forEach((tr) => {
    rows.push([...tr.querySelectorAll("td")].map((td) => td.innerText));
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payments");
  XLSX.writeFile(wb, "SkillEdge_Payment_Report.xlsx");
  toast("Excel exported");
});

/* =========================
  USERS CRUD
========================= */
let selUserId = null;
function renderUsers() {
  const tb = $("#usersTbody");
  tb.innerHTML = "";
  state.users.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td>
      <td><span class="tag"><span class="dot"></span>${esc(u.status)}</span></td>
      <td>${esc(u.perm)}</td><td>${esc(u.phone || "-")}</td>
    `;
    tr.addEventListener("click", () => {
      selUserId = u.id;
      $("#uName").value = u.name;
      $("#uEmail").value = u.email;
      $("#uPhone").value = u.phone || "";
      $("#uRole").value = u.role;
      $("#uStatus").value = u.status;
      $("#uPerm").value = u.perm;
      $("#updateUserBtn").disabled = false;
      $("#deleteUserBtn").disabled = false;
      toast("User selected");
    });
    tb.appendChild(tr);
  });
}
function clearUserForm() {
  selUserId = null;
  $("#uName").value = "";
  $("#uEmail").value = "";
  $("#uPhone").value = "";
  $("#uRole").value = "Admin";
  $("#uStatus").value = "Active";
  $("#uPerm").value = "Full";
  $("#updateUserBtn").disabled = true;
  $("#deleteUserBtn").disabled = true;
}
$("#addUserBtnTop").addEventListener("click", () =>
  $("#addUserFormBtn").click(),
);
$("#clearUserSel").addEventListener("click", () => {
  clearUserForm();
  toast("Selection cleared");
});

$("#addUserFormBtn").addEventListener("click", () => {
  const name = $("#uName").value.trim();
  const email = $("#uEmail").value.trim();
  if (!name || !email) return toast("Name & Email are required");
  state.users.unshift({
    id: uid(),
    name,
    email,
    phone: $("#uPhone").value.trim(),
    role: $("#uRole").value,
    status: $("#uStatus").value,
    perm: $("#uPerm").value,
  });
  clearUserForm();
  saveState();
  toast("User added");
});
$("#updateUserBtn").addEventListener("click", () => {
  if (!selUserId) return;
  const u = state.users.find((x) => x.id === selUserId);
  if (!u) return;
  u.name = $("#uName").value.trim();
  u.email = $("#uEmail").value.trim();
  u.phone = $("#uPhone").value.trim();
  u.role = $("#uRole").value;
  u.status = $("#uStatus").value;
  u.perm = $("#uPerm").value;
  clearUserForm();
  saveState();
  toast("User updated");
});
$("#deleteUserBtn").addEventListener("click", () => {
  if (!selUserId) return;
  state.users = state.users.filter((x) => x.id !== selUserId);
  clearUserForm();
  saveState();
  toast("User deleted");
});

/* =========================
  CERTIFICATES
========================= */
let selTplId = null;
function renderTemplates() {
  const tb = $("#tplTbody");
  tb.innerHTML = "";
  state.templates.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${esc(t.name)}</td><td>${esc(t.isDefault)}</td><td>${esc(t.color)}</td><td>${esc(t.signatory)}</td>`;
    tr.addEventListener("click", () => {
      selTplId = t.id;
      $("#tName").value = t.name;
      $("#tDefault").value = t.isDefault;
      $("#tColor").value = t.color;
      $("#tSign").value = t.signatory;
      $("#tLogoText").value = t.logoText;
      $("#tBody").value = t.body;
      $("#updateTplBtn").disabled = false;
      $("#deleteTplBtn").disabled = false;
      toast("Template selected");
    });
    tb.appendChild(tr);
  });
}
function certHTML(t) {
  const demoStudent = "Demo Student";
  const demoCourse = "Python + DSA";
  const demoDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const demoId = "SE-CERT-" + rand6();
  const body = (t.body || "")
    .replaceAll("{STUDENT_NAME}", demoStudent)
    .replaceAll("{COURSE_NAME}", demoCourse)
    .replaceAll("{DATE}", demoDate)
    .replaceAll("{CERT_ID}", demoId);

  return `
    <div style="border-radius:24px; overflow:hidden; border:1px solid rgba(11,37,69,.14); background:rgba(255,255,255,.88); box-shadow:0 18px 55px rgba(0,0,0,.12);">
      <div style="padding:18px; background:linear-gradient(90deg, rgba(11,37,69,.96), rgba(7,27,49,.96)); color:#fff; display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <div style="font-family:'Playfair Display',serif; font-size:20px;">${esc(t.logoText || "SkillEdge")}</div>
        <div style="font-weight:900; color:${esc(t.color || "#C9A24D")}; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.08); padding:8px 12px; border-radius:999px;">CERTIFICATE</div>
      </div>
      <div style="padding:20px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div><div style="font-size:12px;color:#6B7280;">Certificate ID</div><div style="font-weight:900;">${demoId}</div></div>
          <div><div style="font-size:12px;color:#6B7280;">Date</div><div style="font-weight:900;">${demoDate}</div></div>
        </div>

        <div style="margin-top:14px; font-family:'Playfair Display',serif; font-size:28px; color:#0B2545;">Certificate of Completion</div>
        <div style="margin-top:10px; padding:14px; border-radius:18px; border:1px solid rgba(11,37,69,.12); background:rgba(201,162,77,.06); line-height:1.75;">${esc(body)}</div>

        <div style="margin-top:18px; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:end;">
          <div style="font-size:12px; color:#6B7280;">Verified by <b style="color:#0B2545">SkillEdge</b></div>
          <div style="text-align:right;">
            <div style="height:2px; width:180px; background:${esc(t.color || "#C9A24D")}; border-radius:99px; margin-left:auto;"></div>
            <div style="margin-top:6px; font-weight:900;">${esc(t.signatory || "Director, SkillEdge")}</div>
            <div style="font-size:12px;color:#6B7280;">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
$("#previewTplBtn").addEventListener("click", () => {
  const t = {
    name: $("#tName").value.trim() || "SkillEdge Certificate",
    isDefault: $("#tDefault").value,
    color: $("#tColor").value.trim() || "#C9A24D",
    signatory: $("#tSign").value.trim() || "Director, SkillEdge",
    logoText: $("#tLogoText").value.trim() || "SkillEdge",
    body: $("#tBody").value || "",
  };
  openModal("Certificate Preview", certHTML(t));
});
$("#addTplBtn").addEventListener("click", () => {
  const name = $("#tName").value.trim();
  if (!name) return toast("Template name is required");
  const t = {
    id: uid(),
    name,
    isDefault: $("#tDefault").value,
    color: $("#tColor").value.trim() || "#C9A24D",
    signatory: $("#tSign").value.trim(),
    logoText: $("#tLogoText").value.trim() || "SkillEdge",
    body: $("#tBody").value || "",
  };
  if (t.isDefault === "Yes")
    state.templates.forEach((x) => (x.isDefault = "No"));
  state.templates.unshift(t);
  selTplId = null;
  $("#updateTplBtn").disabled = true;
  $("#deleteTplBtn").disabled = true;
  saveState();
  toast("Template added");
});
$("#updateTplBtn").addEventListener("click", () => {
  if (!selTplId) return;
  const t = state.templates.find((x) => x.id === selTplId);
  if (!t) return;
  t.name = $("#tName").value.trim();
  t.isDefault = $("#tDefault").value;
  t.color = $("#tColor").value.trim() || "#C9A24D";
  t.signatory = $("#tSign").value.trim();
  t.logoText = $("#tLogoText").value.trim() || "SkillEdge";
  t.body = $("#tBody").value || "";
  if (t.isDefault === "Yes")
    state.templates.forEach((x) => {
      if (x.id !== t.id) x.isDefault = "No";
    });
  selTplId = null;
  $("#updateTplBtn").disabled = true;
  $("#deleteTplBtn").disabled = true;
  saveState();
  toast("Template updated");
});
$("#deleteTplBtn").addEventListener("click", () => {
  if (!selTplId) return;
  state.templates = state.templates.filter((x) => x.id !== selTplId);
  selTplId = null;
  $("#updateTplBtn").disabled = true;
  $("#deleteTplBtn").disabled = true;
  saveState();
  toast("Template deleted");
});

/* =========================
  RULES + SYSTEM
========================= */
$("#saveRule").addEventListener("click", () => {
  const v = Math.max(0, Math.min(100, Number($("#minAtt").value || 75)));
  state.rule.minAttendance = v;
  state.rule.scope = $("#ruleScope").value;
  state.rule.note = $("#ruleNote").value;
  $("#exMinAtt").value = v;
  saveState();
  toast("Rule saved");
});
$("#runDemoRule").addEventListener("click", () => {
  const att = Number($("#demoAtt").value || 0);
  const min = Number(state.rule.minAttendance || 75);
  $("#demoRes").value = att >= min ? "Eligible ✅" : "Not Eligible ❌";
  toast("Checked");
});
$("#saveSystem").addEventListener("click", () => {
  state.meta.institute =
    $("#sysInstitute").value.trim() || "SkillEdge IT Training";
  state.meta.email = $("#sysEmail").value.trim() || "support@skilledge.com";
  state.meta.currency = $("#sysCurrency").value;
  state.meta.tz = $("#sysTZ").value;
  saveState();
  toast("System saved");
});
$("#saveSecurity").addEventListener("click", () => {
  state.security.twoFA = $("#sec2fa").value;
  state.security.policy = $("#secPolicy").value;
  state.security.timeout = Number($("#secTimeout").value || 30);
  state.security.attempts = Number($("#secAttempts").value || 5);
  saveState();
  toast("Security saved");
});

/* =========================
  FINAL REFRESH
========================= */
function refreshAll() {
  $("#whoName").textContent = state.users[0]?.name || "SkillEdge Admin";
  $("#whoRole").textContent = state.users[0]?.role || "Admin";

  $("#minAtt").value = state.rule.minAttendance ?? 75;
  $("#ruleScope").value = state.rule.scope ?? "All Courses";
  $("#ruleNote").value = state.rule.note ?? "";
  $("#exMinAtt").value = state.rule.minAttendance ?? 75;

  $("#sysInstitute").value = state.meta.institute ?? "SkillEdge IT Training";
  $("#sysEmail").value = state.meta.email ?? "support@skilledge.com";
  $("#sysCurrency").value = state.meta.currency ?? "INR";
  $("#sysTZ").value = state.meta.tz ?? "Asia/Kolkata";

  $("#sec2fa").value = state.security.twoFA ?? "Off";
  $("#secPolicy").value = state.security.policy ?? "Standard";
  $("#secTimeout").value = state.security.timeout ?? 30;
  $("#secAttempts").value = state.security.attempts ?? 5;

  fillCourseDropdowns();
  renderKPI();

  renderCategories();
  renderCourses();
  renderStudents();
  renderPayments();
  renderUsers();
  renderTemplates();
  renderExams();

  // attendance month sync
  $("#aMonth").value = ($("#aDate").value || todayISO()).slice(0, 7);
  updateMonthSessionsCount();

  applyReport();
  buildCharts();
}
refreshAll();
