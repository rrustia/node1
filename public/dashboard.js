const state = {
  transactions: [],
  filter: "all",
  search: "",
  editingId: null
};

const elements = {
  balance: document.querySelector("#balance-value"),
  balanceNote: document.querySelector("#balance-note"),
  income: document.querySelector("#income-value"),
  expense: document.querySelector("#expense-value"),
  count: document.querySelector("#transaction-count"),
  list: document.querySelector("#transaction-list"),
  empty: document.querySelector("#empty-state"),
  categories: document.querySelector("#category-list"),
  categoryFootnote: document.querySelector("#category-footnote"),
  search: document.querySelector("#search-input"),
  dialog: document.querySelector("#transaction-dialog"),
  form: document.querySelector("#transaction-form"),
  formTitle: document.querySelector("#form-title"),
  formEyebrow: document.querySelector("#form-eyebrow"),
  formError: document.querySelector("#form-error"),
  description: document.querySelector("#description-input"),
  amount: document.querySelector("#amount-input"),
  type: document.querySelector("#type-input"),
  category: document.querySelector("#category-input"),
  date: document.querySelector("#date-input"),
  save: document.querySelector("#save-button"),
  toast: document.querySelector("#toast")
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

async function request(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  const payload = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(payload.error || "Something went wrong");
  return payload.data;
}

function formatCurrency(amount) {
  return currency.format(amount);
}

function formatDate(date) {
  return dateFormatter.format(new Date(date));
}

function renderSummary(summary) {
  elements.balance.textContent = formatCurrency(summary.balance);
  elements.income.textContent = formatCurrency(summary.income);
  elements.expense.textContent = formatCurrency(summary.expense);
  elements.count.textContent = summary.count;
  elements.balanceNote.textContent = summary.balance >= 0 ? "You are in the green" : "Expenses are ahead of income";
}

function visibleTransactions() {
  return state.transactions.filter((transaction) => {
    const matchesFilter = state.filter === "all" || transaction.type === state.filter;
    const query = state.search.toLowerCase();
    const matchesSearch = !query || [transaction.description, transaction.category, transaction.type].some((value) => value.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });
}

function renderTransactions() {
  const transactions = visibleTransactions();
  elements.list.innerHTML = transactions.map((transaction) => `
    <tr>
      <td><span class="transaction-description">${escapeHtml(transaction.description)}</span><span class="transaction-type">${transaction.type}</span></td>
      <td><span class="category-tag">${escapeHtml(transaction.category)}</span></td>
      <td class="date-cell">${formatDate(transaction.date)}</td>
      <td class="amount ${transaction.type}">${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}</td>
      <td><div class="row-actions"><button class="action-button" type="button" data-action="edit" data-id="${transaction.id}">Edit</button><button class="action-button" type="button" data-action="delete" data-id="${transaction.id}" aria-label="Delete ${escapeHtml(transaction.description)}">×</button></div></td>
    </tr>
  `).join("");

  elements.empty.hidden = transactions.length > 0;
  if (transactions.length === 0 && state.transactions.length > 0) {
    elements.empty.querySelector("h3").textContent = "No matching transactions";
    elements.empty.querySelector("p").textContent = "Try a different search or filter to find what you are looking for.";
    document.querySelector("#empty-add-button").hidden = true;
  } else {
    elements.empty.querySelector("h3").textContent = "No transactions yet";
    elements.empty.querySelector("p").textContent = "Add your first entry and your overview will take shape here.";
    document.querySelector("#empty-add-button").hidden = false;
  }
}

function renderCategories(summary) {
  const categories = Object.entries(summary.byCategory).sort(([, first], [, second]) => second - first);
  const highest = categories[0]?.[1] || 1;
  elements.categories.innerHTML = categories.slice(0, 5).map(([category, amount]) => `
    <div class="category-item">
      <div class="category-item-head"><span>${escapeHtml(category.charAt(0).toUpperCase() + category.slice(1))}</span><span>${formatCurrency(amount)}</span></div>
      <div class="category-bar"><span style="width: ${Math.max(8, (amount / highest) * 100)}%"></span></div>
    </div>
  `).join("");
  elements.categoryFootnote.textContent = categories.length ? `${categories.length} categor${categories.length === 1 ? "y" : "ies"} across your activity.` : "Categories update as you add activity.";
}

async function refresh() {
  const [transactions, summary] = await Promise.all([request("/api/transactions"), request("/api/transactions/summary")]);
  state.transactions = transactions;
  renderSummary(summary);
  renderTransactions();
  renderCategories(summary);
}

function openForm(transaction = null) {
  state.editingId = transaction?.id || null;
  elements.form.reset();
  elements.formError.hidden = true;
  elements.formTitle.textContent = transaction ? "Edit transaction" : "Add transaction";
  elements.formEyebrow.textContent = transaction ? "Update entry" : "New entry";
  elements.save.textContent = transaction ? "Save changes" : "Save transaction";
  elements.date.value = transaction ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
  if (transaction) {
    elements.description.value = transaction.description;
    elements.amount.value = transaction.amount;
    elements.type.value = transaction.type;
    elements.category.value = transaction.category;
  }
  elements.dialog.showModal();
  elements.description.focus();
}

function closeForm() {
  elements.dialog.close();
  state.editingId = null;
}

async function saveTransaction(event) {
  event.preventDefault();
  const wasEditing = Boolean(state.editingId);
  const payload = {
    description: elements.description.value,
    amount: Number(elements.amount.value),
    type: elements.type.value,
    category: elements.category.value,
    date: elements.date.value
  };
  try {
    elements.save.disabled = true;
    const path = state.editingId ? `/api/transactions/${state.editingId}` : "/api/transactions";
    await request(path, { method: state.editingId ? "PUT" : "POST", body: JSON.stringify(payload) });
    closeForm();
    await refresh();
    showToast(wasEditing ? "Transaction updated" : "Transaction added");
  } catch (error) {
    elements.formError.textContent = error.message;
    elements.formError.hidden = false;
  } finally {
    elements.save.disabled = false;
  }
}

async function deleteTransaction(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction || !window.confirm(`Delete “${transaction.description}”?`)) return;
  try {
    await request(`/api/transactions/${id}`, { method: "DELETE" });
    await refresh();
    showToast("Transaction deleted");
  } catch (error) {
    showToast(error.message);
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2500);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

document.querySelector("#new-transaction-button").addEventListener("click", () => openForm());
document.querySelector("#empty-add-button").addEventListener("click", () => openForm());
document.querySelector("#close-dialog-button").addEventListener("click", closeForm);
document.querySelector("#cancel-dialog-button").addEventListener("click", closeForm);
elements.form.addEventListener("submit", saveTransaction);
elements.search.addEventListener("input", (event) => { state.search = event.target.value; renderTransactions(); });
document.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
  state.filter = button.dataset.filter;
  renderTransactions();
}));
elements.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const transaction = state.transactions.find((item) => item.id === button.dataset.id);
  if (button.dataset.action === "edit") openForm(transaction);
  if (button.dataset.action === "delete") deleteTransaction(button.dataset.id);
});

elements.dialog.addEventListener("click", (event) => { if (event.target === elements.dialog) closeForm(); });
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
refresh().catch((error) => showToast(error.message));
