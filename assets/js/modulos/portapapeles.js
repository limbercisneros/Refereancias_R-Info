/**
 * Módulo de copiado al portapapeles con alternativo robusto y confirmación accesible.
 */
import { anunciar } from "./dom.js";
import { iconoVerificado, iconoAdvertencia } from "./iconos.js";

/**
 * Copia texto al portapapeles usando navigator.clipboard si está disponible,
 * o un elemento textarea fuera de pantalla como mecanismo de rescate (alternativo).
 * @param {string} texto Texto a copiar
 * @returns {Promise<boolean>} Devuelve verdadero si tuvo éxito y falso si falla
 */
export async function copiarAlPortapapeles(texto) {
  if (!texto) return false;

  // 1. Intento primario con API moderna
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Si falla por permisos o contexto, pasar al alternativo
    }
  }

  // 2. Fallback síncrono con execCommand('copy')
  try {
    const areaTexto = document.createElement("textarea");
    areaTexto.value = texto;
    areaTexto.setAttribute("readonly", "");
    areaTexto.style.position = "fixed";
    areaTexto.style.top = "-9999px";
    areaTexto.style.left = "-9999px";
    areaTexto.style.opacity = "0";
    document.body.appendChild(areaTexto);
    areaTexto.select();
    areaTexto.setSelectionRange(0, areaTexto.value.length);
    const exitoso = document.execCommand("copy");
    document.body.removeChild(areaTexto);
    return exitoso;
  } catch {
    return false;
  }
}

/**
 * Copia texto y aplica confirmación visual y accesible en un botón disparador.
 * @param {string} texto Texto a copiar
 * @param {HTMLButtonElement} [elementoBoton] Elemento botón que recibirá el confirmación
 * @param {string} [etiquetaConfirmacion="Copiado"] Etiqueta temporal
 */
export async function copiarConConfirmacion(texto, elementoBoton, etiquetaConfirmacion = "Copiado") {
  const exito = await copiarAlPortapapeles(texto);

  if (elementoBoton) {
    if (exito) {
      const htmlOriginal = elementoBoton.getAttribute("data-html-original") || elementoBoton.innerHTML;
      if (!elementoBoton.hasAttribute("data-html-original")) {
        elementoBoton.setAttribute("data-html-original", htmlOriginal);
      }
      elementoBoton.innerHTML = `${iconoVerificado(15)} <span>${etiquetaConfirmacion}</span>`;
      elementoBoton.setAttribute("aria-live", "polite");

      window.setTimeout(() => {
        elementoBoton.innerHTML = htmlOriginal;
      }, 1300);

      anunciar(`Texto copiado al portapapeles: ${texto.length > 40 ? texto.slice(0, 37) + "..." : texto}`);
    } else {
      const htmlOriginal = elementoBoton.innerHTML;
      elementoBoton.innerHTML = `${iconoAdvertencia(15)} <span>Error al copiar</span>`;
      window.setTimeout(() => {
        elementoBoton.innerHTML = htmlOriginal;
      }, 1500);
      anunciar("No se pudo copiar el texto al portapapeles.");
    }
  }
}
