/* nekoOS サイト トップ: site.json (全体文面) + device.json (端末カード一覧) を描画する。
   どちらか読めなければ、読めた方だけ反映し、残りは静的 HTML のまま表示される。 */
(function () {
  "use strict";
  function el(id) { return document.getElementById(id); }

  /* ---------- site.json: ヒーロー / について / 特徴 ---------- */
  fetch("site.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (site) {
      var hero = site.hero || {};
      if (hero.eyebrow) el("s-eyebrow").textContent = hero.eyebrow;
      if (hero.version) {
        el("s-version").textContent = hero.version;
        el("s-phone-version").textContent = hero.version;
      }
      if (hero.lead) el("s-lead").textContent = hero.lead;
      if (hero.note) el("s-note").textContent = hero.note;
      if (hero.badges && hero.badges.length) {
        var badges = el("s-badges");
        badges.innerHTML = "";
        hero.badges.forEach(function (b) {
          var s = document.createElement("span");
          s.className = "badge";
          s.textContent = b;
          badges.appendChild(s);
        });
      }
      var about = site.about || {};
      if (about.title) el("s-about-title").textContent = about.title;
      if (about.body) el("s-about").textContent = about.body;
      if (site.features && site.features.length) {
        var grid = el("s-features");
        grid.innerHTML = "";
        site.features.forEach(function (f) {
          var art = document.createElement("article");
          art.className = "card";
          var icon = document.createElement("div");
          icon.className = "icon";
          icon.textContent = f.icon || "";
          var h3 = document.createElement("h3");
          h3.textContent = f.title || "";
          var p = document.createElement("p");
          p.textContent = f.body || "";
          art.appendChild(icon);
          art.appendChild(h3);
          art.appendChild(p);
          grid.appendChild(art);
        });
      }
    })
    .catch(function () { /* 読めなければ静的表示のまま */ });

  /* ---------- device.json: 対応端末カード一覧 + 絞り込み ---------- */
  var devices = [];
  var cardEls = {}; // id -> article
  var fQuery = "", fMaker = "*", fStatus = "*";

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
    var visible = 0;
    devices.forEach(function (d) {
      var on = matches(d);
      cardEls[d.id].style.display = on ? "" : "none";
      if (on) visible++;
    });
    el("device-empty").hidden = visible > 0;
  }

  function buildChips(boxId, values, onPick) {
    var box = el(boxId);
    if (!box) return;
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

  function deviceCard(d) {
    var art = document.createElement("article");
    art.className = "card device-list-card";
    var eyebrow = document.createElement("div");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = (d.maker || "") + " / " + d.codename;
    var h3 = document.createElement("h3");
    h3.textContent = d.name;
    var meta = document.createElement("p");
    meta.textContent = "nekoOS " + d.version + " / " + d.base + (d.status ? " / " + d.status : "");
    var actions = document.createElement("div");
    actions.className = "actions";
    var a = document.createElement("a");
    a.className = "btn btn-primary";
    a.href = "device.html?d=" + encodeURIComponent(d.codename || d.id);
    a.textContent = "この端末のページへ";
    actions.appendChild(a);
    art.appendChild(eyebrow);
    art.appendChild(h3);
    art.appendChild(meta);
    art.appendChild(actions);
    return art;
  }

  fetch("device.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      devices = (data && data.devices) || [];
      if (!devices.length) return;
      var list = el("device-list");
      list.innerHTML = "";
      devices.forEach(function (d) {
        var card = deviceCard(d);
        cardEls[d.id] = card;
        list.appendChild(card);
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
    })
    .catch(function () { /* 読めなければ静的カードのまま */ });
})();
