/**
 * Módulo de ventana modal accesible con trampa de foco y restauración.
 */
import { seleccionar, seleccionarTodos, escaparHTML } from "./dom.js";
import { copiarConConfirmacion } from "./portapapeles.js";

let ultimoElementoEnfocado = null;
let elementoActual = null;

const SELECTOR_ENFOCABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Abre el modal con la información de un elemento del diccionario.
 * @param {object} elemento Objeto de palabra clave
 * @param {HTMLElement} [elementoDisparador] Elemento que disparó la apertura para restaurar foco
 */
export function abrirModal(elemento, elementoDisparador = null) {
  if (!elemento) return;
  elementoActual = elemento;
  ultimoElementoEnfocado = elementoDisparador || document.activeElement;

  const fondo = seleccionar("#fondoModal");
  const elementoTitulo = seleccionar("#tituloModal");
  const elementoCategoria = seleccionar("#categoriaModal");
  const elementoDescripcion = seleccionar("#descripcionModal");
  const elementoEjemplo = seleccionar("#ejemploModal");
  const elementoNota = seleccionar("#notaModal");

  if (elementoTitulo) elementoTitulo.textContent = elemento.palabraClave;
  if (elementoCategoria) {
    const etiquetaAlcance = elemento.alcance === "basico" ? "Curso de Ingreso (PDF)" : "Extendido / Concurrente";
    elementoCategoria.textContent = `${elemento.categoria} • ${etiquetaAlcance}`;
  }
  if (elementoDescripcion) elementoDescripcion.textContent = elemento.descripcion;
  if (elementoEjemplo) elementoEjemplo.textContent = elemento.ejemplo;
  if (elementoNota) {
    elementoNota.innerHTML = `<strong>Dato clave:</strong> ${escaparHTML(elemento.nota)}`;
  }

  fondo.classList.add("abierto");
  fondo.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-abierto");

  // Enfocar el botón de cerrar accesible al abrir
  const botonCerrar = seleccionar("#botonCerrarModal");
  if (botonCerrar) {
    window.setTimeout(() => botonCerrar.focus(), 50);
  }
}

/**
 * Cierra el modal y devuelve el foco al elemento disparador.
 */
export function cerrarModal() {
  const fondo = seleccionar("#fondoModal");
  if (!fondo || !fondo.classList.contains("abierto")) return;

  fondo.classList.remove("abierto");
  fondo.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-abierto");

  if (ultimoElementoEnfocado && typeof ultimoElementoEnfocado.focus === "function") {
    ultimoElementoEnfocado.focus();
  }
  ultimoElementoEnfocado = null;
  elementoActual = null;
}

/**
 * Atrapa la navegación con tabulación dentro del modal mientras esté abierto.
 * @param {KeyboardEvent} e
 */
function manejarTecla(e) {
  const fondo = seleccionar("#fondoModal");
  if (!fondo || !fondo.classList.contains("abierto")) return;

  if (e.key === "Escape") {
    e.preventDefault();
    cerrarModal();
    return;
  }

  if (e.key === "Tab") {
    const elementosEnfocables = seleccionarTodos(SELECTOR_ENFOCABLE, fondo).filter(
      elementoEnfocable => !elementoEnfocable.hasAttribute("disabled") && elementoEnfocable.offsetParent !== null
    );
    if (elementosEnfocables.length === 0) return;

    const primero = elementosEnfocables[0];
    const ultimo = elementosEnfocables[elementosEnfocables.length - 1];

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }
}

/**
 * Inicializa escuchas del modal.
 */
export function inicializarModal() {
  const fondo = seleccionar("#fondoModal");
  const botonCerrar = seleccionar("#botonCerrarModal");
  const botonCopiar = seleccionar("#botonCopiarModal");

  if (botonCerrar) {
    botonCerrar.addEventListener("click", cerrarModal);
  }

  if (botonCopiar) {
    botonCopiar.addEventListener("click", () => {
      if (elementoActual?.palabraClave) {
        copiarConConfirmacion(elementoActual.palabraClave, botonCopiar, "Palabra copiada");
      }
    });
  }

  if (fondo) {
    fondo.addEventListener("click", e => {
      if (e.target === fondo) {
        cerrarModal();
      }
    });
  }

  document.addEventListener("keydown", manejarTecla);
}
