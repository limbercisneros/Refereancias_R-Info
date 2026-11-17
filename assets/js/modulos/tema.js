/**
 * Módulo de gestión de tema (claro / oscuro) con persistencia y accesibilidad.
 */
import { seleccionar, anunciar } from "./dom.js";
import { iconoLuna, iconoSol } from "./iconos.js";

const CLAVE_ALMACENAMIENTO_TEMA = "preferencia_tema_rinfo";

/**
 * Obtiene el tema actual ("claro" o "oscuro").
 * @returns {"claro"|"oscuro"}
 */
export function obtenerTemaActual() {
  return document.documentElement.getAttribute("data-tema") === "oscuro" ? "oscuro" : "claro";
}

/**
 * Aplica el tema en el DOM, actualiza botones y atributos accesibles.
 * @param {"claro"|"oscuro"} tema
 * @param {boolean} [debeAnunciar=false]
 */
export function aplicarTema(tema, debeAnunciar = false) {
  const esOscuro = tema === "oscuro";
  document.documentElement.setAttribute("data-tema", tema);
  // Sincronizar con el motor de renderizado del navegador para controles nativos
  document.documentElement.style.colorScheme = esOscuro ? "dark" : "light";

  const botonTema = seleccionar("#botonTema");
  const iconoTema = seleccionar("#iconoTema");
  const etiquetaTema = seleccionar("#etiquetaTema");

  const textoProximoTema = esOscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro";

  if (botonTema) {
    botonTema.setAttribute("aria-label", textoProximoTema);
    botonTema.setAttribute("title", textoProximoTema);
  }
  if (iconoTema) {
    iconoTema.innerHTML = esOscuro ? iconoSol(18) : iconoLuna(18);
  }
  if (etiquetaTema) {
    etiquetaTema.textContent = textoProximoTema;
  }

  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_TEMA, tema);
  } catch {
    // Si localStorage no está disponible (modo incógnito restrictivo), ignorar silenciosamente
  }

  if (debeAnunciar) {
    anunciar(`Tema cambiado a ${esOscuro ? "oscuro" : "claro"}`);
  }
}

/**
 * Alterna entre tema claro y oscuro.
 */
export function alternarTema() {
  const actual = obtenerTemaActual();
  const proximo = actual === "oscuro" ? "claro" : "oscuro";
  aplicarTema(proximo, true);
}

/**
 * Inicializa el tema a partir de localStorage o preferencia del sistema operativo.
 */
export function inicializarTema() {
  let temaGuardado = null;
  try {
    temaGuardado = localStorage.getItem(CLAVE_ALMACENAMIENTO_TEMA);
  } catch {
    temaGuardado = null;
  }

  if (!temaGuardado) {
    const prefiereOscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    temaGuardado = prefiereOscuro ? "oscuro" : "claro";
  }

  aplicarTema(temaGuardado, false);

  const botonTema = seleccionar("#botonTema");
  if (botonTema) {
    botonTema.addEventListener("click", alternarTema);
  }
}
