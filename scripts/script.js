/* ============================================================
   CONFIG
============================================================ */
const API_URL = "https://distribuidordegastos.onrender.com/resumen";

const EXAMPLE_INPUT = [
  {
    nombre: "Juan",
    ganancias: [732262],
    personasACargo: 0,
    gastosEquitativosPagados: [145400],
    gastosEquitativosPendientes: [8415, 28018, 95604],
    gastosIgualitariosPagados: [0],
    gastosIgualitariosPendientes: [19166, 4145, 5416, 24570, 44133, 6164, 6498, 11161, 15778, 6715, 19072, 4838, 13400, 18400],
    gastosPersonalesDeOtros: { Mariana: [19973, 8250] }
  },
  {
    nombre: "Mariana",
    ganancias: [875650],
    personasACargo: 0,
    gastosEquitativosPagados: [162626],
    gastosEquitativosPendientes: [0],
    gastosIgualitariosPagados: [0],
    gastosIgualitariosPendientes: [],
    gastosPersonalesDeOtros: { Juan: [31699] }
  }
];

const EXAMPLE_OUTPUT = {
  sueldoHogar: 1607912.0, gastoEquitativo: 440063.0, gastoIgualitario: 199456.0,
  detallePorPersona: [
    { nombre: "Juan", esDeudor: false, debeAODe: ["Mariana"], cantidadAPagarORecibir: [173279.14392205537] },
    { nombre: "Mariana", esDeudor: true, debeAODe: ["Juan"], cantidadAPagarORecibir: [173279.14392205537] }
  ],
  ajustesDeSaldos: ["Mariana debe pagar 173279.14392205537 a Juan"],
  miembrosContribuyentes: 2, miembrosBeneficiarios: 0, totalDeMiembros: 2
};

/* ============================================================
   NAV
============================================================ */
const topbar = document.getElementById("topbar");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");

window.addEventListener("scroll", () => {
  topbar.classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ============================================================
   RAW JSON PREVIEW (sección Ejemplo)
============================================================ */
document.getElementById("rawInput").textContent = JSON.stringify(EXAMPLE_INPUT, null, 2);
document.getElementById("rawOutput").textContent = JSON.stringify(EXAMPLE_OUTPUT_FULL(), null, 2);

function EXAMPLE_OUTPUT_FULL() {
  return {
    sueldoHogar: 1607912.0,
    gastoEquitativo: 440063.0,
    gastoIgualitario: 199456.0,
    detallePorPersona: [
      {
        nombre: "Juan", ganancias: [732262.0], personasACargo: 0, sueldoTotal: 732262.0,
        porcentajeCorrespondienteDelHogar: 45.54117389508879, gastoEquitativo: 277437.0,
        gastoIgualitario: 199456.0, gastoHogarTotal: 476893.0, parteEquitativaCorrespondiente: 200409.85607794457,
        parteIgualitariaCorrespondiente: 99728.0, parteCorrespondienteTotal: 300137.85607794457,
        prestamoRecibido: 31699.0, gastoPersonalDeOtros: { Mariana: 28223.0 }, gastoPrestamistaTotal: 28223.0,
        gastoTotal: 505116.0, esDeudor: false, debeAODe: ["Mariana"], cantidadAPagarORecibir: [173279.14392205537]
      },
      {
        nombre: "Mariana", ganancias: [875650.0], personasACargo: 0, sueldoTotal: 875650.0,
        porcentajeCorrespondienteDelHogar: 54.45882610491121, gastoEquitativo: 162626.0,
        gastoIgualitario: 0.0, gastoHogarTotal: 162626.0, parteEquitativaCorrespondiente: 239653.1439220554,
        parteIgualitariaCorrespondiente: 99728.0, parteCorrespondienteTotal: 339381.1439220554,
        prestamoRecibido: 28223.0, gastoPersonalDeOtros: { Juan: 31699.0 }, gastoPrestamistaTotal: 31699.0,
        gastoTotal: 194325.0, esDeudor: true, debeAODe: ["Juan"], cantidadAPagarORecibir: [173279.14392205537]
      }
    ],
    ajustesDeSaldos: ["Mariana debe pagar 173279.14392205537 a Juan"],
    miembrosContribuyentes: 2, miembrosBeneficiarios: 0, totalDeMiembros: 2
  };
}

/* ============================================================
   FORM: construcción dinámica de personas
============================================================ */
const peopleContainer = document.getElementById("peopleContainer");
const addPersonBtn = document.getElementById("addPersonBtn");
const loadExampleBtn = document.getElementById("loadExampleBtn");
const resetFormBtn = document.getElementById("resetFormBtn");
const expenseForm = document.getElementById("expenseForm");

let personCounter = 0;

function makePersonCard(data = {}) {
  personCounter += 1;
  const id = personCounter;

  const card = document.createElement("div");
  card.className = "person-card";
  card.dataset.personId = id;

  card.innerHTML = `
    <div class="person-card-head">
      <h4>Integrante ${id}</h4>
      <button type="button" class="remove-person">Quitar</button>
    </div>

    <div class="field-grid">
      <div class="field">
        <label>Nombre</label>
        <input type="text" class="f-nombre" placeholder="Juan" required>
      </div>
      <div class="field">
        <label>Personas a cargo</label>
        <input type="number" class="f-personasACargo" min="0" value="0">
      </div>
    </div>

    <div class="field-grid full">
      <div class="field">
        <label>Ingresos <small>separá con comas si hay más de uno</small></label>
        <input type="text" class="f-ganancias" placeholder="732262">
      </div>
    </div>

    <div class="field-grid">
      <div class="field">
        <label>Gastos equitativos pagados <small>separados por coma</small></label>
        <input type="text" class="f-eqPagados" placeholder="145400">
      </div>
      <div class="field">
        <label>Gastos equitativos pendientes <small>separados por coma</small></label>
        <input type="text" class="f-eqPendientes" placeholder="8415, 28018">
      </div>
    </div>

    <div class="field-grid">
      <div class="field">
        <label>Gastos igualitarios pagados <small>separados por coma</small></label>
        <input type="text" class="f-igPagados" placeholder="0">
      </div>
      <div class="field">
        <label>Gastos igualitarios pendientes <small>separados por coma</small></label>
        <input type="text" class="f-igPendientes" placeholder="19166, 4145">
      </div>
    </div>

    <div class="loans-block">
      <div class="loans-block-head">
        <span>Pagó gastos personales de otro integrante <small>elegí a quién le pagó el gasto, de la lista del hogar</small></span>
        <button type="button" class="add-loan-btn">+ agregar</button>
      </div>
      <div class="loans-list"></div>
    </div>
  `;

  card.querySelector(".remove-person").addEventListener("click", () => {
    if (peopleContainer.children.length <= 1) return;
    card.remove();
    refreshLoansUI();
  });

  card.querySelector(".f-nombre").addEventListener("input", () => {
    refreshLoansUI();
  });

  card.querySelector(".add-loan-btn").addEventListener("click", () => {
    addLoanRow(card.querySelector(".loans-list"));
  });

  // prefill
  if (data.nombre) card.querySelector(".f-nombre").value = data.nombre;
  if (data.personasACargo !== undefined) card.querySelector(".f-personasACargo").value = data.personasACargo;
  if (data.ganancias) card.querySelector(".f-ganancias").value = data.ganancias.join(", ");
  if (data.gastosEquitativosPagados) card.querySelector(".f-eqPagados").value = data.gastosEquitativosPagados.join(", ");
  if (data.gastosEquitativosPendientes) card.querySelector(".f-eqPendientes").value = data.gastosEquitativosPendientes.join(", ");
  if (data.gastosIgualitariosPagados) card.querySelector(".f-igPagados").value = data.gastosIgualitariosPagados.join(", ");
  if (data.gastosIgualitariosPendientes) card.querySelector(".f-igPendientes").value = data.gastosIgualitariosPendientes.join(", ");
  if (data.gastosPersonalesDeOtros) {
    const loansList = card.querySelector(".loans-list");
    Object.entries(data.gastosPersonalesDeOtros).forEach(([persona, montos]) => {
      montos.forEach(monto => addLoanRow(loansList, persona, monto));
    });
  }

  return card;
}

function addLoanRow(loansList, persona = "", monto = "") {
  const row = document.createElement("div");
  row.className = "loan-row";
  // guardamos el nombre "deseado" aparte: al crear la fila puede que el otro
  // integrante todavía no exista en el formulario (ver resetPeople), así que
  // lo reintentamos seleccionar cada vez que la lista de nombres cambia.
  row.dataset.desiredPersona = persona || "";
  row.innerHTML = `
    <select class="loan-persona"></select>
    <input type="number" class="loan-monto" placeholder="Monto">
    <button type="button" class="remove-loan-btn">✕</button>
  `;
  row.querySelector(".loan-monto").value = monto;
  row.querySelector(".loan-persona").addEventListener("change", (e) => {
    row.dataset.desiredPersona = e.target.value;
  });
  row.querySelector(".remove-loan-btn").addEventListener("click", () => row.remove());
  loansList.appendChild(row);
  refreshLoanSelectForRow(row);
}

/** Nombres de los demás integrantes cargados en el formulario (excluye a `card` mismo). */
function getOtherNames(card) {
  return Array.from(peopleContainer.querySelectorAll(".person-card"))
    .filter(c => c !== card)
    .map(c => c.querySelector(".f-nombre").value.trim())
    .filter(Boolean);
}

function refreshLoanSelectForRow(row) {
  const card = row.closest(".person-card");
  const select = row.querySelector(".loan-persona");
  const names = getOtherNames(card);
  const desired = row.dataset.desiredPersona || select.value;

  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = names.length ? "Elegí un integrante…" : "Agregá otro integrante primero";
  select.appendChild(placeholder);

  names.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });

  select.value = names.includes(desired) ? desired : "";
}

function refreshLoanButtonsUI() {
  peopleContainer.querySelectorAll(".person-card").forEach(card => {
    const hasOthers = getOtherNames(card).length > 0;
    const btn = card.querySelector(".add-loan-btn");
    btn.disabled = !hasOthers;
    btn.title = hasOthers ? "" : "Necesitás al menos otro integrante con nombre cargado";
  });
}

/** Recalcula, para todas las filas de préstamos, quiénes pueden elegirse. */
function refreshLoansUI() {
  peopleContainer.querySelectorAll(".loan-row").forEach(refreshLoanSelectForRow);
  refreshLoanButtonsUI();
}

function resetPeople(withExample) {
  peopleContainer.innerHTML = "";
  personCounter = 0;
  if (withExample) {
    EXAMPLE_INPUT.forEach(p => peopleContainer.appendChild(makePersonCard(p)));
  } else {
    peopleContainer.appendChild(makePersonCard());
    peopleContainer.appendChild(makePersonCard());
  }
  refreshLoansUI();
}

addPersonBtn.addEventListener("click", () => {
  peopleContainer.appendChild(makePersonCard());
  refreshLoansUI();
});

loadExampleBtn.addEventListener("click", () => resetPeople(true));
resetFormBtn.addEventListener("click", () => resetPeople(false));

resetPeople(false);

/* ============================================================
   RECOLECTAR PAYLOAD
============================================================ */
function parseNumberList(str) {
  return (str || "")
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(Number)
    .filter(n => !Number.isNaN(n));
}

function collectPayload() {
  const cards = Array.from(peopleContainer.querySelectorAll(".person-card"));
  return cards.map(card => {
    const gastosPersonalesDeOtros = {};
    card.querySelectorAll(".loan-row").forEach(row => {
      const persona = row.querySelector(".loan-persona").value.trim();
      const monto = Number(row.querySelector(".loan-monto").value);
      if (!persona || Number.isNaN(monto)) return;
      if (!gastosPersonalesDeOtros[persona]) gastosPersonalesDeOtros[persona] = [];
      gastosPersonalesDeOtros[persona].push(monto);
    });

    return {
      nombre: card.querySelector(".f-nombre").value.trim(),
      ganancias: parseNumberList(card.querySelector(".f-ganancias").value),
      personasACargo: Number(card.querySelector(".f-personasACargo").value) || 0,
      gastosEquitativosPagados: parseNumberList(card.querySelector(".f-eqPagados").value),
      gastosEquitativosPendientes: parseNumberList(card.querySelector(".f-eqPendientes").value),
      gastosIgualitariosPagados: parseNumberList(card.querySelector(".f-igPagados").value),
      gastosIgualitariosPendientes: parseNumberList(card.querySelector(".f-igPendientes").value),
      gastosPersonalesDeOtros
    };
  });
}

/* ============================================================
   SUBMIT
============================================================ */
const statusBox = document.getElementById("statusBox");
const resultBox = document.getElementById("resultBox");
const resultSummary = document.getElementById("resultSummary");
const resultPeople = document.getElementById("resultPeople");
const resultSettles = document.getElementById("resultSettles");
const resultRawJson = document.getElementById("resultRawJson");
const submitBtn = document.getElementById("submitBtn");

function money(n) {
  if (typeof n !== "number") return n;
  return "$ " + n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

function showStatus(kind, text) {
  statusBox.hidden = false;
  statusBox.className = "status-box " + kind;
  statusBox.textContent = text;
}

function curlFor(payload) {
  return `curl -X POST ${API_URL} \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(payload)}'`;
}

expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultBox.hidden = true;

  const payload = collectPayload();

  if (payload.length < 1 || payload.some(p => !p.nombre)) {
    showStatus("error", "Revisá que todos los integrantes tengan nombre.");
    return;
  }

  submitBtn.disabled = true;
  showStatus("loading", "Consultando el servicio… si estaba dormido en Render, puede tardar hasta un minuto en despertar.");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`El servicio respondió con estado ${res.status}`);
    }

    const data = await res.json();
    renderResult(data);
    showStatus("ok", "Listo, cálculo recibido del servicio en vivo.");
  } catch (err) {
    showStatus(
      "error",
      "No se pudo conectar con el servicio (" + err.message + "). " +
      "Puede ser un problema de CORS del deploy o que Render todavía esté despertando el servicio — " +
      "reintentá en unos segundos, o probá el mismo request por tu cuenta con el comando de abajo."
    );
    resultBox.hidden = false;
    resultSummary.innerHTML = "";
    resultPeople.innerHTML = "";
    resultSettles.innerHTML = "";
    resultRawJson.textContent = curlFor(payload);
  } finally {
    submitBtn.disabled = false;
  }
});

function renderResult(data) {
  resultBox.hidden = false;

  resultSummary.innerHTML = `
    <div class="receipt-notch top"></div>
    <div class="receipt-head"><span>RESUMEN DE HOGAR</span><span class="receipt-tag">/resumen</span></div>
    <div class="receipt-row"><span>sueldoHogar</span><i></i><b>${money(data.sueldoHogar)}</b></div>
    <div class="receipt-row"><span>gastoEquitativo</span><i></i><b class="gold">${money(data.gastoEquitativo)}</b></div>
    <div class="receipt-row"><span>gastoIgualitario</span><i></i><b class="mint">${money(data.gastoIgualitario)}</b></div>
    <div class="receipt-divider"></div>
    <div class="receipt-row small"><span>Integrantes</span><i></i><b>${data.totalDeMiembros ?? "—"}</b></div>
    <div class="receipt-notch bottom"></div>
  `;

  resultPeople.innerHTML = "";
  (data.detallePorPersona || []).forEach(p => {
    const situacion = p.esDeudor
      ? `<b class="coral">Debe plata</b>`
      : `<b class="mint">Le deben plata</b>`;
    const div = document.createElement("div");
    div.className = "example-person";
    div.innerHTML = `
      <div class="example-person-head ${p.esDeudor ? "coral-edge" : "mint-edge"}">
        <h3>${p.nombre}</h3>
        <span class="mono-tag">${(p.porcentajeCorrespondienteDelHogar ?? 0).toFixed(1)}% del hogar</span>
      </div>
      <ul class="kv-list">
        <li><span>Le corresponde pagar</span><b>${money(p.parteCorrespondienteTotal)}</b></li>
        <li><span>Ya gastó (total)</span><b>${money(p.gastoTotal)}</b></li>
        <li><span>Situación</span>${situacion}</li>
      </ul>
    `;
    resultPeople.appendChild(div);
  });

  resultSettles.innerHTML = "";
  (data.ajustesDeSaldos || []).forEach(line => {
    const div = document.createElement("div");
    div.className = "settle-card";
    div.innerHTML = `<span class="settle-label">Ajuste</span><span class="settle-line">${line}</span>`;
    resultSettles.appendChild(div);
  });
  if ((data.ajustesDeSaldos || []).length === 0) {
    resultSettles.innerHTML = `<div class="settle-card"><span class="settle-line">No hace falta ningún ajuste — las cuentas ya están equilibradas.</span></div>`;
  }

  resultRawJson.textContent = JSON.stringify(data, null, 2);
}
