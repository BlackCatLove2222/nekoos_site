/* nekoOS サイト: device.json から端末ごとの表示を描画する。
   読めなければ静的 HTML (Pixel 2) のまま表示される。 */
(function () {
  "use strict";
  function el(id) { return document.getElementById(id); }
  var tabsBox = el("device-tabs");

  function render(d) {
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
    Array.prototype.forEach.call(tabsBox.children, function (b) {
      var on = b.dataset.id === d.id;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  fetch("device.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var devices = (data && data.devices) || [];
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
      });
      render(devices[0]);
    })
    .catch(function () { /* 読めなければ静的表示のまま */ });
})();
