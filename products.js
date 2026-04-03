let grid;
const filters = document.querySelectorAll(".filters input");
let products = [];
document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("productsGrid");
  filters.forEach((cb) => cb.addEventListener("change", applyFilters));

  showSkeleton();

  setTimeout(() => {
    fetch("solution/data.json")
      .then((res) => res.json())
      .then((data) => {
        products = data;
        applyFilters();
      })
      .catch((err) => {
        console.error(err);
        grid.innerHTML =
          '<div class="empty-message grid-full">Failed to load products</div>';
      });
  }, 1500);
});

function showSkeleton() {
  grid.innerHTML = "";
  for (let i = 0; i < 12; i++) {
    const sk = document.createElement("div");
    sk.className = "card skeleton";
    sk.setAttribute("data-test-id", "skeleton-card");
    grid.appendChild(sk);
  }
}

function renderProducts(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>No products found</p>";
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const boughtIds = orders.flatMap((o) => o.items?.map((i) => i.id));

  list.forEach((p) => {
    const isBought = boughtIds.includes(p.id);

    const card = document.createElement("div");
    card.setAttribute("data-test-id", "product-card");
    card.className = "card";
    card.id = "product-${p.id}";

    card.innerHTML = `
      ${isBought ? `<div class="purchased">Purchased</div>` : ""}
      <img src="solution/${p.image}" alt="">
      <div class="card-body">
        <div class="type" data-test-id="product-type">${p.type}</div>
        <h3 data-test-id="product-title">${p.name}</h3>
        <p data-test-id="product-price">$${p.price.toLocaleString()}</p>
      </div>
    `;

    if (isBought) {
      card.classList.add("bought");
    } else {
      card.onclick = () => openModal(p);
    }
    //card.addEventListener("click", () => openModal(p));
    grid.appendChild(card);
  });
}

/* ---------- FILTERS ---------- */
function applyFilters() {
  const active = [...filters].filter((f) => f.checked).map((f) => f.value);

  let list = products;

  if (active.length) {
    list = products.filter((p) => active.includes(p.type));
  }

  renderProducts(list);
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("suggestions");
});

let searchText = "";

/* ---------- SEARCH LOGIC ---------- */

searchInput.addEventListener("input", () => {
  const value = searchInput.value.trim().toLowerCase();
  searchText = value;

  suggestionsBox.classList.remove("hidden");
  suggestionsBox.innerHTML = "<div>Loading...</div>";

  setTimeout(() => {
    if (!value) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    let matches = products.filter((p) => p.name.toLowerCase().includes(value));

    matches.sort((a, b) => a.name.localeCompare(b.name));

    matches = matches.slice(0, 3);

    suggestionsBox.innerHTML = "";

    if (!matches.length) {
      suggestionsBox.innerHTML = "<div>No results</div>";
      return;
    }

    matches.forEach((p) => {
      const div = document.createElement("div");
      div.textContent = p.name;

      div.onmousedown = () => {
        // сброс фильтров
        filters.forEach((f) => (f.checked = false));

        searchInput.value = p.name;
        searchText = p.name.toLowerCase();

        suggestionsBox.classList.add("hidden");

        applyFiltersAndSearch();
      };

      suggestionsBox.appendChild(div);
    });
  }, 1500);
});

/* Enter = фильтр */

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    applyFiltersAndSearch();
    suggestionsBox.classList.add("hidden");
  }
});

searchInput.addEventListener("blur", () => {
  setTimeout(() => {
    suggestionsBox.classList.add("hidden");
  }, 150);
});

/* ---------- Combined filter + search ---------- */

function applyFiltersAndSearch() {
  const active = [...filters].filter((f) => f.checked).map((f) => f.value);

  let list = products;

  if (active.length) {
    list = list.filter((p) => active.includes(p.type));
  }

  if (searchText) {
    list = list.filter((p) => p.name.toLowerCase().includes(searchText));
  }

  renderProducts(list);
}

let modal,
  modalImage,
  modalName,
  modalType,
  modalDesc,
  modalPrice,
  cartBtn,
  notification;
let currentProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  modal = document.getElementById("productModal");
  modalImage = document.getElementById("modalImage");
  modalName = document.getElementById("modalName");
  modalType = document.getElementById("modalType");
  modalDesc = document.getElementById("modalDesc");
  modalPrice = document.getElementById("modalPrice");
  cartBtn = document.getElementById("cartBtn");
  notification = document.getElementById("notification");

  document.querySelector(".modal-close").onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  document.onkeydown = (e) => {
    if (e.key === "Escape") closeModal();
  };

  cartBtn.onclick = handleCartClick;
});

function openModal(product) {
  currentProduct = product;

  modalImage.src = "solution/" + product.image;
  modalName.textContent = product.name;
  modalType.textContent = product.type.toUpperCase();
  modalDesc.textContent = product.description;
  modalPrice.textContent = "$" + product.price.toLocaleString();

  updateCartButton();

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

/* ---------- CART ---------- */

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function isInCart(id) {
  return getCart().some((p) => p.id === id);
}

function updateCartButton() {
  if (isInCart(currentProduct.id)) {
    cartBtn.textContent = "Remove from cart";
    cartBtn.setAttribute("data-test-id", "remove-from-cart");
  } else {
    cartBtn.textContent = "Add to cart";
    cartBtn.setAttribute("data-test-id", "add-to-cart");
  }
}

function handleCartClick() {
  let cart = getCart();
  const exists = isInCart(currentProduct.id);

  cartBtn.disabled = true;

  if (!exists) {
    cart.push(currentProduct);
    saveCart(cart);

    cartBtn.textContent = "Added";
    showNotification("Great choice!");
  } else {
    cart = cart.filter((p) => p.id !== currentProduct.id);
    saveCart(cart);

    cartBtn.textContent = "Removed";
    showNotification("Looking for something better?");
  }

  setTimeout(() => {
    updateCartButton();
    cartBtn.disabled = false;
  }, 2000);
}

/* ---------- NOTIFICATION ---------- */

function showNotification(text) {
  notification.textContent = text;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 2000);
}

/* ---------- CART BADGE ---------- */

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  const count = getCart().length;

  if (!badge) return;

  if (count === 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "inline-block";
    badge.textContent = count;
  }
}
