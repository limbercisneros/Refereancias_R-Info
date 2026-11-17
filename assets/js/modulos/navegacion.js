/**
 * Módulo de navegación entre vistas, menú hamburguesa móvil y atajos de teclado globales.
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
 * Abre el menú desplegable móvil con accesibilidad y animación.
 */
export function abrirMenuMovil() {
  const encabezado = seleccionar("#encabezadoPrincipal");
  const menuMovil = seleccionar("#menuMovil");
  const botonHamburguesa = seleccionar("#botonMenuHamburguesa");
  const telon = seleccionar("#telonMenuMovil");

  if (!menuMovil || !botonHamburguesa) return;

  if (encabezado) encabezado.classList.add("menu-abierto");
  menuMovil.classList.add("abierto");
  botonHamburguesa.classList.add("abierto");
  botonHamburguesa.setAttribute("aria-expanded", "true");
  botonHamburguesa.setAttribute("aria-label", "Cerrar menú de navegación");
  menuMovil.setAttribute("aria-hidden", "false");
  if (telon) telon.classList.add("activo");
}

/**
 * Cierra el menú desplegable móvil.
 */
export function cerrarMenuMovil() {
  const encabezado = seleccionar("#encabezadoPrincipal");
  const menuMovil = seleccionar("#menuMovil");
  const botonHamburguesa = seleccionar("#botonMenuHamburguesa");
  const telon = seleccionar("#telonMenuMovil");

  if (!menuMovil || !botonHamburguesa) return;

  if (encabezado) encabezado.classList.remove("menu-abierto");
  menuMovil.classList.remove("abierto");
  botonHamburguesa.classList.remove("abierto");
  botonHamburguesa.setAttribute("aria-expanded", "false");
  botonHamburguesa.setAttribute("aria-label", "Abrir menú de navegación");
  menuMovil.setAttribute("aria-hidden", "true");
  if (telon) telon.classList.remove("activo");
}

/**
 * Alterna el estado abierto/cerrado del menú móvil.
 */
export function alternarMenuMovil() {
  const menuMovil = seleccionar("#menuMovil");
  if (!menuMovil) return;

  if (menuMovil.classList.contains("abierto")) {
    cerrarMenuMovil();
  } else {
    abrirMenuMovil();
  }
}

/**
 * Cambia la vista visible de la aplicación.
 * @param {string} identificadorVista Identificador del elemento de sección (ej: "vistaDiccionario")
 */
export function cambiarVista(identificadorVista) {
  const seccionesVista = seleccionarTodos(".seccion-vista");
  const botonesNavegacion = seleccionarTodos(
    ".pestanas-navegacion .boton[data-vista], .boton-menu-movil[data-vista]"
  );

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

  // Cerrar menú móvil si estaba desplegado
  cerrarMenuMovil();

  // Desplazamiento suave al inicio de la página para que la nueva vista sea visible
  window.scrollTo({ top: 0, behavior: "smooth" });

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
 * Inicializa la barra de navegación, el menú móvil hamburguesa y el atajo de teclado "/".
 */
export function inicializarNavegacion() {
  const botonHamburguesa = seleccionar("#botonMenuHamburguesa");
  const telon = seleccionar("#telonMenuMovil");

  if (botonHamburguesa) {
    botonHamburguesa.addEventListener("click", e => {
      e.stopPropagation();
      alternarMenuMovil();
    });
  }

  if (telon) {
    telon.addEventListener("click", () => {
      cerrarMenuMovil();
    });
  }

  document.addEventListener("click", e => {
    const elementoVista = e.target.closest("[data-vista]");
    if (elementoVista && elementoVista.dataset.vista) {
      cambiarVista(elementoVista.dataset.vista);
      return;
    }

    // Si hace clic fuera del encabezado y del menú móvil, cerrar el menú
    const menuMovil = seleccionar("#menuMovil");
    const encabezado = seleccionar("#encabezadoPrincipal");
    if (menuMovil && menuMovil.classList.contains("abierto")) {
      if (encabezado && !encabezado.contains(e.target)) {
        cerrarMenuMovil();
      }
    }
  });

  // Atajos de teclado: ESC para cerrar menú móvil, "/" para enfocar búsqueda
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      const menuMovil = seleccionar("#menuMovil");
      if (menuMovil && menuMovil.classList.contains("abierto")) {
        cerrarMenuMovil();
        if (botonHamburguesa) botonHamburguesa.focus();
        return;
      }
    }

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

  // Si el usuario cambia el tamaño de ventana a escritorio, cerrar automáticamente el menú móvil
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      cerrarMenuMovil();
    }
  });
}
