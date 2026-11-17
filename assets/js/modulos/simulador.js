/**
 * Módulo del Simulador de Condiciones Lógicas en R-Info.
 *
 * Implementa un evaluador seguro mediante análisis léxico (analizador léxico) y sintáctico
 * recursivo descendente (analizador descendente recursivo) sin ejecución dinámica (`eval` ni `new Function`).
 * Esto previene vulnerabilidades de inyección de código, respeta CSP estrictas y garantiza
 * soporte exacto de la semántica de operadores de R-Info (división entera, equivalencias, precedencia).
 */
import { seleccionar, escaparHTML } from "./dom.js";
import { iconoCirculoCorrecto, iconoCirculoError, iconoAdvertencia } from "./iconos.js";

/**
 * Obtiene el entorno de evaluación con los valores actuales de sensores y coordenadas.
 * @returns {Record<string, boolean|number>}
 */
function obtenerEntorno() {
  const obtenerMarcado = id => Boolean(seleccionar(id)?.checked);
  const obtenerNumero = (id, valorAlternativo = 1) => {
    const valor = Number(seleccionar(id)?.value);
    return Number.isFinite(valor) ? valor : valorAlternativo;
  };

  return {
    HayFlorEnLaEsquina: obtenerMarcado("#sensorFlorEsquina"),
    HayPapelEnLaEsquina: obtenerMarcado("#sensorPapelEsquina"),
    HayFlorEnLaBolsa: obtenerMarcado("#sensorFlorBolsa"),
    HayPapelEnLaBolsa: obtenerMarcado("#sensorPapelBolsa"),
    PosAv: obtenerNumero("#sensorAvenida", 1),
    PosCa: obtenerNumero("#sensorCalle", 1),
    V: true,
    F: false
  };
}

/**
 * Tipos de unidades léxicas reconocidas en la gramática R-Info.
 * @typedef {{ tipo: string, valor: any }} UnidadLexica
 */

/**
 * Analizador léxico: convierte la cadena de entrada en una secuencia de unidades léxicas válidas de R-Info.
 * @param {string} entrada
 * @returns {UnidadLexica[]}
 */
export function tokenizar(entrada) {
  const unidadesLexicas = [];
  let i = 0;
  const n = entrada.length;

  while (i < n) {
    const caracter = entrada[i];

    // 1. Ignorar espacios en blanco
    if (/\s/.test(caracter)) {
      i++;
      continue;
    }

    // 2. Paréntesis
    if (caracter === "(" || caracter === ")") {
      unidadesLexicas.push({ tipo: caracter, valor: caracter });
      i++;
      continue;
    }

    // 3. Operadores de dos caracteres (<=, >=, <>)
    const dosCaracteres = entrada.slice(i, i + 2);
    if (dosCaracteres === "<=" || dosCaracteres === ">=" || dosCaracteres === "<>") {
      unidadesLexicas.push({ tipo: "OPERADOR_RELACIONAL", valor: dosCaracteres });
      i += 2;
      continue;
    }

    // 4. Operadores de un caracter relacionales y de igualdad
    if (caracter === "<" || caracter === ">" || caracter === "=") {
      unidadesLexicas.push({ tipo: "OPERADOR_RELACIONAL", valor: caracter });
      i++;
      continue;
    }

    // 5. Operadores lógicos (~ / !, & / &&, | / ||)
    if (caracter === "~" || caracter === "!") {
      unidadesLexicas.push({ tipo: "OPERADOR_NEGACION", valor: "~" });
      i++;
      continue;
    }
    if (caracter === "&") {
      if (entrada[i + 1] === "&") i++;
      unidadesLexicas.push({ tipo: "OPERADOR_Y", valor: "&" });
      i++;
      continue;
    }
    if (caracter === "|") {
      if (entrada[i + 1] === "|") i++;
      unidadesLexicas.push({ tipo: "OPERADOR_O", valor: "|" });
      i++;
      continue;
    }

    // 6. Operadores aritméticos (+, -, *, /)
    if (caracter === "+" || caracter === "-") {
      unidadesLexicas.push({ tipo: "OPERADOR_SUMAR", valor: caracter });
      i++;
      continue;
    }
    if (caracter === "*" || caracter === "/") {
      unidadesLexicas.push({ tipo: "OPERADOR_MULTIPLICAR", valor: caracter });
      i++;
      continue;
    }

    // 7. Números enteros
    if (/\d/.test(caracter)) {
      let cadenaNumero = "";
      while (i < n && /\d/.test(entrada[i])) {
        cadenaNumero += entrada[i];
        i++;
      }
      unidadesLexicas.push({ tipo: "NUMERO", valor: parseInt(cadenaNumero, 10) });
      continue;
    }

    // 8. Identificadores permitidos (sensores y literales de R-Info)
    if (/[a-zA-Z_]/.test(caracter)) {
      let identificador = "";
      while (i < n && /[a-zA-Z0-9_]/.test(entrada[i])) {
        identificador += entrada[i];
        i++;
      }
      unidadesLexicas.push({ tipo: "IDENTIFICADOR", valor: identificador });
      continue;
    }

    throw new Error(`Carácter no permitido: '${caracter}'. Usá solo operadores y sensores de R-Info.`);
  }

  unidadesLexicas.push({ tipo: "FIN_ENTRADA", valor: null });
  return unidadesLexicas;
}

/**
 * Parser y evaluador recursivo descendente con precedencia de operadores R-Info:
 *  1. Primarios (literales, sensores, subexpresiones entre paréntesis)
 *  2. Unario: ~ (NOT) y - unario
 *  3. Multiplicativo: *, / (división entera Math.trunc)
 *  4. Aditivo: +, -
 *  5. Relacional: =, <>, <, <=, >, >=
 *  6. Lógico AND: &
 *  7. Lógico OR: |
 */
export class EvaluadorExpresion {
  /**
   * @param {UnidadLexica[]} unidadesLexicas
   * @param {Record<string, boolean|number>} entorno
   */
  constructor(unidadesLexicas, entorno) {
    this.unidadesLexicas = unidadesLexicas;
    this.entorno = entorno;
    this.posicion = 0;
  }

  actual() {
    return this.unidadesLexicas[this.posicion];
  }

  consumir(tipoEsperado = null) {
    const unidad = this.actual();
    if (tipoEsperado && unidad.tipo !== tipoEsperado) {
      throw new Error(`Se esperaba '${tipoEsperado}' pero se encontró '${unidad.valor ?? unidad.tipo}'.`);
    }
    this.posicion++;
    return unidad;
  }

  evaluar() {
    if (this.actual().tipo === "FIN_ENTRADA") {
      throw new Error("La expresión no puede estar vacía.");
    }
    const resultado = this.analizarO();
    if (this.actual().tipo !== "FIN_ENTRADA") {
      throw new Error(`Símbolo inesperado al final de la expresión: '${this.actual().valor}'.`);
    }
    return Boolean(resultado);
  }

  // Nivel 7: Lógico OR (|)
  analizarO() {
    let izquierda = this.analizarY();
    while (this.actual().tipo === "OPERADOR_O") {
      this.consumir("OPERADOR_O");
      const derecha = this.analizarY();
      izquierda = Boolean(izquierda) || Boolean(derecha);
    }
    return izquierda;
  }

  // Nivel 6: Lógico AND (&)
  analizarY() {
    let izquierda = this.analizarRelacional();
    while (this.actual().tipo === "OPERADOR_Y") {
      this.consumir("OPERADOR_Y");
      const derecha = this.analizarRelacional();
      izquierda = Boolean(izquierda) && Boolean(derecha);
    }
    return izquierda;
  }

  // Nivel 5: Relacionales (=, <>, <, <=, >, >=)
  analizarRelacional() {
    let izquierda = this.analizarSumaResta();
    while (this.actual().tipo === "OPERADOR_RELACIONAL") {
      const operador = this.consumir("OPERADOR_RELACIONAL").valor;
      const derecha = this.analizarSumaResta();
      switch (operador) {
        case "=":
          izquierda = izquierda === derecha;
          break;
        case "<>":
          izquierda = izquierda !== derecha;
          break;
        case "<":
          izquierda = izquierda < derecha;
          break;
        case "<=":
          izquierda = izquierda <= derecha;
          break;
        case ">":
          izquierda = izquierda > derecha;
          break;
        case ">=":
          izquierda = izquierda >= derecha;
          break;
        default:
          throw new Error(`Operador relacional desconocido '${operador}'.`);
      }
    }
    return izquierda;
  }

  // Nivel 4: Aditivo (+, -)
  analizarSumaResta() {
    let izquierda = this.analizarMultiplicacionDivision();
    while (this.actual().tipo === "OPERADOR_SUMAR") {
      const operador = this.consumir("OPERADOR_SUMAR").valor;
      const derecha = this.analizarMultiplicacionDivision();
      izquierda = operador === "+" ? Number(izquierda) + Number(derecha) : Number(izquierda) - Number(derecha);
    }
    return izquierda;
  }

  // Nivel 3: Multiplicativo (*, / entero)
  analizarMultiplicacionDivision() {
    let izquierda = this.analizarUnario();
    while (this.actual().tipo === "OPERADOR_MULTIPLICAR") {
      const operador = this.consumir("OPERADOR_MULTIPLICAR").valor;
      const derecha = this.analizarUnario();
      if (operador === "*") {
        izquierda = Number(izquierda) * Number(derecha);
      } else {
        if (Number(derecha) === 0) {
          throw new Error("División por cero no permitida.");
        }
        // División entera según especificación R-Info
        izquierda = Math.trunc(Number(izquierda) / Number(derecha));
      }
    }
    return izquierda;
  }

  // Nivel 2: Unarios (~ negación lógica, - negativo)
  analizarUnario() {
    if (this.actual().tipo === "OPERADOR_NEGACION") {
      this.consumir("OPERADOR_NEGACION");
      const valor = this.analizarUnario();
      return !valor;
    }
    if (this.actual().tipo === "OPERADOR_SUMAR" && this.actual().valor === "-") {
      this.consumir("OPERADOR_SUMAR");
      const valor = this.analizarUnario();
      return -Number(valor);
    }
    return this.analizarPrimario();
  }

  // Nivel 1: Primarios
  analizarPrimario() {
    const unidad = this.actual();

    if (unidad.tipo === "(") {
      this.consumir("(");
      const expresion = this.analizarO();
      this.consumir(")");
      return expresion;
    }

    if (unidad.tipo === "NUMERO") {
      this.consumir("NUMERO");
      return unidad.valor;
    }

    if (unidad.tipo === "IDENTIFICADOR") {
      const nombre = this.consumir("IDENTIFICADOR").valor;
      if (Object.prototype.hasOwnProperty.call(this.entorno, nombre)) {
        return this.entorno[nombre];
      }
      throw new Error(`Identificador '${nombre}' no reconocido. Usá sensores o variables válidas.`);
    }

    throw new Error(`Sintaxis inválida cerca de '${unidad.valor ?? unidad.tipo}'.`);
  }
}

/**
 * Evalúa la expresión actual y actualiza el contenedor de resultado.
 */
export function evaluarExpresion() {
  const entradaElemento = seleccionar("#entradaExpresion");
  const resultadoElemento = seleccionar("#resultadoExpresion");
  if (!entradaElemento || !resultadoElemento) return;

  const textoPlano = entradaElemento.value.trim();

  if (!textoPlano) {
    resultadoElemento.className = "resultado-expresion error";
    resultadoElemento.innerHTML = `<span>${iconoAdvertencia(16)} Expresión vacía</span><small>Ingresá una proposición lógica de R-Info</small>`;
    return;
  }

  const entorno = obtenerEntorno();

  try {
    const unidadesLexicas = tokenizar(textoPlano);
    const evaluador = new EvaluadorExpresion(unidadesLexicas, entorno);
    const resultado = evaluador.evaluar();

    resultadoElemento.className = `resultado-expresion ${resultado ? "verdadero" : "falso"}`;
    resultadoElemento.innerHTML = `
      <span>${resultado ? iconoCirculoCorrecto(16) : iconoCirculoError(16)} Resultado: ${resultado ? "V (Verdadero)" : "F (Falso)"}</span>
      <small>Evaluación en vivo (sin ejecución dinámica)</small>
    `;
  } catch (error) {
    resultadoElemento.className = "resultado-expresion error";
    resultadoElemento.innerHTML = `
      <span>${iconoAdvertencia(16)} Sintaxis inválida</span>
      <small>${escaparHTML(error.message)}</small>
    `;
  }
}

/**
 * Establece una expresión preset y la evalúa inmediatamente.
 * @param {string} expresion
 */
export function establecerExpresion(expresion) {
  const entradaElemento = seleccionar("#entradaExpresion");
  if (entradaElemento) {
    entradaElemento.value = expresion;
    evaluarExpresion();
  }
}

/**
 * Inicializa los controladores de eventos para los controles y valores predefinidos del simulador.
 */
export function inicializarSimulador() {
  const vistaSimulador = seleccionar("#vistaSimulador");
  if (!vistaSimulador) return;

  // Escuchar cambios en los sensores e entradas numéricas
  const selectoresControl = ["#sensorFlorEsquina", "#sensorPapelEsquina", "#sensorFlorBolsa", "#sensorPapelBolsa", "#sensorAvenida", "#sensorCalle", "#entradaExpresion"];
  selectoresControl.forEach(selector => {
    const el = seleccionar(selector);
    if (el) {
      el.addEventListener("input", evaluarExpresion);
    }
  });

  // Delegación para botones de preset
  const contenedorPredefinidas = seleccionar(".botones-predefinidos", vistaSimulador);
  if (contenedorPredefinidas) {
    contenedorPredefinidas.addEventListener("click", e => {
      const boton = e.target.closest('button[data-accion="establecer-predefinida"]');
      if (boton && boton.dataset.expresion) {
        establecerExpresion(boton.dataset.expresion);
      }
    });
  }

  // Evaluación inicial
  evaluarExpresion();
}
