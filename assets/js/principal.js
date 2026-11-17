/**
 * Punto de entrada principal de la aplicación R-Info (UNLP).
 * Orquesta la inicialización de módulos ES independientes.
 */
import { seleccionar } from "./modulos/dom.js";
import { inicializarTema } from "./modulos/tema.js";
import { inicializarNavegacion, alCambiarVista } from "./modulos/navegacion.js";
import { inicializarModal } from "./modulos/modal.js";
import { inicializarDiccionario } from "./modulos/diccionario.js";
import { inicializarAnatomia } from "./modulos/anatomia.js";
import { inicializarSimulador, evaluarExpresion } from "./modulos/simulador.js";
import { copiarConConfirmacion } from "./modulos/portapapeles.js";

function inicializarCopiaPlantilla() {
  const botonCopiar = seleccionar('#vistaPlantilla button[data-accion="copiar-plantilla"]');
  const bloqueCodigo = seleccionar("#codigoPlantilla");

  if (botonCopiar && bloqueCodigo) {
    botonCopiar.addEventListener("click", () => {
      copiarConConfirmacion(bloqueCodigo.textContent, botonCopiar, "Plantilla copiada");
    });
  }
}

function inicializarAplicacion() {
  // 1. Inicializar tema (claro/oscuro)
  inicializarTema();

  // 2. Inicializar navegación y registrar observador de cambio de vista
  inicializarNavegacion();
  alCambiarVista(identificadorVista => {
    if (identificadorVista === "vistaSimulador") {
      evaluarExpresion();
    }
  });

  // 3. Inicializar componentes y vistas
  inicializarModal();
  inicializarDiccionario();
  inicializarAnatomia();
  inicializarSimulador();
  inicializarCopiaPlantilla();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarAplicacion);
} else {
  inicializarAplicacion();
}
