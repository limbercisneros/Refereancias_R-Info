/**
 * Utilidades DOM seguras, accesibilidad y ayudas de selección.
 */

/**
 * Escapa caracteres especiales de HTML para evitar inyección XSS.
 * @param {string|number} valor
 * @returns {string}
 */
export function escaparHTML(valor) {
  if (valor === null || valor === undefined) return "";
  const cadena = String(valor);
  const entidades = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return cadena.replace(/[&<>"']/g, caracter => entidades[caracter] || caracter);
}

/**
 * Atajo para seleccionar un elemento.
 * @param {string} selector
 * @param {ParentNode} [alcance=document]
 * @returns {Element|null}
 */
export function seleccionar(selector, alcance = document) {
  return alcance.querySelector(selector);
}

/**
 * Atajo para seleccionar varios elementos y devolver una lista nativa.
 * @param {string} selector
 * @param {ParentNode} [alcance=document]
 * @returns {Element[]}
 */
export function seleccionarTodos(selector, alcance = document) {
  return Array.from(alcance.querySelectorAll(selector));
}

/**
 * Anuncia un mensaje a tecnologías de asistencia mediante la región de anuncios.
 * @param {string} mensaje
 */
export function anunciar(mensaje) {
  const regionAnuncios = seleccionar("#regionAnuncios");
  if (!regionAnuncios) return;
  // Limpiar y fijar contenido con un microtick para asegurar que el lector de pantalla detecte la mutación
  regionAnuncios.textContent = "";
  window.setTimeout(() => {
    regionAnuncios.textContent = mensaje;
  }, 50);
}
