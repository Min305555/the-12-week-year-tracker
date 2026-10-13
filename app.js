(() => {
  const STORAGE_KEY = "twelve-week-tracker.v1";
  const WEEK_COUNT = 12;
  const $ = (id) => document.getElementById(id);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const fromISO = (value) => { const [y, m, d] = value.split("-").map(Number); return new Date(y, m - 1, d); };
  const plusDays = (date, days) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };
  const formatDate = (date, options = { day: "2-digit", month: "short" }) => new Intl.DateTimeFormat("vi-VN", options).format(date).replace(" thg ", " Thg ");
  const makeId = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function newCycle(year, number, startDate) {
    return { id: makeId(), year, number, name: `Chu kỳ ${number}`, start: startDate, goals: [] };
  }
  function initialState() {
    const currentYear = today.getFullYear();
    const year = currentYear;
    const firstCycle = newCycle(year, 1, "");
    return { version: 1, years: { [year]: [firstCycle] }, activeYear: year, activeCycleId: firstCycle.id, selectedWeek: 1 };
  }
  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === 1 && saved.years) return saved;
    } catch (error) { console.warn("Không đọc được dữ liệu đã lưu.", error); }
    return initialState();
  }
  let state = readState();
  let activeView = "overview";
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (error) { alert("Không thể lưu vào bộ nhớ trình duyệt. Hãy xuất Excel để tạo bản sao lưu."); }
  }
  function getCycles(year = state.activeYear) { return state.years[year] || []; }
  function cycle() { return getCycles().find(c => c.id === state.activeCycleId) || getCycles()[0]; }
  function ensureSelectedCycle() {
    if (!getCycles().length) state.years[state.activeYear] = [newCycle(state.activeYear, 1, "")];
    if (!cycle()) state.activeCycleId = getCycles()[0].id;
  }
  function weekStart(week, c = cycle()) { return c?.start ? plusDays(fromISO(c.start), (week - 1) * 7) : null; }
  function currentWeek(c = cycle()) {
    if (!c?.start) return 1;
    const delta = Math.floor((today - fromISO(c.start)) / 86400000);
    return Math.max(1, Math.min(WEEK_COUNT, Math.floor(delta / 7) + 1));
  }
  function selectedWeek() { if (!Number.isInteger(state.selectedWeek)) state.selectedWeek = currentWeek(); return Math.max(1, Math.min(WEEK_COUNT, state.selectedWeek)); }
  function allTasks(c = cycle()) { return c.goals.flatMap(g => g.tasks.map(t => ({ ...t, goalId: g.id, goalName: g.name }))); }
  function weekScore(week, c = cycle()) {
    const tasks = allTasks(c);
    const planned = tasks.filter(t => t.plan?.[week - 1]).length;
    const completed = tasks.filter(t => t.actual?.[week - 1]).length;
    return planned ? Math.round((completed / planned) * 100) : 0;
  }
  function overallScore(c = cycle()) { return Math.round(Array.from({ length: WEEK_COUNT }, (_, i) => weekScore(i + 1, c)).reduce((a, b) => a + b, 0) / WEEK_COUNT); }
  function goalScore(goal) {
    const planned = goal.tasks.reduce((n, task) => n + task.plan.filter(Boolean).length, 0);
    const done = goal.tasks.reduce((n, task) => n + task.actual.filter(Boolean).length, 0);
    return planned ? Math.min(100, Math.round(done / planned * 100)) : 0;
  }
  function escapeText(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]); }

  function renderYear() {
    const select = $("year-select");
    const years = new Set([...Object.keys(state.years).map(Number), today.getFullYear(), state.activeYear - 1, state.activeYear + 1]);
    select.replaceChildren(...[...years].sort((a, b) => b - a).map(y => { const option = document.createElement("option"); option.value = y; option.textContent = y; option.selected = y === state.activeYear; return option; }));
  }
  function renderCycles() {
    const list = $("cycle-list"); list.replaceChildren();
    getCycles().forEach((c, i) => {
      const start = c.start ? fromISO(c.start) : null, end = start ? plusDays(start, 83) : null;
      const button = document.createElement("button"); button.className = `cycle-card${c.id === state.activeCycleId ? " selected" : ""}`;
      button.setAttribute("aria-pressed", c.id === state.activeCycleId);
      const count = c.goals.length;
      button.innerHTML = `<span class="cycle-number">${String(i + 1).padStart(2, "0")}</span><span class="cycle-info"><strong>${escapeText(c.name || `Chu kỳ ${i + 1}`)}</strong><small>${start ? `${formatDate(start)} – ${formatDate(end)}` : "Chưa chọn ngày bắt đầu"} · ${count} mục tiêu</small></span><span class="cycle-tag">${c.id === state.activeCycleId ? "ĐANG DÙNG" : ""}</span>`;
      button.addEventListener("click", () => { state.activeCycleId = c.id; state.selectedWeek = currentWeek(c); save(); render(); });
      list.append(button);
    });
    const active = cycle();
    $("cycle-start").value = active?.start || "";
    $("cycle-range").textContent = active?.start ? `12 tuần · ${formatDate(fromISO(active.start), { day: "numeric", month: "long", year: "numeric" })} – ${formatDate(plusDays(fromISO(active.start), 83), { day: "numeric", month: "long", year: "numeric" })}` : "12 tuần: hãy chọn ngày bắt đầu";
    $("breadcrumb-cycle").textContent = cycle()?.name || "Chu kỳ hiện tại";
  }
  function renderStats() {
    const c = cycle(); if (!c) return;
    const score = overallScore(c), tasks = allTasks(c), done = tasks.filter(t => t.actual.some(Boolean)).length;
    $("overall-score").textContent = `${score}%`; $("overall-meter").style.width = `${score}%`;
    $("score-context").textContent = score ? `${score >= 80 ? "Nhịp độ rất tốt" : "Tiếp tục giữ cam kết"} · ${tasks.length} đầu việc` : "Bắt đầu bằng một kế hoạch nhỏ";
    $("goal-count").textContent = c.goals.length; $("done-count").textContent = done; $("task-total").textContent = `/ ${tasks.length}`;
    const week = selectedWeek(), start = weekStart(week, c), end = start ? plusDays(start, 6) : null;
    $("week-position").textContent = `Tuần ${week}`;
    const remaining = c.start ? Math.ceil((plusDays(fromISO(c.start), 83) - today) / 86400000) : null;
    $("days-left").textContent = !c.start ? "Chọn ngày bắt đầu" : today < fromISO(c.start) ? `Bắt đầu ${formatDate(fromISO(c.start))}` : remaining >= 0 ? `${remaining} ngày còn lại` : "Chu kỳ đã kết thúc";
    $("selected-week-label").textContent = `TUẦN ${week}`;
    $("week-title").textContent = `Tuần ${week} — ${week === currentWeek(c) ? "Tuần hiện tại" : "Theo dõi thực thi"}`;
    $("week-date-range").textContent = start ? `${formatDate(start)} – ${formatDate(end)}` : "Chọn ngày bắt đầu chu kỳ để tính tuần";
    const scoreWeek = weekScore(week, c); $("week-score").textContent = `${scoreWeek}%`;
    $("week-ring").style.background = `conic-gradient(#819b77 ${scoreWeek}%, #e5e9e1 ${scoreWeek}%)`;
    $("week-summary-copy").textContent = tasks.some(t => t.plan[week - 1]) ? `${tasks.filter(t => t.plan[week - 1] && t.actual[week - 1]).length} trong ${tasks.filter(t => t.plan[week - 1]).length} đầu việc đã lên kế hoạch được hoàn thành.` : "Chọn những đầu việc bạn cam kết thực hiện trong tuần này.";
  }
  function renderWeeklyTasks() {
    const tbody = $("weekly-tasks"), week = selectedWeek(); tbody.replaceChildren();
    const tasks = allTasks();
    $("weekly-empty").hidden = tasks.length > 0;
    tasks.forEach(task => {
      const tr = document.createElement("tr");
      const due = task.dueWeek ? `Tuần ${task.dueWeek}` : "—";
      const taskLabel = task.name?.trim() || "Đầu việc chưa đặt tên";
      tr.innerHTML = `<td><div class="task-name-cell"><span>${escapeText(taskLabel)}</span></div></td><td class="goal-label">${escapeText(task.goalName || "Mục tiêu chưa đặt tên")}</td><td><span class="due-pill">${due}</span></td><td class="check-cell"><input class="check-box plan-check" type="checkbox" aria-label="Lên kế hoạch: ${escapeText(taskLabel)}" ${task.plan[week - 1] ? "checked" : ""}></td><td class="check-cell"><input class="check-box done-check" type="checkbox" aria-label="Đã hoàn thành: ${escapeText(taskLabel)}" ${task.actual[week - 1] ? "checked" : ""}></td>`;
      const goal = cycle().goals.find(g => g.id === task.goalId), item = goal.tasks.find(t => t.id === task.id);
      tr.querySelector(".plan-check").addEventListener("change", e => { item.plan[week - 1] = e.target.checked; save(); render(); });
      tr.querySelector(".done-check").addEventListener("change", e => { item.actual[week - 1] = e.target.checked; save(); render(); });
      tbody.append(tr);
    });
  }
  function renderWeekTimeline() {
    const strip = $("week-timeline"); strip.replaceChildren();
    const c = cycle();
    if (!c?.start) {
      const hint = document.createElement("p"); hint.className = "timeline-hint"; hint.textContent = "Chọn ngày bắt đầu ở trên để tính ngày của từng tuần."; strip.append(hint); return;
    }
    for (let week = 1; week <= WEEK_COUNT; week++) {
      const start = weekStart(week, c), end = plusDays(start, 6);
      const button = document.createElement("button"); button.type = "button"; button.className = `week-chip${week === selectedWeek() ? " selected" : ""}`;
      button.setAttribute("aria-pressed", week === selectedWeek());
      button.innerHTML = `<span>TUẦN ${week}</span><strong>${formatDate(start)}–${formatDate(end)}</strong>`;
      button.addEventListener("click", () => { state.selectedWeek = week; save(); render(); });
      strip.append(button);
    }
  }
  function renderGoals() {
    const c = cycle(), list = $("goal-list"), details = $("goal-details"); list.replaceChildren(); details.replaceChildren();
    $("goal-empty").hidden = c.goals.length > 0; $("detail-empty").hidden = c.goals.length > 0;
    c.goals.forEach((g, index) => {
      const score = goalScore(g), plannedCount = g.tasks.reduce((n, t) => n + t.plan.filter(Boolean).length, 0), doneCount = g.tasks.reduce((n, t) => n + t.actual.filter(Boolean).length, 0);
      const item = document.createElement("article"); item.className = "goal-item";
      item.innerHTML = `<div class="goal-item-top"><strong class="goal-item-title">${escapeText(g.name?.trim() || "Mục tiêu chưa đặt tên")}</strong><span class="goal-progress-label">${score}%</span></div><div class="goal-item-meta">${g.tasks.length} đầu việc · ${doneCount} lần hoàn thành</div><div class="goal-progress"><span style="width:${score}%"></span></div><div class="goal-metrics"><span>Nỗ lực <strong>${escapeText(g.effort || "Chưa đặt")}</strong></span><span>Kết quả <strong>${escapeText(g.result || "Chưa đặt")}</strong></span></div>`;
      list.append(item);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${escapeText(g.name?.trim() || "Mục tiêu chưa đặt tên")}</td><td>${escapeText(g.effort || "—")}</td><td>${escapeText(g.result || "—")}</td><td>${g.tasks.length} đầu việc</td><td><span class="mini-bar"><span style="width:${score}%"></span></span><span class="goal-percent">${score}%</span></td><td><button class="row-action edit-goal" aria-label="Sửa mục tiêu" title="Sửa mục tiêu">✎</button><button class="row-action delete-goal" aria-label="Xóa mục tiêu" title="Xóa mục tiêu">×</button></td>`;
      tr.querySelector(".edit-goal").addEventListener("click", () => openGoalDialog(g));
      tr.querySelector(".delete-goal").addEventListener("click", () => deleteGoal(g.id)); details.append(tr);
    });
  }
  function render() { ensureSelectedCycle(); renderYear(); renderCycles(); renderStats(); renderWeekTimeline(); renderWeeklyTasks(); renderGoals(); }

  function openGoalDialog(goal = null) {
    if (!cycle()?.start) { alert("Trước tiên, hãy chọn ngày bắt đầu chu kỳ 12 tuần."); $("cycle-start").focus(); return; }
    $("goal-form").reset(); $("goal-id").value = goal?.id || "";
    $("dialog-title").textContent = goal ? "Chỉnh sửa mục tiêu" : "Thêm mục tiêu mới";
    $("goal-name").value = goal?.name || ""; $("goal-effort").value = goal?.effort || ""; $("goal-result").value = goal?.result || "";
    $("delete-goal-button").hidden = !goal;
    const actionList = $("goal-actions-list"); actionList.replaceChildren();
    if (goal?.tasks?.length) goal.tasks.forEach(task => addActionRow(task)); else addActionRow();
    $("goal-dialog").showModal(); $("goal-name").focus();
  }
  function addActionRow(task = null) {
    const row = document.createElement("div"); row.className = "goal-action-row";
    const dueOptions = Array.from({ length: WEEK_COUNT }, (_, index) => `<option value="${index + 1}" ${task?.dueWeek === index + 1 ? "selected" : ""}>Tuần ${index + 1}</option>`).join("");
    row.innerHTML = `<input class="action-name" required maxlength="180" aria-label="Đầu việc" placeholder="Ví dụ: Hoàn thành bài học tuần này" value="${escapeText(task?.name || "")}"><select class="action-due" aria-label="Tuần hạn">${dueOptions}</select><button type="button" class="remove-action" aria-label="Bỏ đầu việc">×</button>`;
    row.dataset.taskId = task?.id || "";
    if (task?.plan) row.dataset.plan = JSON.stringify(task.plan);
    if (task?.actual) row.dataset.actual = JSON.stringify(task.actual);
    row.querySelector(".remove-action").addEventListener("click", () => row.remove());
    $("goal-actions-list").append(row);
  }
  function deleteGoal(id) {
    const goal = cycle().goals.find(item => item.id === id); if (!goal) return;
    if (!confirm(`Xóa mục tiêu “${goal.name}” và toàn bộ đầu việc của mục tiêu này?`)) return;
    cycle().goals = cycle().goals.filter(item => item.id !== id);
    $("goal-dialog").close(); save(); render();
  }
  function openTaskDialog() {
    if (!cycle().goals.length) { openGoalDialog(); return; }
    $("task-form").reset();
    const goalSelect = $("task-goal"); goalSelect.replaceChildren(...cycle().goals.map(g => { const option = document.createElement("option"); option.value = g.id; option.textContent = g.name; return option; }));
    const due = $("task-due"); due.replaceChildren(...Array.from({ length: 12 }, (_, i) => { const o = document.createElement("option"); o.value = i + 1; o.textContent = `Tuần ${i + 1}`; return o; }));
    due.value = selectedWeek(); $("task-dialog").showModal(); $("task-name").focus();
  }
  $("goal-form").addEventListener("submit", e => {
    if (e.submitter?.value !== "save") return;
    e.preventDefault(); const c = cycle(), id = $("goal-id").value;
    const values = { name: $("goal-name").value.trim(), effort: $("goal-effort").value.trim(), result: $("goal-result").value.trim() };
    const existing = c.goals.find(g => g.id === id);
    const actionRows = [...$("goal-actions-list").querySelectorAll(".goal-action-row")];
    const tasks = actionRows.filter(row => row.querySelector(".action-name").value.trim() || row.dataset.taskId).map(row => ({
      id: row.dataset.taskId || makeId(), name: row.querySelector(".action-name").value.trim(), dueWeek: Number(row.querySelector(".action-due").value),
      plan: JSON.parse(row.dataset.plan || "null") || Array(WEEK_COUNT).fill(false), actual: JSON.parse(row.dataset.actual || "null") || Array(WEEK_COUNT).fill(false)
    }));
    if (existing) Object.assign(existing, values, { tasks });
    else if (c.goals.length >= 4) { alert("Tracker hỗ trợ tối đa 4 mục tiêu cho mỗi chu kỳ."); return; }
    else c.goals.push({ id: makeId(), ...values, tasks });
    $("goal-dialog").close(); save(); render();
  });
  $("task-form").addEventListener("submit", e => {
    if (e.submitter?.value !== "save") return;
    e.preventDefault(); const goal = cycle().goals.find(g => g.id === $("task-goal").value); if (!goal) return;
    const plan = Array(WEEK_COUNT).fill(false), actual = Array(WEEK_COUNT).fill(false), dueWeek = Number($("task-due").value);
    plan[Math.max(0, dueWeek - 1)] = true;
    goal.tasks.push({ id: makeId(), name: $("task-name").value.trim(), dueWeek, plan, actual });
    $("task-dialog").close(); state.selectedWeek = dueWeek; save(); render();
  });
  ["add-goal-button", "focus-add", "goal-empty-add", "detail-add-goal", "detail-empty-add"].forEach(id => $(id).addEventListener("click", () => openGoalDialog()));
  $("empty-add-task").addEventListener("click", openTaskDialog);
  $("view-all-tasks").addEventListener("click", openTaskDialog);
  $("prev-week").addEventListener("click", () => { state.selectedWeek = Math.max(1, selectedWeek() - 1); render(); });
  $("next-week").addEventListener("click", () => { state.selectedWeek = Math.min(WEEK_COUNT, selectedWeek() + 1); render(); });
  $("today-week").addEventListener("click", () => { state.selectedWeek = currentWeek(); render(); });
  $("add-cycle-button").addEventListener("click", () => {
    const current = getCycles().at(-1);
    $("new-cycle-start").value = current?.start ? iso(plusDays(fromISO(current.start), 84)) : "";
    updateCyclePreview(); $("cycle-dialog").showModal();
  });
  $("cycle-start").addEventListener("change", e => {
    cycle().start = e.target.value;
    state.selectedWeek = currentWeek(cycle()); save(); render();
  });
  function updateCyclePreview() {
    const value = $("new-cycle-start").value;
    $("new-cycle-preview").textContent = value ? `Chu kỳ kéo dài từ ${formatDate(fromISO(value), { day: "numeric", month: "long", year: "numeric" })} đến ${formatDate(plusDays(fromISO(value), 83), { day: "numeric", month: "long", year: "numeric" })}.` : "Chọn ngày bắt đầu để xem khoảng thời gian 12 tuần.";
  }
  $("new-cycle-start").addEventListener("input", updateCyclePreview);
  $("cycle-form").addEventListener("submit", e => {
    if (e.submitter?.value !== "save") return;
    e.preventDefault(); const start = $("new-cycle-start").value; if (!start) return;
    const next = newCycle(state.activeYear, getCycles().length + 1, start);
    getCycles().push(next); state.activeCycleId = next.id; state.selectedWeek = currentWeek(next);
    $("cycle-dialog").close(); save(); render();
  });
  $("year-select").addEventListener("change", e => {
    const year = Number(e.target.value); state.activeYear = year;
    if (!state.years[year]) state.years[year] = [newCycle(year, 1, "")];
    state.activeCycleId = state.years[year][0].id; state.selectedWeek = currentWeek(cycle()); save(); render();
  });
  $("add-action-row").addEventListener("click", () => addActionRow());
  $("delete-goal-button").addEventListener("click", () => deleteGoal($("goal-id").value));
  ["overview", "plan", "goals"].forEach(view => document.querySelector(`[data-view="${view}"]`).addEventListener("click", () => {
    activeView = view; document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === view));
    const target = view === "plan" ? $("plan-section") : view === "goals" ? $("goals-detail") : document.querySelector(".page-heading"); target.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  $("data-info").addEventListener("click", () => $("notice-dialog").showModal());

  function checkmark(value) { return value === "✔" || value === "✓" || value === true || value === 1 || String(value || "").trim().toLowerCase() === "true"; }
  function parseExcel(file) {
    if (!window.XLSX) throw new Error("Không tải được công cụ đọc Excel. Hãy kết nối mạng rồi thử lại.");
    return file.arrayBuffer().then(buffer => {
      const workbook = XLSX.read(buffer, { cellDates: true });
      const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes("tracker")) || workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null });
      const rawDate = rows[2]?.[1];
      const date = rawDate instanceof Date ? rawDate : typeof rawDate === "number" ? new Date(Date.UTC(1899, 11, 30) + rawDate * 86400000) : new Date();
      const start = iso(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
      const goals = []; let currentGoal = null;
      for (let index = 6; index < Math.min(rows.length, 28); index++) {
        const row = rows[index] || [], title = String(row[0] || "").trim();
        if (title && !/^mục tiêu\s*\d/i.test(title) && !title.toLowerCase().includes("optional")) {
          currentGoal = { id: makeId(), name: title, effort: String(row[1] || "").trim(), result: String(row[2] || "").trim(), tasks: [] };
          goals.push(currentGoal);
        }
        const action = String(row[3] || "").trim();
        if (!currentGoal || !action) continue;
        const plan = Array.from({ length: WEEK_COUNT }, (_, i) => checkmark(row[5 + i * 2]));
        const actual = Array.from({ length: WEEK_COUNT }, (_, i) => checkmark(row[6 + i * 2]));
        const dueRaw = String(row[4] || "").match(/\d{1,2}/); const dueWeek = dueRaw ? Number(dueRaw[0]) : null;
        currentGoal.tasks.push({ id: makeId(), name: action, dueWeek: dueWeek && dueWeek <= 12 ? dueWeek : null, plan, actual });
      }
      const selected = goals.slice(0, 4);
      const newYear = date.getFullYear();
      state.activeYear = newYear;
      if (!state.years[newYear]) state.years[newYear] = [];
      const imported = newCycle(newYear, state.years[newYear].length + 1, start); imported.name = `Chu kỳ nhập từ Excel`;
      imported.goals = selected;
      state.years[newYear].push(imported); state.activeCycleId = imported.id;
      const days = Math.floor((today - fromISO(start)) / 86400000); state.selectedWeek = Math.max(1, Math.min(12, Math.floor(days / 7) + 1));
      save(); render();
    });
  }
  $("import-button").addEventListener("click", () => $("file-input").click());
  $("file-input").addEventListener("change", async e => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await parseExcel(file); alert("Đã nhập kế hoạch từ Excel vào trình duyệt này. Hãy kiểm tra mục tiêu và tuần trước khi tiếp tục."); }
    catch (error) { alert(`Không thể nhập file: ${error.message}`); }
    finally { e.target.value = ""; }
  });
  function exportExcel() {
    if (!window.XLSX) { alert("Không tải được công cụ tạo Excel. Hãy kết nối mạng rồi thử lại."); return; }
    const c = cycle();
    if (!c.start) { alert("Chọn ngày bắt đầu chu kỳ trước khi xuất Excel."); $("cycle-start").focus(); return; }
    const start = fromISO(c.start), rows = [
      ["THE 12-WEEK YEAR TRACKER", "", "", "", "", c.name],
      ["Ngày bắt đầu chu kỳ / Cycle Start Date:", start, "", "Điểm thực thi tổng chu kỳ / Overall Execution Score:", `${overallScore(c)}%`],
      ["Mục tiêu / Goal", "Chỉ số nỗ lực / Effort Metric", "Chỉ số kết quả / Result Metric", "Đầu việc / Action", "Hạn / Due", ...Array.from({ length: 12 }, (_, i) => [`Tuần ${i + 1} Plan`, `Tuần ${i + 1} Reality`]).flat()]
    ];
    c.goals.forEach(g => {
      if (!g.tasks.length) rows.push([g.name, g.effort, g.result, "", "", ...Array(24).fill("")]);
      g.tasks.forEach((task, index) => rows.push([index ? "" : g.name, index ? "" : g.effort, index ? "" : g.result, task.name, task.dueWeek ? `Tuần ${task.dueWeek}` : "", ...Array.from({ length: 12 }, (_, i) => [task.plan[i] ? "✔" : "", task.actual[i] ? "✔" : ""]).flat()]));
    });
    const ws = XLSX.utils.aoa_to_sheet(rows); ws["!cols"] = [{ wch: 30 }, { wch: 32 }, { wch: 32 }, { wch: 48 }, { wch: 18 }, ...Array(24).fill({ wch: 12 })];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "12-Week Tracker");
    XLSX.writeFile(wb, `12-week-tracker-${state.activeYear}-cycle-${c.number}.xlsx`);
  }
  $("export-button").addEventListener("click", exportExcel);
  render();
})();
