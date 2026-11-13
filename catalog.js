(function () {
  var C = window.SF_CONFIG, $ = function (s) { return document.querySelector(s); };
  var burger = $("#burger"), menu = $("#menu"), grid = $("#products"), all = [], avail = "all";

  function setMenu(o) { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  $("#yr").textContent = new Date().getFullYear();

  function card(p) {
    var url = "product.html?handle=" + encodeURIComponent(p.handle);
    var el = document.createElement("article"); el.className = "card";
    var ph = document.createElement("a"); ph.className = "ph"; ph.href = url; ph.tabIndex = -1; ph.setAttribute("aria-hidden", "true");
    var img = document.createElement("img"); img.loading = "lazy"; img.alt = ""; img.src = p.image || ""; ph.appendChild(img);
    var b = document.createElement("div"); b.className = "body";
    var tag = document.createElement("span"); tag.className = "tag"; tag.textContent = p.available ? "" : "Coming soon";
    var t = document.createElement("h3"); t.textContent = p.title;
    var pr = document.createElement("p"); pr.className = "price"; pr.textContent = "$" + Number(p.price).toFixed(2);
    var a = document.createElement("a"); a.className = "more"; a.href = url; a.innerHTML = '<i aria-hidden="true"></i>';
    a.appendChild(document.createTextNode(p.available ? "Shop now" : "View product"));
    b.appendChild(tag); b.appendChild(t); b.appendChild(pr); b.appendChild(a);
    el.appendChild(ph); el.appendChild(b);
    return el;
  }

  function draw() {
    var f = avail, s = $("#fSort").value;
    var list = all.filter(function (p) { return f === "all" || (f === "in") === p.available; });
    if (s === "lo") list.sort(function (a, b) { return a.price - b.price; });
    if (s === "hi") list.sort(function (a, b) { return b.price - a.price; });
    if (s === "az") list.sort(function (a, b) { return a.title.localeCompare(b.title); });
    grid.textContent = "";
    $("#count").textContent = list.length + (list.length === 1 ? " item" : " items");
    if (!list.length) { grid.innerHTML = '<p class="state">No products match this filter.</p>'; return; }
    list.forEach(function (p) { grid.appendChild(card(p)); });
  }
  $("#tabs").addEventListener("click", function (e) {
    var b = e.target.closest(".tab"); if (!b) return;
    avail = b.dataset.v;
    document.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-pressed", t === b); });
    draw();
  });
  $("#fSort").addEventListener("change", draw);

  function done(list) { all = list; draw(); }
  function viaStorefront() {
    var q = "{products(first:100){nodes{handle title availableForSale featuredImage{url} priceRange{minVariantPrice{amount}}}}}";
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
    .then(function (l) { if (!l.length) throw 0; done(l); })
    .catch(function () { done(C.fallbackProducts); }); // live fetch unavailable: last-known data
})();
