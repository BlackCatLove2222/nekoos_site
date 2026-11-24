/* nekoOS サイト: device.json から端末ごとの表示を描画する。
   読めなければ静的 HTML (Pixel 2) のまま表示される。 */
(function () {
  "use strict";
  function el(id) { return document.getElementById(id); }
  var tabsBox = el("device-tabs");
  var devices = [];
  var tabBtns = {}; // id -> button
  var currentId = null;
  var fQuery = "", fMaker = "*", fStatus = "*";

  function render(d) {
    currentId = d.id;
    el("d-eyebrow").textContent = d.name + " / " + d.codename;
    el("d-version").textContent = d.version;
    el("d-lead").textContent = d.lead || "";
    var badges = el("d-badges");
    badges.innerHTML = "";
    (d.badges || []).forEach(function (b) {
      var s = document.createElement("span");
      s.className = "badge";
      s.textContent = b;
      badges.appendChild(s);
    });
    el("d-phone-version").textContent = d.version;
    el("d-spec-name").textContent = d.name;
    el("d-spec-code").textContent = d.codename;
    el("d-spec-base").textContent = d.base;
    el("d-spec-theme").textContent = d.theme;
    el("d-about").textContent = d.about || "";
    var dl = d.download || {};
    el("dl-file").textContent = dl.file || "—";
    el("dl-meta").textContent = "サイズ: " + (dl.size || "—") + " / 対象: " + d.name + " (" + d.codename + ")";
    el("dl-hash").textContent = dl.sha256 || "—";
    var btn = el("dl-btn");
    if (dl.url) {
      btn.href = dl.url;
      btn.removeAttribute("aria-disabled");
    } else {
      btn.href = "#";
      btn.setAttribute("aria-disabled", "true");
    }
    var tl = el("d-changelog");
    tl.innerHTML = "";
    (d.changelog || []).forEach(function (c) {
      var art = document.createElement("article");
      art.className = "card entry";
      var date = document.createElement("div");
      date.className = "date";
      date.textContent = c.date;
      var body = document.createElement("div");
      var h3 = document.createElement("h3");
      h3.textContent = c.title;
      var p = document.createElement("p");
      p.textContent = c.body;
      body.appendChild(h3);
      body.appendChild(p);
      art.appendChild(date);
      art.appendChild(body);
      tl.appendChild(art);
    });
    document.title = "nekoOS " + d.version + " — " + d.name + " (" + d.codename + ") Sample Page";
    Object.keys(tabBtns).forEach(function (id) {
      var on = id === d.id;
      tabBtns[id].classList.toggle("on", on);
      tabBtns[id].setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function matches(d) {
    if (fMaker !== "*" && (d.maker || "") !== fMaker) return false;
    if (fStatus !== "*" && (d.status || "") !== fStatus) return false;
    if (fQuery) {
      var hay = (d.name + " " + d.codename + " " + (d.maker || "")).toLowerCase();
      if (hay.indexOf(fQuery) === -1) return false;
    }
    return true;
  }

  function applyFilter() {
    var visible = devices.filter(matches);
    devices.forEach(function (d) {
      tabBtns[d.id].style.display = matches(d) ? "" : "none";
    });
    el("device-empty").hidden = visible.length > 0;
    if (visible.length && !visible.some(function (d) { return d.id === currentId; })) {
      render(visible[0]);
    }
  }

  function buildChips(boxId, values, onPick) {
    var box = el(boxId);
    box.innerHTML = "";
    ["*"].concat(values).forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip" + (v === "*" ? " on" : "");
      b.textContent = v === "*" ? "すべて" : v;
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(box.children, function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        onPick(v);
        applyFilter();
      });
      box.appendChild(b);
    });
  }

  fetch("device.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      devices = (data && data.devices) || [];
      if (!devices.length) return;
      devices.forEach(function (d) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "device-tab";
        b.dataset.id = d.id;
        b.setAttribute("role", "tab");
        b.textContent = d.name + " (" + d.codename + ")";
        b.addEventListener("click", function () { render(d); });
        tabsBox.appendChild(b);
        tabBtns[d.id] = b;
      });
      var makers = [], statuses = [];
      devices.forEach(function (d) {
        if (d.maker && makers.indexOf(d.maker) === -1) makers.push(d.maker);
        if (d.status && statuses.indexOf(d.status) === -1) statuses.push(d.status);
      });
      buildChips("maker-chips", makers, function (v) { fMaker = v; });
      buildChips("status-chips", statuses, function (v) { fStatus = v; });
      el("device-search").addEventListener("input", function (e) {
        fQuery = e.target.value.trim().toLowerCase();
        applyFilter();
      });
      render(devices[0]);
    })
    .catch(function () { /* 読めなければ静的表示のまま */ });
})();
