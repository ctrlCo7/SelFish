(function () {
  var C = window.SF_CONFIG, $ = function (s) { return document.querySelector(s); };
  var handle = new URLSearchParams(location.search).get("handle");
  var burger = $("#burger"), menu = $("#menu"), root = $("#pdp");

  function setMenu(o) { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  $("#yr").textContent = new Date().getFullYear();

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function plain(html) { return new DOMParser().parseFromString(html || "", "text/html").body.textContent.trim(); }
  function shopUrl(h) { return C.storeUrl + "/products/" + h; }

  function notFound() {
    root.textContent = "";
    var p = el("p", "state", "We couldn't find that product. ");
    var a = el("a", "more", "Browse all products"); a.href = "catalog.html"; p.appendChild(a); root.appendChild(p);
  }

  function render(p) {
    document.title = p.title + " | SELF+FISH";
    root.textContent = "";
    var grid = el("div", "pdp-grid");

    var thumbs = el("div", "thumbs"), main = el("div", "main-img"), big = el("img");
    var imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
    big.src = imgs[0] || ""; big.alt = p.title; big.width = 800; big.height = 800; main.appendChild(big);
    if (imgs.length > 1) imgs.forEach(function (src, i) {
      var b = el("button"); b.type = "button"; b.setAttribute("aria-label", "View image " + (i + 1));
      if (i === 0) b.setAttribute("aria-current", "true");
      var t = el("img"); t.src = src; t.alt = ""; t.loading = "lazy"; b.appendChild(t);
      b.addEventListener("click", function () {
        big.src = src; thumbs.querySelectorAll("button").forEach(function (x) { x.removeAttribute("aria-current"); }); b.setAttribute("aria-current", "true");
      });
      thumbs.appendChild(b);
    });
    if (imgs.length > 1) grid.appendChild(thumbs); else grid.style.gridTemplateColumns = "minmax(0,1.5fr) minmax(0,1fr)";
    grid.appendChild(main);

    var info = el("div", "info");
    info.appendChild(el("p", "label", p.available ? "Available" : "Coming soon"));
    var row = el("div", "row");
    row.appendChild(el("h1", "", p.title));
    row.appendChild(el("span", "pprice", "$" + Number(p.price).toFixed(2)));
    info.appendChild(row);
    var d = plain(p.description);
    if (d) info.appendChild(el("p", "desc", d)); else info.appendChild(el("div", "desc"));

    var acc = el("details", "acc"), sum = el("summary", "", "Shipping & checkout"); acc.appendChild(sum);
    acc.appendChild(el("p", "", "Secure checkout is handled by Shopify. Shipping and tax are calculated at checkout."));
    info.appendChild(acc);

    var qty = 1, buy = el("div", "buy"), q = el("div", "qty");
    var minus = el("button", "", "−"), num = el("span", "", "1"), plus = el("button", "", "+");
    minus.type = plus.type = "button"; minus.setAttribute("aria-label", "Decrease quantity"); plus.setAttribute("aria-label", "Increase quantity");
    q.appendChild(minus); q.appendChild(num); q.appendChild(plus);
    var add = el("a", "btn", p.available ? "Add to cart" : "Coming soon");
    function link() {
      // Shopify cart permalink adds the variant and opens the Shopify cart/checkout.
      add.href = p.variantId ? C.storeUrl + "/cart/" + p.variantId + ":" + qty : shopUrl(p.handle);
    }
    if (p.available) { link(); } else { add.setAttribute("aria-disabled", "true"); }
    minus.addEventListener("click", function () { qty = Math.max(1, qty - 1); num.textContent = qty; link(); });
    plus.addEventListener("click", function () { qty = Math.min(20, qty + 1); num.textContent = qty; link(); });
    if (p.available) buy.appendChild(q);
    buy.appendChild(add); info.appendChild(buy);

    var more = el("a", "btn ghost full", "Discover the collection"); more.href = "catalog.html"; info.appendChild(more);
    var shop = el("p", "fine"); var sa = el("a", "more", "View on selfandfish.com"); sa.href = shopUrl(p.handle); shop.appendChild(sa); shop.style.marginTop = "18px";
    info.appendChild(shop);
    grid.appendChild(info); root.appendChild(grid);
  }

  function related(list, current) {
    var others = list.filter(function (x) { return x.handle !== current; }).slice(0, 4);
    if (!others.length) return;
    var g = $("#products"); $("#also").hidden = false;
    others.forEach(function (p) {
      var url = "product.html?handle=" + encodeURIComponent(p.handle);
      var c = el("article", "card"), ph = el("a", "ph"), im = el("img");
      ph.href = url; ph.tabIndex = -1; ph.setAttribute("aria-hidden", "true"); im.src = p.image || (p.images && p.images[0]) || ""; im.alt = ""; im.loading = "lazy"; ph.appendChild(im);
      var b = el("div", "body"); b.appendChild(el("span", "tag", p.available ? "" : "Coming soon")); b.appendChild(el("h3", "", p.title)); b.appendChild(el("p", "price", "$" + Number(p.price).toFixed(2)));
      var a = el("a", "more", p.available ? "Shop now" : "View product"); a.href = url; b.appendChild(a);
      c.appendChild(ph); c.appendChild(b); g.appendChild(c);
    });
  }

  function fromJson(j) {
    return j.products.map(function (n) {
      var v = n.variants.filter(function (x) { return x.available; })[0] || n.variants[0];
      return { handle: n.handle, title: n.title, description: n.body_html, images: n.images.map(function (i) { return i.src; }),
        image: n.images[0] && n.images[0].src, available: n.variants.some(function (x) { return x.available; }), price: v.price, variantId: v.id };
    });
  }
  function fromStorefront(j) {
    return j.data.products.nodes.map(function (n) {
      var v = n.variants.nodes.filter(function (x) { return x.availableForSale; })[0] || n.variants.nodes[0];
      return { handle: n.handle, title: n.title, description: n.description, images: n.images.nodes.map(function (i) { return i.url; }),
        image: n.featuredImage && n.featuredImage.url, available: n.availableForSale, price: n.priceRange.minVariantPrice.amount,
        variantId: v && v.id.split("/").pop() };
    });
  }
  function load() {
    if (C.storefrontToken) {
      var q = "{products(first:100){nodes{handle title description availableForSale featuredImage{url} images(first:8){nodes{url}} variants(first:20){nodes{id availableForSale}} priceRange{minVariantPrice{amount}}}}}";
      return fetch(C.storeUrl + "/api/" + C.storefrontApiVersion + "/graphql.json", { method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": C.storefrontToken }, body: JSON.stringify({ query: q }) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(fromStorefront);
    }
    return fetch(C.storeUrl + "/products.json?limit=250").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(fromJson);
  }

  if (!handle) { notFound(); return; }
  load().catch(function () { return C.fallbackProducts; }).then(function (list) {
    var p = list.filter(function (x) { return x.handle === handle; })[0];
    if (!p) { p = C.fallbackProducts.filter(function (x) { return x.handle === handle; })[0]; list = C.fallbackProducts; }
    if (!p) { notFound(); return; }
    render(p); related(list, handle);
  });
})();
