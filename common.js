document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("themeBtn");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.removeItem("theme");
    }
  });

  updateCartCount();

  const input = document.getElementById("searchInput");
  const box = document.getElementById("suggestions");

  if (!input || !box) return;

  let products = [];

  fetch("solution/data.json")
    .then((r) => r.json())
    .then((data) => (products = data))
    .catch(() => {});

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    box.innerHTML = "";

    if (!q) {
      box.classList.add("hidden");
      return;
    }

    const found = products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 3);

    if (!found.length) {
      box.classList.add("hidden");
      return;
    }

    found.forEach((p) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.setAttribute("data-test-id", "suggestion-item");
      div.textContent = p.name;

      div.onclick = () => {
        window.location.href =
          "index.html?search=${encodeURIComponent(p.name)}";
      };
      box.appendChild(div);
    });

    box.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      box.classList.add("hidden");
    }
  });
});

function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    badge.textContent = "";
  } else {
    badge.textContent = cart.length;
  }
}
