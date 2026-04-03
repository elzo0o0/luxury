const list = document.getElementById("cartList");
const footer = document.getElementById("cartFooter");
const emptyBox = document.getElementById("cartEmpty");
const removeModal = document.getElementById("removeModal");
const confirmRemoveBtn = document.getElementById("confirmRemove");
const cancelRemoveBtn = document.getElementById("cancelRemove");

let removeId = null;

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function isAuthorized() {
  return localStorage.getItem("name") && localStorage.getItem("email");
}

function notify(text) {
  const n = document.getElementById("notification");
  if (!n) return;

  n.textContent = text;
  n.classList.remove("hidden");

  setTimeout(() => n.classList.add("hidden"), 2000);
}

function renderCart() {
  const cart = getCart();

  list.innerHTML = "";
  footer.innerHTML = "";

  if (!cart.length) {
    list.innerHTML =
      '<div class="cart-empty" data-test-id="cart_empty">Cart is empty</div>';
    return;
  }

  let total = 0;

  cart.forEach((p) => {
    total += p.price;

    const d = document.createElement("div");
    d.className = "cart-item";
    d.setAttribute("data-test-id", "cart-item");

    d.innerHTML = `
      <img src="solution/${p.image}" class="cart-img">
      <div class="cart-info">
        <div class="cart-name">${p.name}</div>
        <div class="cart-price">$${p.price.toLocaleString()}</div>
      </div>
      <button class="cart-remove" data-test-id="cart-remove">Remove</button>
    `;

    d.querySelector("button").onclick = () => openRemoveModal(p.id);

    list.appendChild(d);
  });

  footer.innerHTML = `
    <h3 data-test-id="cart-total">Total: $${total.toLocaleString()}</h3>
    ${
      isAuthorized()
        ? '<button id="orderBtn" data-test-id="checkout-button">Place order</button>'
        : "<button onclick=\"location.href='profile.html'\">Login to place an order</button>"
    }
  `;

  document.getElementById("orderBtn")?.addEventListener("click", placeOrder);
}

function openRemoveModal(id) {
  removeId = id;
  removeModal.classList.remove("hidden");
}

cancelRemoveBtn.onclick = () => {
  removeModal.classList.add("hidden");
  removeId = null;
};

confirmRemoveBtn.onclick = () => {
  let cart = getCart().filter((p) => p.id !== removeId);
  localStorage.setItem("cart", JSON.stringify(cart));

  removeModal.classList.add("hidden");
  removeId = null;

  notify("Looking for something better?");
  updateCartCount();
  renderCart();
};

function placeOrder() {
  const btn = document.getElementById("orderBtn");
  btn.disabled = true;

  const cancel = document.createElement("button");
  cancel.textContent = "Cancel";
  cancel.setAttribute("data-test-id", "cancel-checkout-button");

  footer.appendChild(cancel);

  const timer = setTimeout(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const cart = getCart();
    const total = cart.reduce((s, p) => s + p.price, 0);

    orders.push({
      id: "ORD-" + Date.now(),
      date: new Date().toLocaleDateString("ru-RU"),
      items: cart,
      total,
    });

    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.removeItem("cart");

    location.href = "history.html";
  }, 1500);

  cancel.onclick = () => {
    clearTimeout(timer);
    btn.disabled = false;
    cancel.remove();
  };
}

renderCart();
