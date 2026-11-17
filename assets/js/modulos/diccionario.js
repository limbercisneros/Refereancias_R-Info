/**
 * Módulo de la vista Diccionario: filtros, búsqueda, tarjetas y copiado rápido.
 */
import { DATOS_DICCIONARIO } from "../datos/diccionario.js";
import { seleccionar, seleccionarTodos, escaparHTML } from "./dom.js";
import { abrirModal } from "./modal.js";
import { copiarConConfirmacion } from "./portapapeles.js";
import { iconoCopiar } from "./iconos.js";

const CATEGORIAS = ["Todas", ...new Set(DATOS_DICCIONARIO.map(d => d.categoria))];

const estado = {
  busqueda: "",
  categoria: "Todas",
  alcance: "todos"
};

/**
 * Renderiza los botones de categorías (chips).
 */
export function representarCategorias() {
  const contenedorCategorias = seleccionar("#filtrosCategoria");
  if (!contenedorCategorias) return;

  contenedorCategorias.innerHTML = CATEGORIAS.map(c => {
    const estaActiva = estado.categoria === c;
    return `
      <button
        type="button"
        class="ficha ${estaActiva ? "activa" : ""}"
        data-accion="seleccionar-categoria"
        data-categoria="${escaparHTML(c)}"
        aria-pressed="${estaActiva}"
      >${escaparHTML(c)}</button>
    `;
  }).join("");
}

/**
 * Filtra y renderiza las tarjetas de palabras clave en la grilla.
 */
export function representarDiccionario() {
  const cuadricula = seleccionar("#cuadriculaTarjetas");
  const etiquetaCantidad = seleccionar("#etiquetaCantidad");
  if (!cuadricula || !etiquetaCantidad) return;

  const q = estado.busqueda.trim().toLowerCase();
  const filtrados = DATOS_DICCIONARIO.filter(elemento => {
    const coincideCategoria = estado.categoria === "Todas" || elemento.categoria === estado.categoria;
    const coincideAlcance = estado.alcance === "todos" || elemento.alcance === estado.alcance;
    const coincideTexto = !q ||
      elemento.palabraClave.toLowerCase().includes(q) ||
      elemento.descripcion.toLowerCase().includes(q) ||
      elemento.categoria.toLowerCase().includes(q) ||
      elemento.sintaxis.toLowerCase().includes(q);
    return coincideCategoria && coincideAlcance && coincideTexto;
  });

  etiquetaCantidad.textContent = `Mostrando ${filtrados.length} de ${DATOS_DICCIONARIO.length} elementos`;

  if (filtrados.length === 0) {
    cuadricula.innerHTML = `
      <div class="estado-vacio" role="status">
        No se encontraron palabras clave con ese filtro. Probá borrando la búsqueda.
      </div>
    `;
    return;
  }

  cuadricula.innerHTML = filtrados.map(elemento => {
    const claseDistintivo = elemento.alcance === "basico" ? "basico" : "extendido";
    const textoDistintivo = elemento.alcance === "basico" ? "Ingreso PDF" : "Extendido";

    return `
      <article
        class="tarjeta"
        data-accion="abrir-modal"
        data-palabra-clave="${escaparHTML(elemento.palabraClave)}"
        tabindex="0"
        role="button"
        aria-label="Ver detalles de ${escaparHTML(elemento.palabraClave)}"
      >
        <div class="cabecera-tarjeta">
          <span class="palabra-clave">${escaparHTML(elemento.palabraClave)}</span>
          <span class="distintivo ${claseDistintivo}">${textoDistintivo}</span>
        </div>
        <div class="etiqueta-categoria">${escaparHTML(elemento.categoria)}</div>
        <p class="descripcion">${escaparHTML(elemento.descripcion)}</p>
        <div class="vista-sintaxis">${escaparHTML(elemento.sintaxis)}</div>
        <div class="pie-tarjeta">
          <span>Clic para ver ejemplo y reglas</span>
          <button
            type="button"
            class="boton-copiar-pequeno"
            data-accion="copiar-palabra-clave"
            data-palabra-clave="${escaparHTML(elemento.palabraClave)}"
            aria-label="Copiar palabra clave ${escaparHTML(elemento.palabraClave)}"
          >${iconoCopiar(14)} <span>Copiar</span></button>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * Busca un elemento en el diccionario por su palabra clave exacta.
 * @param {string} palabraClave
 * @returns {object|undefined}
 */
export function buscarPalabraClave(palabraClave) {
  return DATOS_DICCIONARIO.find(d => d.palabraClave === palabraClave);
}

/**
 * Filtra el diccionario por una palabra clave específica y abre su modal.
 * Usado cuando el usuario hace clic en una palabra clave relacionada desde Anatomía.
 * @param {string} palabraClave
 */
export function filtrarYAbrirPalabraClave(palabraClave) {
  estado.categoria = "Todas";
  estado.alcance = "todos";
  estado.busqueda = palabraClave;

  const entradaBusqueda = seleccionar("#entradaBusqueda");
  if (entradaBusqueda) entradaBusqueda.value = palabraClave;

  seleccionarTodos(".boton-alcance").forEach(boton => {
    const sonTodos = boton.dataset.alcance === "todos";
    boton.classList.toggle("activa", sonTodos);
    boton.setAttribute("aria-pressed", String(sonTodos));
  });

  representarCategorias();
  representarDiccionario();

  const elemento = buscarPalabraClave(palabraClave);
  if (elemento) {
    const tarjetaElemento = seleccionar(`.tarjeta[data-palabra-clave="${CSS.escape(palabraClave)}"]`);
    abrirModal(elemento, tarjetaElemento);
  }
}

/**
 * Inicializa los controladores de eventos para filtros, búsqueda y tarjetas.
 */
export function inicializarDiccionario() {
  const entradaBusqueda = seleccionar("#entradaBusqueda");
  const contenedorCategorias = seleccionar("#filtrosCategoria");
  const selectorAlcance = seleccionar(".selector-alcance");
  const cuadricula = seleccionar("#cuadriculaTarjetas");

  if (entradaBusqueda) {
    entradaBusqueda.addEventListener("input", e => {
      estado.busqueda = e.target.value;
      representarDiccionario();
    });
  }

  const botonAccion = seleccionar("#botonLimpiarOBuscar");
  if (botonAccion && entradaBusqueda) {
    botonAccion.addEventListener("click", () => {
      const cuadricula = seleccionar("#cuadriculaTarjetas");
      if (cuadricula) {
        cuadricula.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      entradaBusqueda.focus();
    });
  }

  if (contenedorCategorias) {
    contenedorCategorias.addEventListener("click", e => {
      const boton = e.target.closest("button[data-categoria]");
      if (!boton) return;
      estado.categoria = boton.dataset.categoria;
      representarCategorias();
      representarDiccionario();
    });
  }

  if (selectorAlcance) {
    selectorAlcance.addEventListener("click", e => {
      const boton = e.target.closest("button[data-alcance]");
      if (!boton) return;

      seleccionarTodos(".boton-alcance", selectorAlcance).forEach(botonAlcance => {
        botonAlcance.classList.remove("activa");
        botonAlcance.setAttribute("aria-pressed", "false");
      });
      boton.classList.add("activa");
      boton.setAttribute("aria-pressed", "true");

      estado.alcance = boton.dataset.alcance;
      representarDiccionario();
    });
  }

  if (cuadricula) {
    // Delegación para clics en tarjetas y botón de copiado
    cuadricula.addEventListener("click", e => {
      const botonCopiar = e.target.closest('button[data-accion="copiar-palabra-clave"]');
      if (botonCopiar) {
        e.stopPropagation();
        const palabraClave = botonCopiar.dataset.palabraClave;
        if (palabraClave) copiarConConfirmacion(palabraClave, botonCopiar);
        return;
      }

      const tarjeta = e.target.closest('.tarjeta[data-accion="abrir-modal"]');
      if (tarjeta) {
        const palabraClave = tarjeta.dataset.palabraClave;
        const elemento = buscarPalabraClave(palabraClave);
        if (elemento) abrirModal(elemento, tarjeta);
      }
    });

    // Accesibilidad de teclado: Enter o Espacio para abrir tarjeta enfocada
    cuadricula.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        const botonCopiar = e.target.closest('button[data-accion="copiar-palabra-clave"]');
        if (botonCopiar) return; // Deja el comportamiento nativo del botón

        const tarjeta = e.target.closest('.tarjeta[data-accion="abrir-modal"]');
        if (tarjeta && e.target === tarjeta) {
          e.preventDefault();
          const palabraClave = tarjeta.dataset.palabraClave;
          const elemento = buscarPalabraClave(palabraClave);
          if (elemento) abrirModal(elemento, tarjeta);
        }
      }
    });
  }

  representarCategorias();
  representarDiccionario();
}
