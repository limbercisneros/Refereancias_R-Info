/**
 * Partes anatómicas y componentes abstractos de Robot y Área en R-Info.
 */
export const PARTES_ANATOMIA = [
  {
    identificador: "bolsa",
    grupo: "Qué trae el Robot por defecto",
    titulo: "Bolsa interna",
    resumen: "0 flores, 0 papeles",
    estadoInicial: "Vacía al inicio (capacidad ilimitada)",
    descripcion: "Todo robot creado en R-Info nace con una bolsa propia para transportar flores y papeles. Tiene capacidad ilimitada, pero el robot no puede consultar 'cuántas' flores o papeles tiene adentro; solo sabe si hay al menos uno de cada tipo.",
    detalles: [
      { etiqueta: "Valor por defecto", valor: "0 flores y 0 papeles (salvo que los cargues manualmente en la Sección Detalles antes de ejecutar)." },
      { etiqueta: "Cómo se consulta", valor: "Solo de forma booleana (V/F) mediante HayFlorEnLaBolsa y HayPapelEnLaBolsa." },
      { etiqueta: "Cómo se modifica", valor: "De a 1 objeto por vez usando tomarFlor / tomarPapel (agrega) y depositarFlor / depositarPapel (saca)." },
      { etiqueta: "Error típico", valor: "Llamar a depositarFlor con la bolsa vacía aborta el programa. ¡No existe una variable automática 'cantBolsa'!" }
    ],
    palabrasClave: ["HayFlorEnLaBolsa", "HayPapelEnLaBolsa", "tomarFlor", "tomarPapel", "depositarFlor", "depositarPapel"],
    codigo: "{ Si querés saber cuántas flores juntaste, contalas en una variable }\nflores := 0\nmientras (HayFlorEnLaEsquina)\n  tomarFlor\n  flores := flores + 1"
  },
  {
    identificador: "posicion",
    grupo: "Qué trae el Robot por defecto",
    titulo: "Posición (GPS interno)",
    resumen: "PosAv, PosCa",
    estadoInicial: "Se fija con Iniciar(robot, av, ca)",
    descripcion: "El robot guarda en su estado interno el par de coordenadas (avenida, calle) donde está parado. En el Curso de Ingreso siempre arranca en (1,1).",
    detalles: [
      { etiqueta: "Rango válido", valor: "Enteros del 1 al 100 tanto para Avenida (vertical) como para Calle (horizontal)." },
      { etiqueta: "Cómo se consulta", valor: "Con los identificadores PosAv y PosCa." },
      { etiqueta: "Cómo se modifica", valor: "Únicamente avanzando una cuadra con mover o saltando con Pos(av, ca)." },
      { etiqueta: "Regla clave", valor: "PosAv y PosCa son de SOLO LECTURA: hacer 'PosAv := 5' es un error de sintaxis." }
    ],
    palabrasClave: ["PosAv", "PosCa", "Pos", "mover", "Iniciar"],
    codigo: "Pos(15, 12)     { Salta a Av 15, Calle 12 }\nmover           { Ahora está en (15, 13) si miraba al Norte }\nInformar(PosAv, PosCa)"
  },
  {
    identificador: "orientacion",
    grupo: "Qué trae el Robot por defecto",
    titulo: "Orientación (Brújula)",
    resumen: "Norte por defecto",
    estadoInicial: "Mirando hacia el Norte (arriba)",
    descripcion: "El robot siempre sabe hacia cuál de los 4 puntos cardinales mira (Norte, Este, Sur u Oeste). Al ejecutar Iniciar, queda apuntando hacia el Norte.",
    detalles: [
      { etiqueta: "Orientación inicial", valor: "Siempre Norte (sube por las calles: al hacer mover aumenta PosCa)." },
      { etiqueta: "Cómo gira", valor: "Solo gira 90° en sentido horario con 'derecha' (1 vez = Este, 2 = Sur, 3 = Oeste, 4 = Norte)." },
      { etiqueta: "Efecto de Pos()", valor: "Pos(av, ca) cambia las coordenadas pero NO modifica la orientación que tenía el robot." },
      { etiqueta: "¿Se puede consultar?", valor: "No existe un sensor tipo 'Orientacion'; el programador lleva la cuenta de sus giros." }
    ],
    palabrasClave: ["Iniciar", "derecha", "mover", "Pos"],
    codigo: "{ Para recorrer una calle hacia la derecha (Este) desde (1,1) }\nderecha\nmover { Ahora avanza de (1,1) a (2,1) }"
  },
  {
    identificador: "sensores",
    grupo: "Qué trae el Robot por defecto",
    titulo: "Sensores visuales",
    resumen: "Esquina actual",
    estadoInicial: "Activos solo en la esquina parada",
    descripcion: "El robot tiene sensores visuales para reconocer exactamente dos tipos de objetos en el piso: flores y papeles. No ve esquinas vecinas ni distingue colores o cantidades.",
    detalles: [
      { etiqueta: "Qué detectan", valor: "Si hay al menos 1 flor (HayFlorEnLaEsquina) o al menos 1 papel (HayPapelEnLaEsquina)." },
      { etiqueta: "Alcance", valor: "Únicamente la esquina (PosAv, PosCa) donde está parado en ese instante." },
      { etiqueta: "Limitación", valor: "No puede saber cuántas flores hay sin recogerlas de a una con un mientras." },
      { etiqueta: "Esquina vacía", valor: "Se comprueba combinando ambos: ~(HayFlorEnLaEsquina | HayPapelEnLaEsquina)." }
    ],
    palabrasClave: ["HayFlorEnLaEsquina", "HayPapelEnLaEsquina", "~", "&", "|"],
    codigo: "{ ¿La esquina actual está completamente vacía? }\nsi (~HayFlorEnLaEsquina & ~HayPapelEnLaEsquina)\n  Informar(V)"
  },
  {
    identificador: "memoria",
    grupo: "Qué trae el Robot por defecto",
    titulo: "Memoria y Cálculo",
    resumen: "variables, ALU, Informar",
    estadoInicial: "Variables sin inicializar",
    descripcion: "Cada tipo de robot puede declarar sus propias variables locales (numero y boolean), operar aritméticamente (+, -, *, / entero), evaluar lógica y mostrar datos por pantalla con Informar.",
    detalles: [
      { etiqueta: "Dónde se declaran", valor: "En la sección 'variables' dentro de 'robot' (o dentro de un 'proceso'). Nunca variables globales numéricas." },
      { etiqueta: "Inicialización", valor: "No confíes en valores por defecto: siempre inicializá tus variables (ej. cant := 0) antes de usarlas." },
      { etiqueta: "División", valor: "El operador '/' hace división entera (ej. 7 / 2 da 3)." },
      { etiqueta: "Apariencia en mapa", valor: "Cada robot instanciado aparece de color rojo por defecto (editable en Sección Detalles)." }
    ],
    palabrasClave: ["variables", "numero", "boolean", ":=", "Informar"],
    codigo: "variables\n  pasos: numero\ncomenzar\n  pasos := 0\n  ..."
  },
  {
    identificador: "concurrencia",
    grupo: "Qué trae el Robot por defecto",
    titulo: "Mensajes y Bloqueo (Ext.)",
    resumen: "Multi-robot",
    estadoInicial: "Disponible si hay varios robots",
    descripcion: "Cuando trabajás con múltiples robots en R-Info extendido, cada robot trae además un canal de mensajería y la capacidad de bloquear/liberar esquinas compartidas.",
    detalles: [
      { etiqueta: "Mensajería", valor: "EnviarMensaje(valor, destino) es asíncrono; RecibirMensaje(var, emisor) bloquea hasta recibir." },
      { etiqueta: "Comodín '*'", valor: "RecibirMensaje(id, *) acepta un mensaje de cualquier robot." },
      { etiqueta: "Exclusión mutua", valor: "BloquearEsquina(av, ca) y LiberarEsquina(av, ca) evitan que dos robots choquen en la misma esquina." },
      { etiqueta: "Azar", valor: "Random(var, min, max) genera enteros aleatorios." }
    ],
    palabrasClave: ["EnviarMensaje", "RecibirMensaje", "BloquearEsquina", "LiberarEsquina", "Random"],
    codigo: "BloquearEsquina(10, 10)\nPos(10, 10)\ntomarFlor\nPos(1, 1)\nLiberarEsquina(10, 10)"
  },
  {
    identificador: "ciudad",
    grupo: "Qué tiene la Ciudad y un Área",
    titulo: "La Ciudad y las Esquinas",
    resumen: "100×100 esquinas",
    estadoInicial: "Todas las esquinas vacías (0 flores, 0 papeles)",
    descripcion: "El mundo de R-Info es siempre una grilla fija de 100 avenidas (verticales, 1..100) por 100 calles (horizontales, 1..100). Las flores y papeles siempre viven en las esquinas (intersecciones).",
    detalles: [
      { etiqueta: "Contenido inicial", valor: "Al iniciar, toda esquina tiene 0 flores y 0 papeles (vacía), salvo que agregues objetos en la Sección Detalles." },
      { etiqueta: "Objetos por esquina", valor: "Una misma esquina puede contener múltiples flores y múltiples papeles a la vez." },
      { etiqueta: "Paso del robot", valor: "Cada 'mover' equivale a avanzar 1 cuadra (de una esquina a la siguiente)." },
      { etiqueta: "Tamaño fijo", valor: "No se puede cambiar el tamaño de 100×100 ni crear calles con número 0 o 101." }
    ],
    palabrasClave: ["PosAv", "PosCa", "mover", "HayFlorEnLaEsquina", "HayPapelEnLaEsquina"],
    codigo: "{ Esquina (2, 4) = Avenida 2, Calle 4 }\nPos(2, 4)"
  },
  {
    identificador: "area-permisos",
    grupo: "Qué tiene la Ciudad y un Área",
    titulo: "Qué define un Área",
    resumen: "Rectángulo (av1,ca1,av2,ca2)",
    estadoInicial: "Sin acceso hasta usar AsignarArea",
    descripcion: "Un área es un rectángulo de esquinas definido por su vértice inferior izquierdo (av1, ca1) y superior derecho (av2, ca2). Actúa como el cerco de tránsito permitido para un robot.",
    detalles: [
      { etiqueta: "Requisito obligatorio", valor: "Todo robot debe recibir al menos un área con AsignarArea(robot, area) antes de Iniciar." },
      { etiqueta: "Límites estrictos", valor: "Si un robot intenta hacer mover o Pos() hacia una esquina que no pertenece a sus áreas asignadas, el programa aborta." },
      { etiqueta: "Múltiples áreas", valor: "Un mismo robot puede tener más de un área asignada (ej. su zona privada + una esquina de depósito)." },
      { etiqueta: "Convención Ingreso", valor: "Se declara una sola área: ciudad: AreaC(1,1,100,100)." }
    ],
    palabrasClave: ["areas", "AreaC", "AsignarArea", "Iniciar"],
    codigo: "areas\n  ciudad: AreaC(1, 1, 100, 100)\n...\ncomenzar\n  AsignarArea(Rinfo, ciudad)\n  Iniciar(Rinfo, 1, 1)"
  },
  {
    identificador: "area-tipos",
    grupo: "Qué tiene la Ciudad y un Área",
    titulo: "Tipos: AreaC, AreaP, AreaPC",
    resumen: "Permisos entre robots",
    estadoInicial: "AreaC compartida total",
    descripcion: "Cuando hay más de un robot, R-Info distingue tres tipos de áreas según quiénes pueden compartir las esquinas internas.",
    detalles: [
      { etiqueta: "AreaC(av1,ca1,av2,ca2)", valor: "Compartida Total: todos los robots del programa pueden recibir permiso sobre ella." },
      { etiqueta: "AreaP(av1,ca1,av2,ca2)", valor: "Privada (Extendido): solo puede asignarse a un único robot. Impide superposiciones." },
      { etiqueta: "AreaPC(av1,ca1,av2,ca2)", valor: "Parcialmente Compartida (Extendido): la comparten solo los robots que la tengan asignada." },
      { etiqueta: "Estado de esquina", valor: "En AreaC/AreaPC las esquinas pueden bloquearse temporalmente con BloquearEsquina." }
    ],
    palabrasClave: ["AreaC", "AreaP", "AreaPC", "BloquearEsquina", "LiberarEsquina"],
    codigo: "areas\n  zonaR1: AreaP(1, 1, 10, 10)\n  zonaR2: AreaP(11, 1, 20, 10)\n  comun:  AreaPC(50, 50, 50, 50)"
  }
];
