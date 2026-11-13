(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 24); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  // On the landing page, Home / logo links scroll back to the top instead of reloading.
  var onLanding = !!document.getElementById("story");
  if (onLanding) document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href='index.html']");
    if (!a) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
  });

  // Highlight the nav link for the section in view (landing page only).
  var links = {};
  document.querySelectorAll("#menu a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var ids = Object.keys(links).filter(function (id) { return id && document.getElementById(id); });
  if (!ids.length || !("IntersectionObserver" in window)) return;
  var home = document.querySelector("#menu a[href='index.html']");
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
      if (home) home.removeAttribute("aria-current");
      links[e.target.id].setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  ids.forEach(function (id) { io.observe(document.getElementById(id)); });
  window.addEventListener("scroll", function () {
    if (window.scrollY < 200 && home) {
      Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
      home.setAttribute("aria-current", "true");
    }
  }, { passive: true });
})();
