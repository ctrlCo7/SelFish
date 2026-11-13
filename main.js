(function () {
  var C = window.SF_CONFIG, $ = function (s) { return document.querySelector(s); };

  // Mobile menu
  var burger = $("#burger"), menu = $("#menu");
  function setMenu(o) { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  $("#yr").textContent = new Date().getFullYear();

  // Photo slots: show a labelled placeholder until the real photo is added
  [["self-fish-portrait-1.jpg", ".hero-img"], ["self-fish-portrait-2.jpg", ".intro-img"]].forEach(function (p) {
    var fig = $(p[1]), img = fig.querySelector("img");
    function miss() { fig.classList.add("missing"); fig.dataset.slot = "Add " + p[0] + " to assets/images/"; }
    img.addEventListener("error", miss);
    if (img.complete && img.naturalWidth === 0) miss();
  });

  // Scroll reveal
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
    items.forEach(function (i) { io.observe(i); });
  } else items.forEach(function (i) { i.classList.add("in"); });

  // Video
  var v = $("#video");
  if (C.videoEmbedUrl) {
    var f = document.createElement("iframe");
    f.src = C.videoEmbedUrl; f.title = "Video of the week"; f.allowFullscreen = true; f.loading = "lazy";
    v.appendChild(f);
  } else if (C.videoFile) {
    var vid = document.createElement("video");
    vid.src = C.videoFile; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.preload = "metadata";
    vid.setAttribute("muted", ""); vid.setAttribute("playsinline", ""); vid.setAttribute("aria-label", "Video of the week");
    vid.addEventListener("error", function () { v.textContent = "Your weekly video will appear here."; });
    v.appendChild(vid);

    // Custom controls: play/pause, sound, progress
    function btn(cls, label) { var b = document.createElement("button"); b.type = "button"; b.className = "vbtn " + cls; b.setAttribute("aria-label", label); return b; }
    var bar = document.createElement("div"); bar.className = "vbar";
    var play = btn("vplay", "Pause video"), snd = btn("vsound", "Turn sound on");
    var prog = document.createElement("div"); prog.className = "vprog"; var fill = document.createElement("i"); prog.appendChild(fill);
    bar.appendChild(play); bar.appendChild(prog); bar.appendChild(snd); v.appendChild(bar);
    var userPaused = false;
    function sync() { var p = !vid.paused; play.classList.toggle("on", p); play.setAttribute("aria-label", p ? "Pause video" : "Play video"); }
    play.addEventListener("click", function () { if (vid.paused) { userPaused = false; vid.play(); } else { userPaused = true; vid.pause(); } });
    vid.addEventListener("click", function () { play.click(); });
    snd.addEventListener("click", function () { vid.muted = !vid.muted; snd.classList.toggle("on", !vid.muted); snd.setAttribute("aria-label", vid.muted ? "Turn sound on" : "Turn sound off"); });
    vid.addEventListener("play", sync); vid.addEventListener("pause", sync);
    vid.addEventListener("timeupdate", function () { fill.style.width = (vid.currentTime / (vid.duration || 1) * 100) + "%"; });
    prog.addEventListener("click", function (e) { var r = prog.getBoundingClientRect(); vid.currentTime = (e.clientX - r.left) / r.width * (vid.duration || 0); });

    // Autoplay (muted, as browsers require) when scrolled into view; pause when it leaves.
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ("IntersectionObserver" in window && !reduce) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !userPaused) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else if (!e.isIntersecting) vid.pause();
        });
      }, { threshold: 0.5 }).observe(v);
    }
    sync();
  } else v.textContent = "Your weekly video will appear here.";

  // Social
  var soc = $("#social");
  (C.social || []).forEach(function (s) {
    var a = document.createElement("a"); a.href = s.url; a.textContent = s.label; a.rel = "noopener"; a.target = "_blank"; soc.appendChild(a); soc.appendChild(document.createElement("br"));
  });

  // Products
  var grid = $("#products");
  function money(n) { return "$" + Number(n).toFixed(2); }
  function render(list) {
    grid.textContent = "";
    if (!list.length) { grid.innerHTML = '<p class="state">The collection is being refreshed. Please visit our <a class="link" href="' + C.storeUrl + '/collections/all">full catalog</a>.</p>'; return; }
    list.forEach(function (p) {
      var url = "product.html?handle=" + encodeURIComponent(p.handle);
      var el = document.createElement("article"); el.className = "card";
      var ph = document.createElement("a"); ph.className = "ph"; ph.href = url; ph.tabIndex = -1; ph.setAttribute("aria-hidden", "true");
      var img = document.createElement("img"); img.loading = "lazy"; img.alt = ""; img.src = p.image || ""; ph.appendChild(img);
      var b = document.createElement("div"); b.className = "body";
      var t = document.createElement("h3"); t.textContent = p.title;
      var pr = document.createElement("p"); pr.className = "price"; pr.textContent = money(p.price);
      var tag = document.createElement("span"); tag.className = "tag"; tag.textContent = p.available ? "" : "Coming soon";
      var a = document.createElement("a"); a.className = "more"; a.href = url;
      a.innerHTML = '<i aria-hidden="true"></i>';
      a.appendChild(document.createTextNode(p.available ? "Shop now" : "View product"));
      b.appendChild(tag); b.appendChild(t); b.appendChild(pr); b.appendChild(a);
      el.appendChild(ph); el.appendChild(b); grid.appendChild(el);
    });
  }
  function order(list) {
    return C.featuredHandles.map(function (h) { return list.filter(function (p) { return p.handle === h; })[0]; }).filter(Boolean);
  }
  function viaStorefront() {
    var q = "{products(first:50){nodes{handle title availableForSale featuredImage{url} priceRange{minVariantPrice{amount}}}}}";
    return fetch(C.storeUrl + "/api/" + C.storefrontApiVersion + "/graphql.json", {
      method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": C.storefrontToken }, body: JSON.stringify({ query: q })
    }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      return j.data.products.nodes.map(function (n) { return { handle: n.handle, title: n.title, available: n.availableForSale, image: n.featuredImage && n.featuredImage.url, price: n.priceRange.minVariantPrice.amount }; });
    });
  }
  function viaJson() {
    return fetch(C.storeUrl + "/products.json?limit=250").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      return j.products.map(function (n) {
        return { handle: n.handle, title: n.title, image: n.images[0] && n.images[0].src,
          available: n.variants.some(function (x) { return x.available; }), price: n.variants[0].price };
      });
    });
  }
  (C.storefrontToken ? viaStorefront() : viaJson())
    .then(function (l) { var o = order(l); if (!o.length) throw 0; render(o); })
    .catch(function () { render(C.fallbackProducts); }); // live fetch unavailable (e.g. CORS): last-known data
})();
