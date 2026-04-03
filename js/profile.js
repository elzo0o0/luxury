const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const notifyInput = document.getElementById("notify");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const msg = document.getElementById("msg");

nameInput.value = localStorage.getItem("name") || "";
emailInput.value = localStorage.getItem("email") || "";
notifyInput.checked = localStorage.getItem("notify") === "true";

function isValidEmail(email) {
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  const domain = email.split("@")[1];
  const dotCount = (domain.match(/\./g) || []).length;

  return dotCount <= 1;
}

document.getElementById("saveBtn").onclick = () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  nameError.textContent = "";
  emailError.textContent = "";
  msg.textContent = "";

  nameInput.classList.remove("error-input");
  emailInput.classList.remove("error-input");

  let valid = true;

  if (!name) {
    nameError.textContent = "Name is required";
    nameInput.classList.add("error-input");
    valid = false;
  }

  if (!email || !isValidEmail(email)) {
    emailError.textContent = "Invalid email format";
    emailInput.classList.add("error-input");
    valid = false;
  }

  if (!valid) return;

  localStorage.setItem("name", name);
  localStorage.setItem("email", email);
  localStorage.setItem("notify", notifyInput.checked);

  msg.textContent = "Data saved";

  setTimeout(() => {
    msg.textContent = "";
  }, 2000);
};
