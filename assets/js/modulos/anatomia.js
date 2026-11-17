/**
 * Módulo de la vista Anatomía: partes de Robot y Área, ciclo de vida interactivo
 * y navegación cruzada al diccionario con iconografía SVG pura.
 */
import { PARTES_ANATOMIA } from "../datos/anatomia.js";
import { CICLO_VIDA } from "../datos/ciclo-vida.js";
import { seleccionar, escaparHTML } from "./dom.js";
import { cambiarVista } from "./navegacion.js";
import { filtrarYAbrirPalabraClave } from "./diccionario.js";
import { obtenerIconoParte, iconoRobot, iconoMapa } from "./iconos.js";

let identificadorParteActiva = PARTES_ANATOMIA[0].identificador;
let indiceEtapaActiva = 0;

/**
 * Renderiza el menú lateral de partes organizadas por grupo.
 */
export function representarMenuAnatomia() {
  const menu = seleccionar("#menuPartes");
  if (!menu) return;

  const grupos = [...new Set(PARTES_ANATOMIA.map(p => p.grupo))];

  menu.innerHTML = grupos.map(nombreGrupo => {
    const esGrupoRobot = nombreGrupo.toLowerCase().includes("robot");
    const iconoGrupo = esGrupoRobot ? iconoRobot(15) : iconoMapa(15);

    return `
      <div class="titulo-grupo-partes">${iconoGrupo} <span>${escaparHTML(nombreGrupo)}</span></div>
      ${PARTES_ANATOMIA.filter(p => p.grupo === nombreGrupo).map(p => {
        const estaActiva = p.identificador === identificadorParteActiva;
        return `
          <button
            type="button"
            class="boton-parte ${estaActiva ? "activa" : ""}"
            data-accion="seleccionar-parte"
            data-identificador-parte="${escaparHTML(p.identificador)}"
            aria-pressed="${estaActiva}"
          >
            <span class="titulo-con-icono">${obtenerIconoParte(p.identificador, 16)} <span>${escaparHTML(p.titulo)}</span></span>
            <small>${escaparHTML(p.resumen)}</small>
          </button>
        `;
      }).join("")}
    `;
  }).join("");
}

/**
 * Renderiza el panel de detalle de la parte activa seleccionada.
 */
export function representarDetalleAnatomia() {
  const caja = seleccionar("#detalleParte");
  if (!caja) return;

  const parte = PARTES_ANATOMIA.find(p => p.identificador === identificadorParteActiva) || PARTES_ANATOMIA[0];

  caja.innerHTML = `
    <div class="cabecera-detalle">
      <div>
        <h3 class="titulo-detalle titulo-con-icono">${obtenerIconoParte(parte.identificador, 22)} <span>${escaparHTML(parte.titulo)}</span></h3>
        <span class="etiqueta-grupo-detalle">${escaparHTML(parte.grupo)}</span>
      </div>
      <span class="pildora-predeterminada">Por defecto: ${escaparHTML(parte.estadoInicial)}</span>
    </div>
    <p class="descripcion-parte">${escaparHTML(parte.descripcion)}</p>
    <div class="cuadricula-datos">
      ${parte.detalles.map(d => `
        <div class="dato-par">
          <strong>${escaparHTML(d.etiqueta)}</strong>
          <span>${escaparHTML(d.valor)}</span>
        </div>
      `).join("")}
    </div>
    <div class="seccion-codigo-parte">
      <div class="etiqueta-seccion">Ejemplo en R-Info</div>
      <pre class="bloque-codigo">${escaparHTML(parte.codigo)}</pre>
    </div>
    <div class="palabras-clave-vinculadas">
      <span class="etiqueta-palabras-clave-vinculadas">Palabras clave relacionadas:</span>
      ${parte.palabrasClave.map(palabraClave => `
        <button
          type="button"
          class="ficha"
          data-action="ir-palabra-clave"
          data-palabra-clave="${escaparHTML(palabraClave)}"
          aria-label="Ver definición de ${escaparHTML(palabraClave)} en diccionario"
        >${escaparHTML(palabraClave)}</button>
      `).join("")}
    </div>
  `;
}

/**
 * Selecciona una parte anatómica y actualiza la vista.
 * @param {string} identificador
 */
export function seleccionarParte(identificador) {
  identificadorParteActiva = identificador;
  representarMenuAnatomia();
  representarDetalleAnatomia();
}

/**
 * Renderiza los pasos del ciclo de vida interactivo y su salida explicativa.
 */
export function representarCicloVida() {
  const contenedorEtapas = seleccionar("#etapasCicloVida");
  const contenedorSalida = seleccionar("#salidaCicloVida");
  if (!contenedorEtapas || !contenedorSalida) return;

  contenedorEtapas.innerHTML = CICLO_VIDA.map((s, i) => {
    const estaActiva = i === indiceEtapaActiva;
    return `
      <button
        type="button"
        class="boton-etapa ${estaActiva ? "activa" : ""}"
        data-accion="seleccionar-etapa"
        data-indice-etapa="${i}"
        aria-pressed="${estaActiva}"
      >
        <div class="numero-etapa">${escaparHTML(s.numero)}</div>
        <div class="titulo-etapa">${escaparHTML(s.titulo)}</div>
      </button>
    `;
  }).join("");

  const actual = CICLO_VIDA[indiceEtapaActiva];
  contenedorSalida.innerHTML = `
    <pre class="bloque-codigo codigo-ciclo-vida">${escaparHTML(actual.codigo)}</pre>
    <div class="caja-estado">
      <strong>¿Qué ocurre en este paso?</strong>
      <p>${escaparHTML(actual.queOcurre)}</p>
      <div class="lineas-estado">
        ${actual.estado.map(linea => `<div>• ${escaparHTML(linea)}</div>`).join("")}
      </div>
    </div>
  `;
}

/**
 * Selecciona un paso del ciclo de vida.
 * @param {number} indice
 */
export function seleccionarEtapa(indice) {
  indiceEtapaActiva = indice;
  representarCicloVida();
}

/**
 * Inicializa los controladores de eventos para la vista de Anatomía y Ciclo de Vida.
 */
export function inicializarAnatomia() {
  const menuPartes = seleccionar("#menuPartes");
  const detalleParte = seleccionar("#detalleParte");
  const etapasCicloVida = seleccionar("#etapasCicloVida");

  if (menuPartes) {
    menuPartes.addEventListener("click", e => {
      const boton = e.target.closest('button[data-accion="seleccionar-parte"]');
      if (boton && boton.dataset.identificadorParte) {
        seleccionarParte(boton.dataset.identificadorParte);
      }
    });
  }

  if (detalleParte) {
    detalleParte.addEventListener("click", e => {
      const botonSalto = e.target.closest('button[data-action="ir-palabra-clave"]');
      if (botonSalto && botonSalto.dataset.palabraClave) {
        const palabraClave = botonSalto.dataset.palabraClave;
        cambiarVista("vistaDiccionario");
        filtrarYAbrirPalabraClave(palabraClave);
      }
    });
  }

  if (etapasCicloVida) {
    etapasCicloVida.addEventListener("click", e => {
      const boton = e.target.closest('button[data-accion="seleccionar-etapa"]');
      if (boton && boton.dataset.indiceEtapa !== undefined) {
        seleccionarEtapa(Number(boton.dataset.indiceEtapa));
      }
    });
  }

  representarMenuAnatomia();
  representarDetalleAnatomia();
  representarCicloVida();
}
