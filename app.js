/* SARU site: gallery, lightbox, meme maker, small bits of chaos. No dependencies. */
(() => {
  "use strict";
  const C = window.SARU_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const titleize = (n) => n.replace(/[-_]+/g, " ").replace(/\s+\d+$/, "").trim();
  const catLabel = { moods: "Moods", costumes: "Costumes", christmas: "Christmas", couples: "Love" };
  const labelOf = (c) => catLabel[c] || c.charAt(0).toUpperCase() + c.slice(1);
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  let ALL = (window.SARU_STICKERS || []).map((s, i) => ({ ...s, id: i, title: titleize(s.name) }));

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1900);
  }

  /* ---------- config bindings ---------- */
  function bindConfig() {
    const ca = (C.ca || "").trim();
    const buy = C.buyUrl || (ca ? `https://pump.fun/coin/${ca}` : "");
    $$("[data-x]").forEach((a) => (a.href = C.x || "https://x.com/SaruHQ"));
    $$("[data-fill=chain]").forEach((e) => (e.textContent = C.chain || "Solana"));
    $$("[data-fill=supply]").forEach((e) => (e.textContent = C.supply || "1,000,000,000"));
    $$("[data-fill=tax]").forEach((e) => (e.textContent = C.tax || "0%"));

    const shown = ca || "coming soon";
    $$("#caVal, [data-ca]").forEach((e) => (e.textContent = shown));
    $$("#caCopy, [data-copy]").forEach((b) => {
      b.disabled = !ca;
      b.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(ca); } catch { const t = document.createElement("textarea"); t.value = ca; document.body.append(t); t.select(); document.execCommand("copy"); t.remove(); }
        b.textContent = "Copied!"; toast("CA copied. Stay unbothered. 🙈"); setTimeout(() => (b.textContent = "Copy"), 1500);
      });
    });

    $$("[data-buy]").forEach((a) => {
      if (buy) { a.href = buy; a.target = "_blank"; a.rel = "noopener"; }
      else {
        a.setAttribute("aria-disabled", "true"); a.href = "#buy";
        a.addEventListener("click", (e) => { if (!location.hash.includes("buy")) return; e.preventDefault(); toast("CA coming soon. The monkey is still choosing an outfit."); });
      }
    });

    if (C.telegram) { const t = $("#tgLink"); t.href = C.telegram; t.hidden = false; }
    if (C.github) {
      const repo = `https://github.com/${C.github}`;
      const g = $("#ghLink"); g.href = repo; g.hidden = false;
      const r = $("#repoBtn"); r.href = repo; r.hidden = false;
      const a = $("#addBtn"); a.href = `${repo}/upload/main/stickers`; a.hidden = false;
    }
  }

  /* ---------- optional: live list from GitHub (if manifest missing) ---------- */
  async function loadFromGitHub() {
    if (ALL.length || !C.github) return;
    try {
      const base = `https://api.github.com/repos/${C.github}/contents/stickers`;
      const cats = (await (await fetch(base)).json()).filter((x) => x.type === "dir");
      const lists = await Promise.all(cats.map((c) => fetch(c.url).then((r) => r.json())));
      let id = 0;
      lists.forEach((files, i) => files.filter((f) => /\.(webp|png|jpe?g|gif)$/i.test(f.name)).forEach((f) => {
        const name = f.name.replace(/\.[^.]+$/, "");
        ALL.push({ id: id++, cat: cats[i].name, name, title: titleize(name), src: f.download_url });
      }));
    } catch (e) { console.warn("GitHub listing failed", e); }
  }

  /* ---------- helpers that need stickers ---------- */
  const byCat = (c) => ALL.filter((s) => s.cat === c);
  const pickSrc = (cat) => { const l = cat && cat !== "all" ? byCat(cat) : ALL; return (l.length ? rnd(l) : ALL[0] || {}).src || ""; };

  function fillPickImgs() {
    $$("img[data-pick]").forEach((img) => { img.src = pickSrc(img.dataset.pick); });
  }

  /* ---------- hero: costume swapper + bubble + floaters ---------- */
  function hero() {
    const costumes = shuffle(byCat("costumes").length ? byCat("costumes") : ALL);
    const img = $("#stageImg"), nm = $("#stageName");
    if (!img || !costumes.length) return;
    let i = 0;
    const show = () => {
      const s = costumes[i % costumes.length]; i++;
      img.classList.remove("pop"); void img.offsetWidth;
      img.src = s.src; img.alt = `SARU in a costume: ${s.title}`; nm.textContent = s.title;
      img.classList.add("pop");
    };
    show();
    if (!reduced) setInterval(show, 2300);

    const lines = ["…", "i don't care.", "cool.", "ok.", "sure.", "wow. anyway.", "market's red? same face.", "no KOL. no problem.", "nice costume.", "hm."];
    const b = $("#bubble"); let li = 0;
    const say = () => { b.textContent = lines[li++ % lines.length]; };
    if (!reduced) setInterval(say, 3200);
    $("#faceWrap").addEventListener("click", () => { b.textContent = rnd(lines); });

    const L = $("#floatLayer");
    const spots = [["2%", "2%", -8], ["80%", "0%", 10], ["-4%", "42%", 6], ["88%", "46%", -6], ["8%", "86%", 8], ["78%", "84%", -10]];
    shuffle(ALL).slice(0, spots.length).forEach((s, k) => {
      const f = document.createElement("img");
      f.src = s.src; f.alt = ""; f.loading = "lazy"; f.width = f.height = 110;
      f.style.cssText = `left:${spots[k][0]};top:${spots[k][1]};--r:${spots[k][2]}deg;animation-delay:${-k * 0.9}s`;
      L.append(f);
    });
  }

  /* ---------- vault ---------- */
  const V = { cat: "all", q: "", list: [], idx: 0 };
  function vault() {
    $("#vaultCount").textContent = "0";
    countUp($("#vaultCount"), ALL.length);

    const cats = ["all", ...new Set(ALL.map((s) => s.cat))];
    const tabs = $("#tabs");
    tabs.innerHTML = "";
    cats.forEach((c) => {
      const n = c === "all" ? ALL.length : byCat(c).length;
      const b = document.createElement("button");
      b.className = "tab"; b.role = "tab"; b.dataset.cat = c;
      b.setAttribute("aria-selected", c === V.cat);
      b.innerHTML = `${c === "all" ? "All" : labelOf(c)}<small>${n}</small>`;
      b.onclick = () => { V.cat = c; $$(".tab", tabs).forEach((t) => t.setAttribute("aria-selected", t === b)); render(); };
      tabs.append(b);
    });
    $("#search").addEventListener("input", (e) => { V.q = e.target.value.trim().toLowerCase(); render(); });
    render();
  }
  function render() {
    const g = $("#grid");
    V.list = ALL.filter((s) => (V.cat === "all" || s.cat === V.cat) && (!V.q || (s.title + " " + s.cat).toLowerCase().includes(V.q)));
    g.innerHTML = "";
    const frag = document.createDocumentFragment();
    V.list.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "card"; b.type = "button";
      b.style.setProperty("--tilt", ((i * 37) % 7 - 3) * 0.5 + "deg");
      b.style.setProperty("--i", Math.min(i, 24));
      b.innerHTML = `<img src="${s.src}" alt="${s.title}" loading="lazy" decoding="async" width="440" height="440"><span>${s.title}</span>`;
      b.onclick = () => openLb(i);
      frag.append(b);
    });
    g.append(frag);
    $("#empty").hidden = V.list.length > 0;
  }
  function countUp(el, to) {
    if (reduced || !to) { el.textContent = to; return; }
    let n = 0; const step = Math.max(1, Math.round(to / 40));
    const t = setInterval(() => { n = Math.min(to, n + step); el.textContent = n; if (n >= to) clearInterval(t); }, 24);
  }

  /* ---------- image utils ---------- */
  const imgCache = new Map();
  function loadImg(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((res, rej) => { const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => res(im); im.onerror = rej; im.src = src; });
    imgCache.set(src, p); return p;
  }
  const toBlob = (cv) => new Promise((res, rej) => { try { cv.toBlob((b) => (b ? res(b) : rej(new Error("empty"))), "image/png"); } catch (e) { rej(e); } });
  function saveBlob(blob, name) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function copyBlob(blob) {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  }
  async function stickerPng(s, size = 900) {
    const im = await loadImg(s.src);
    const cv = document.createElement("canvas"); cv.width = cv.height = size;
    const x = cv.getContext("2d"); x.imageSmoothingQuality = "high";
    x.drawImage(im, 0, 0, size, size);
    return toBlob(cv);
  }
  const fileOnlyMsg = "Export needs the site served over http(s) (GitHub Pages works). Right-click the image to save it instead.";

  /* ---------- lightbox ---------- */
  function openLb(i) {
    V.idx = (i + V.list.length) % V.list.length;
    const s = V.list[V.idx];
    $("#lbImg").src = s.src; $("#lbImg").alt = s.title;
    $("#lbTitle").textContent = s.title; $("#lbCat").textContent = labelOf(s.cat);
    $("#lbNote").textContent = "";
    const lb = $("#lb"); lb.hidden = false; document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  }
  function closeLb() { $("#lb").hidden = true; document.body.style.overflow = ""; }
  function lightbox() {
    $("#lbClose").onclick = closeLb;
    $("#lb").addEventListener("click", (e) => { if (e.target.id === "lb") closeLb(); });
    $("#lbPrev").onclick = () => openLb(V.idx - 1);
    $("#lbNext").onclick = () => openLb(V.idx + 1);
    document.addEventListener("keydown", (e) => {
      if ($("#lb").hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") openLb(V.idx - 1);
      if (e.key === "ArrowRight") openLb(V.idx + 1);
    });
    $("#lbDownload").onclick = async () => {
      const s = V.list[V.idx];
      try { saveBlob(await stickerPng(s), `saru-${s.name}.png`); toast("Downloaded. Go reply to someone."); }
      catch { const a = document.createElement("a"); a.href = s.src; a.download = `saru-${s.name}.webp`; a.click(); $("#lbNote").textContent = "Saved as WebP. (PNG export needs http(s).)"; }
    };
    $("#lbCopy").onclick = async () => {
      try { await copyBlob(await stickerPng(V.list[V.idx])); toast("Copied. Paste it anywhere. 🙈"); }
      catch { $("#lbNote").textContent = "Couldn't copy here. Use Download instead."; }
    };
    $("#lbMeme").onclick = () => { const s = V.list[V.idx]; closeLb(); mk.sticker = s; mkRefreshPicker(); mkDraw(); $("#maker").scrollIntoView({ behavior: "smooth" }); };
  }

  /* ---------- meme maker ---------- */
  const mk = { sticker: null, bg: "sun", size: 0.68 };
  const CAPS = [
    ["WHEN THE CHART DUMPS", "SARU DOESN'T CARE"], ["BUY? SELL?", "SAME FACE."], ["THEY PAID A KOL", "I PAID IN COSTUMES"],
    ["ME: PANIC", "SARU: ..."], ["NEW COSTUME", "SAME ENERGY"], ["SOMEONE SAID 'FINANCIAL ADVICE'", "ANYWAY."],
    ["MARKET: -40%", "SARU: ok."], ["POV: YOU'RE THE MONKEY", "AND YOU DON'T CARE"], ["NO KOL.", "NO PROBLEM."], ["IT'S GREEN?", "COOL."],
  ];
  function wrap(ctx, text, maxW) {
    const words = text.split(/\s+/).filter(Boolean), lines = []; let cur = "";
    words.forEach((w) => { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function drawText(ctx, text, S, where) {
    text = text.trim().toUpperCase(); if (!text) return;
    const maxW = S * 0.92; let size = S * 0.088, lines;
    for (;;) {
      ctx.font = `${size}px "Bowlby One", Impact, "Arial Black", sans-serif`;
      lines = wrap(ctx, text, maxW);
      if (lines.length <= 2 && Math.max(...lines.map((l) => ctx.measureText(l).width)) <= maxW) break;
      size -= 4; if (size < 34) break;
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    ctx.lineWidth = size * 0.2; ctx.strokeStyle = "#1b1511"; ctx.fillStyle = "#fff";
    const lh = size * 1.05, h = lines.length * lh;
    const y0 = where === "top" ? S * 0.045 + lh / 2 : S - S * 0.045 - h + lh / 2;
    lines.forEach((l, k) => { const y = y0 + k * lh; ctx.strokeText(l, S / 2, y); ctx.fillText(l, S / 2, y); });
  }
  async function mkDraw() {
    const cv = $("#mkCanvas"); if (!cv) return;
    const S = 1000, ctx = cv.getContext("2d"); cv.width = cv.height = S;
    ctx.clearRect(0, 0, S, S);
    const fills = { cream: "#fff4df", white: "#ffffff", banana: "#ffd23f", night: "#171a3a", sun: "#fff4df" };
    if (mk.bg !== "clear") { ctx.fillStyle = fills[mk.bg]; ctx.fillRect(0, 0, S, S); }
    if (mk.bg === "sun") { ctx.fillStyle = "#e8352e"; ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.43, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = "#1b1511"; ctx.stroke(); }
    if (mk.bg === "night") { ctx.fillStyle = "#ffd23f"; [[120, 140, 7], [880, 200, 5], [160, 760, 6], [860, 700, 8], [500, 90, 4]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }); }
    if (mk.sticker) {
      try {
        const im = await loadImg(mk.sticker.src); const d = S * mk.size;
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
        ctx.drawImage(im, (S - d) / 2, (S - d) / 2 + S * 0.02, d, d); ctx.restore();
      } catch { /* image failed */ }
    }
    try { await document.fonts.load('60px "Bowlby One"'); } catch { }
    drawText(ctx, $("#mkTop").value, S, "top");
    drawText(ctx, $("#mkBottom").value, S, "bottom");
  }
  function mkRefreshPicker() {
    const cat = $("#mkCat").value, p = $("#mkPicker");
    const list = cat === "all" ? ALL : byCat(cat);
    p.innerHTML = "";
    list.forEach((s) => {
      const b = document.createElement("button"); b.type = "button"; b.title = s.title;
      if (mk.sticker && mk.sticker.src === s.src) b.className = "on";
      b.innerHTML = `<img src="${s.src}" alt="${s.title}" loading="lazy" width="64" height="64">`;
      b.onclick = () => { mk.sticker = s; $$("button", p).forEach((x) => x.classList.toggle("on", x === b)); mkDraw(); };
      p.append(b);
    });
  }
  function maker() {
    if (!$("#mkCanvas") || !ALL.length) return;
    const sel = $("#mkCat");
    ["all", ...new Set(ALL.map((s) => s.cat))].forEach((c) => { const o = document.createElement("option"); o.value = c; o.textContent = c === "all" ? "All stickers" : labelOf(c); sel.append(o); });
    sel.onchange = mkRefreshPicker;
    mk.sticker = ALL.find((s) => s.name === "deadpan-annoyed") || ALL.find((s) => s.cat === "moods") || ALL[0];
    mkRefreshPicker();
    ["mkTop", "mkBottom"].forEach((id) => $("#" + id).addEventListener("input", mkDraw));
    $("#mkSize").addEventListener("input", (e) => { mk.size = e.target.value / 100; mkDraw(); });
    $("#mkBgs").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-bg]"); if (!b) return;
      mk.bg = b.dataset.bg; $$("#mkBgs .bg").forEach((x) => x.classList.toggle("on", x === b)); mkDraw();
    });
    $("#mkRandom").onclick = () => {
      const [t, b] = rnd(CAPS); $("#mkTop").value = t; $("#mkBottom").value = b;
      mk.sticker = rnd(ALL); mk.bg = rnd(["sun", "cream", "banana", "night"]);
      $$("#mkBgs .bg").forEach((x) => x.classList.toggle("on", x.dataset.bg === mk.bg));
      mkRefreshPicker(); mkDraw();
    };
    $("#mkDownload").onclick = async () => {
      try { saveBlob(await toBlob($("#mkCanvas")), "saru-meme.png"); $("#mkNote").textContent = ""; toast("Meme saved. Go post it. 🐒"); }
      catch { $("#mkNote").textContent = fileOnlyMsg; }
    };
    $("#mkCopy").onclick = async () => {
      try { await copyBlob(await toBlob($("#mkCanvas"))); $("#mkNote").textContent = ""; toast("Meme copied. Paste it into a reply."); }
      catch { $("#mkNote").textContent = "Couldn't copy here. Use Download instead."; }
    };
    mkDraw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(mkDraw);
  }

  /* ---------- nav + reveal ---------- */
  function chrome() {
    const burger = $("#burger"), links = $("#links");
    burger.addEventListener("click", () => { const o = links.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", links).forEach((a) => a.addEventListener("click", () => { links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
    // safety: never leave content hidden
    setTimeout(() => $$(".reveal").forEach((el) => el.classList.add("in")), 4000);
  }

  /* ---------- boot ---------- */
  (async function boot() {
    bindConfig(); chrome();
    await loadFromGitHub();
    ALL = ALL.map((s, i) => ({ ...s, id: i }));
    fillPickImgs(); hero(); vault(); lightbox(); maker();
  })();
})();
