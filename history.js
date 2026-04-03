const list = document.getElementById("historyList");
const emptyBox = document.getElementById("ordersEmpty");

const orders = JSON.parse(localStorage.getItem("orders") || "[]").reverse();

list.innerHTML = "";

if (orders.length === 0) {
  emptyBox.classList.remove("hidden");
} else {
  emptyBox.classList.add("hidden");

  orders.forEach((o) => {
    const d = document.createElement("div");
    d.className = "card";
    d.setAttribute("data-test-id", "orders-item");

    d.innerHTML = `
      <div class="card-content">
        <b>${o.id}</b><br>
        Date: ${o.date}<br>
        Items: ${o.items.map((i) => i.name).join(", ")}<br>
        Total: $${o.total.toLocaleString()}
      </div>
    `;

    list.appendChild(d);
  });
}
