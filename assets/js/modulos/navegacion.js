/**
 * Módulo de navegación entre vistas y atajos de teclado globales.
 */
import { seleccionar, seleccionarTodos } from "./dom.js";

const observadoresCambioVista = new Set();

/**
 * Registra un observador que se ejecutará cada vez que cambie la vista activa.
 * @param {(identificadorVista: string) => void} observador
 */
export function alCambiarVista(observador) {
  observadoresCambioVista.add(observador);
}

/**
 * Cambia la vista visible de la aplicación.
 * @param {string} identificadorVista Identificador del elemento de sección (ej: "vistaDiccionario")
 */
export function cambiarVista(identificadorVista) {
  const seccionesVista = seleccionarTodos(".seccion-vista");
  const botonesNavegacion = seleccionarTodos(".pestanas-navegacion .boton[data-vista]");

  seccionesVista.forEach(seccion => {
    const estaActiva = seccion.id === identificadorVista;
    seccion.classList.toggle("activa", estaActiva);
    seccion.setAttribute("aria-hidden", String(!estaActiva));
  });

  botonesNavegacion.forEach(boton => {
    const estaActiva = boton.dataset.vista === identificadorVista;
    boton.classList.toggle("pestana-activa", estaActiva);
    if (estaActiva) {
      boton.setAttribute("aria-current", "page");
    } else {
      boton.removeAttribute("aria-current");
    }
  });

  // Notificar a observadores registrados
  observadoresCambioVista.forEach(observador => {
    try {
      observador(identificadorVista);
    } catch (error) {
      console.error("Error en observador de cambio de vista:", error);
    }
  });
}

/**
 * Inicializa la barra de navegación, accesos rápidos y el atajo de teclado "/".
 */
export function inicializarNavegacion() {
  document.addEventListener("click", e => {
    const elementoVista = e.target.closest("[data-vista]");
    if (elementoVista && elementoVista.dataset.vista) {
      cambiarVista(elementoVista.dataset.vista);
    }
  });

  // Atajo de teclado "/" para enfocar la búsqueda del diccionario
  document.addEventListener("keydown", e => {
    const entradaBusqueda = seleccionar("#entradaBusqueda");
    const elementoActivo = document.activeElement;
    const estaEscribiendo = elementoActivo && (
      elementoActivo.tagName === "INPUT" ||
      elementoActivo.tagName === "TEXTAREA" ||
      elementoActivo.isContentEditable
    );

    if (e.key === "/" && !estaEscribiendo && entradaBusqueda) {
      e.preventDefault();
      cambiarVista("vistaDiccionario");
      entradaBusqueda.focus();
    }
  });
}
