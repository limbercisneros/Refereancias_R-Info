/**
 * Pasos del ciclo de creación y ejecución de robots y áreas en memoria y mapa.
 */
export const CICLO_VIDA = [
  {
    numero: "Paso 1",
    titulo: "areas",
    codigo: "areas\n  ciudad: AreaC(1,1,100,100)",
    explicacion: "Se delimitan las zonas válidas del mapa (100×100). Todas las esquinas arrancan vacías (0 flores, 0 papeles) salvo que cargues valores en la Sección Detalles.",
    estado: [
      "Mapa: Grilla 100×100 lista",
      "Áreas creadas: 'ciudad' (1,1 → 100,100)",
      "Robots vivos: Ninguno todavía"
    ]
  },
  {
    numero: "Paso 2",
    titulo: "robots / robot",
    codigo: "robots\n  robot robot1\n  variables\n    cant: numero\n  comenzar\n    ...\n  fin",
    explicacion: "Se define el 'molde' (tipo) del robot: qué variables locales tendrá y qué algoritmo ejecutará. Todavía NO existe ningún robot en la ciudad.",
    estado: [
      "Tipo definido: 'robot1'",
      "Variables del molde: 'cant' (sin valor aún)",
      "Instancias físicas: 0"
    ]
  },
  {
    numero: "Paso 3",
    titulo: "variables (global)",
    codigo: "variables\n  Rinfo: robot1",
    explicacion: "Se crea la instancia real del robot llamada 'Rinfo'. Ya posee su propia bolsa (vacía), sus sensores, su color rojo por defecto y su espacio de memoria, pero aún no está ubicado en el mapa.",
    estado: [
      "Instancia creada: Rinfo",
      "Bolsa: 0 flores, 0 papeles",
      "Color: Rojo | Posición: Sin iniciar"
    ]
  },
  {
    numero: "Paso 4",
    titulo: "AsignarArea",
    codigo: "comenzar\n  AsignarArea(Rinfo, ciudad)",
    explicacion: "Se le otorga a 'Rinfo' permiso de tránsito sobre el área 'ciudad'. Sin este paso, intentar iniciarlo o moverlo provocaría un error inmediato.",
    estado: [
      "Permisos de Rinfo: Puede pisar 'ciudad'",
      "Posición: Todavía fuera del mapa",
      "Orientación: Pendiente de Iniciar"
    ]
  },
  {
    numero: "Paso 5",
    titulo: "Iniciar",
    codigo: "  Iniciar(Rinfo, 1, 1)\nfin",
    explicacion: "Coloca físicamente a 'Rinfo' en la esquina (1,1) mirando hacia el Norte (arriba) y comienza a ejecutar las instrucciones definidas en 'robot1'.",
    estado: [
      "PosAv = 1, PosCa = 1",
      "Orientación: Norte (↑)",
      "Estado: Ejecutando algoritmo..."
    ]
  }
];
