const photoModules = import.meta.glob('./assets/[0-9]*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function photoUrl(n: number) {
  return photoModules[`./assets/${n}.png`]
}

const PHOTO_CAPTIONS = [
  'si el mundo se apagara, tu risa bastaría',
  'me miras y se me ordena el caos',
  'eres mi calma después de la tormenta',
  'contigo aprendí lo que es querer de verdad',
  'tu voz es mi canción favorita',
  'guardé este instante como un tesoro',
  'me haces sentir el hombre más afortunado',
  'tus ojos… ahí me quedo a vivir',
  'cada abrazo tuyo me reconstruye',
  'eres magia disfrazada de mujer',
  'contigo hasta lo simple se vuelve especial',
  'me enamoré una vez… y sigo cayendo',
  'tu mano es mi lugar seguro',
  'cuando sonríes, el día se rinde a ti',
  'eres la razón por la que creo en el amor',
  'mi corazón late con tu nombre',
  'gracias por existir en mi historia',
  'eres arte, y yo tu admirador eterno',
  'ninguna distancia cabe entre nosotros',
  'me enseñaste a ser mejor por ti',
  'tu ternura desarma cualquier duda',
  'sueño despierto cuando estás cerca',
  'eres mi hoy, mi mañana y mi siempre',
  'en tus brazos el tiempo se detiene',
  'te elijo en cada versión de mi vida',
  'mi alma te reconoció al instante',
  'eres el hogar que no supe que buscaba',
  'contigo quiero envejecer de la mano',
  'tu amor es mi victoria más linda',
  'si pudiera, te regalaría el cielo entero',
  'esta foto… y mil razones más para amarte',
]

export const COUNTER_START = '2022-12-16'

export const FP_MESSAGES = [
  { at: 0, text: 'Buscando tu latido...' },
  { at: 700, text: 'Sincronizando corazones' },
  { at: 1400, text: 'Ya casi eres tú...' },
] as const

export const FP_SUCCESS = 'Te encontré'
export const FP_WELCOME = 'Pasa, mi reina'
export const FP_HINT = 'Mantén presionada la huella ♥'
export const FP_SUBTITLE = 'Para la dueña de mi pecho'

export const HERO = {
  titleBefore: 'Tú',
  titleAmp: 'y',
  titleAfter: 'Yo',
  subtitle: '3 años y 8 meses de elegirnos',
}

export const DEDICATORIA = {
  title: 'Porque mereces saberlo',
  paragraphs: [
    'Hay mujeres que llegan a la vida… y hay mujeres que se vuelven la vida. Tú eres de las segundas. Desde que caminas a mi lado, todo lo ordinario se vuelve extraordinario: un mensaje tuyo me arregla la tarde, una mirada tuya me desarma sin pedir permiso.',
    'Hoy no celebro solo el tiempo. Celebro tu paciencia, tu fuerza, esa forma tuya de iluminar incluso mis días grises. Quiero que sientas, sin duda alguna, que eres amada con intensidad, con respeto y con ganas de nunca soltarte.',
  ],
  sign: 'Eres mi persona. Punto final.',
}

export const PHOTOS = Array.from({ length: 31 }, (_, i) => {
  const n = i + 1
  return {
    src: photoUrl(n),
    caption: PHOTO_CAPTIONS[i],
  }
})

export const TIMELINE = [
  {
    date: '16 · Dic · 2022',
    title: 'El destino puso tu nombre',
    body: 'Aquel día el universo hizo trampa a mi favor: te puso frente a mí… y mi historia cambió de título para siempre.',
    image: photoUrl(1),
  },
  {
    date: 'Tormentas y soles',
    title: 'Seguimos de pie',
    body: 'Hubo noches difíciles y mañanas perfectas. En ambas, tuve la misma certeza: contigo vale la pena pelear por lo nuestro.',
    image: photoUrl(15),
  },
  {
    date: 'Nuestro futuro',
    title: 'El hogar que imagino',
    body: 'Cuando pienso en mañana, te veo. En la mesa, en las risas, en los planes grandes y en los silencios cómodos. Contigo quiero construir lo que dure.',
    image: photoUrl(22),
  },
  {
    date: 'Ago · 2026',
    title: 'Otro mes de enamorarte',
    body: 'Tres años y ocho meses después, sigo buscando excusas para decirte lo hermosa que eres… y nunca me alcanzan las palabras.',
    image: photoUrl(31),
  },
]

export const LETTER = {
  greeting: 'Mi niña hermosa,',
  paragraphs: [
    'Si abres esto, quiero que lo leas despacio. Como si yo estuviera frente a ti, tomándote la cara con las dos manos, mirándote a los ojos sin prisa.',
    'A veces siento que no te digo lo suficiente lo orgulloso que estoy de ti. De cómo brillas cuando ni tú misma lo notas. De cómo tu presencia me da valentía. Eres mi motivación silenciosa, la razón por la que quiero ser mejor hombre cada día.',
    'Me enamora tu risa, tu carácter, tu forma de cuidar. Me enamora también cuando estamos en silencio, porque hasta el silencio contigo se siente completo. Si el mundo se pone pesado, tú eres mi alivio. Si yo me pierdo, tú eres el camino de regreso.',
    'No te prometo una vida perfecta. Te prometo una vida real: con besos en la frente, con apoyo cuando duela, con celebraciones cuando ganes, y con mi mano siempre buscando la tuya. Porque enamorarte no fue un momento… es lo que elijo hacer todos los días.',
    'Gracias por quedarte. Gracias por confiar. Gracias por convertirme en alguien que cree en el para siempre. Hoy, y en cada mes que venga, quiero seguir robándote sonrisas.',
  ],
  signoff: '— Tuyo, sin condiciones ni fechas de caducidad',
}

export const FINAL = {
  title: 'Quédate.',
  name: 'Aquí. Conmigo.',
  tag: 'Porque si el amor tuviera cara, tendría la tuya… y yo no sabría mirar a otro lado.',
  sign: '— Para siempre empieza otra vez hoy ♥',
}
