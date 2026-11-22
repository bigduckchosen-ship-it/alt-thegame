export const SAVE_KEY = 'alt_runner_save';

export const CASSETTE_SPAWN_MIN = 1200;
export const CASSETTE_SPAWN_MAX = 1500;
export const MAX_UPGRADE_LEVEL = 5;

export const CHAPTERS = [
  {
    id: 1,
    title: 'Побег из панельки',
    subtitle: 'Сектор-07 // Сумеречные дворы',
    targetDistance: 8000,
    cassetteIds: ['c1_1', 'c1_2', 'c1_3']
  },
  {
    id: 2,
    title: 'Андеграунд-рейв в депо',
    subtitle: 'Трамвайный парк // Закатные рельсы',
    targetDistance: 11000,
    cassetteIds: ['c2_1', 'c2_2', 'c2_3']
  },
  {
    id: 3,
    title: 'Неоновый ТЦ',
    subtitle: 'Молл «Галактика» // Пастельный поп-арт',
    targetDistance: 14000,
    cassetteIds: ['c3_1', 'c3_2', 'c3_3']
  },
  {
    id: 4,
    title: 'Ветка метро Призрак',
    subtitle: 'Глубина -80м // Лазурный тоннель',
    targetDistance: 17000,
    cassetteIds: ['c4_1', 'c4_2', 'c4_3']
  },
  {
    id: 5,
    title: 'Крыша телебашни',
    subtitle: 'Высота 540м // Розовый рассвет',
    targetDistance: 20000,
    cassetteIds: ['c5_1', 'c5_2', 'c5_3']
  }
];

export const SKINS = [
  {
    id: 'classic',
    name: 'Классик Альт',
    desc: 'Черное худи, розово-фиолетовые хвостики и полосатые гетры.',
    cost: 0,
    swatches: ['#211a2e', '#ff3b8d', '#9775fa'],
    palette: {
      hoodie: 0x241d33,
      hoodieTrim: 0xff5ca8,
      skirt: 0x2f2140,
      hairBase: 0x1a1526,
      hairLeft: 0x9775fa,
      hairRight: 0xff4d94,
      sockA: '#1c1626',
      sockB: '#ff7eb6',
      boot: 0x181520,
      sole: 0xff3b8d,
      backpack: 0x1d1826,
      skin: 0xffe4e6
    }
  },
  {
    id: 'pastel',
    name: 'Пастель Гот',
    desc: 'Светло-лавандовый образ с мятными прядями и белым рюкзаком.',
    cost: 120,
    swatches: ['#e5dbff', '#63e6be', '#ffa8d6'],
    palette: {
      hoodie: 0xe5dbff,
      hoodieTrim: 0x63e6be,
      skirt: 0x3b2c59,
      hairBase: 0xf8f0ff,
      hairLeft: 0x63e6be,
      hairRight: 0xff8ec6,
      sockA: '#ffffff',
      sockB: '#b197fc',
      boot: 0xf4edff,
      sole: 0x63e6be,
      backpack: 0xffffff,
      skin: 0xffe6eb
    }
  },
  {
    id: 'cyber',
    name: 'Кибер-Китти',
    desc: 'Алый винил, бирюзовые акценты и глянцевые платформы.',
    cost: 280,
    swatches: ['#e0315a', '#3bc9db', '#1c1e2e'],
    palette: {
      hoodie: 0x202438,
      hoodieTrim: 0x3bc9db,
      skirt: 0xd6336c,
      hairBase: 0x181c2b,
      hairLeft: 0x3bc9db,
      hairRight: 0xff4d6d,
      sockA: '#1a1f30',
      sockB: '#3bc9db',
      boot: 0x1a1c28,
      sole: 0x3bc9db,
      backpack: 0xd6336c,
      skin: 0xffe3e3
    }
  },
  {
    id: 'comicpop',
    name: 'Комикс-Поп',
    desc: 'Солнечно-желтый оверсайз в стиле ярких страниц комикса.',
    cost: 450,
    swatches: ['#ffd43b', '#ff3b8d', '#4c6ef5'],
    palette: {
      hoodie: 0xffd43b,
      hoodieTrim: 0xff3b8d,
      skirt: 0x4c6ef5,
      hairBase: 0x2b2d5c,
      hairLeft: 0xff3b8d,
      hairRight: 0xffd43b,
      sockA: '#4c6ef5',
      sockB: '#ffd43b',
      boot: 0x23254a,
      sole: 0xffd43b,
      backpack: 0xff3b8d,
      skin: 0xffe5e0
    }
  }
];

export const UPGRADE_CONFIG = {
  energy: {
    key: 'energy',
    icon: '⚡',
    name: 'Энергетик',
    desc: 'Длительность турбо-рывка и сноса преград',
    isAddon: false,
    minLevel: 1,
    baseCost: 25,
    costGrowth: 2.1,
    baseDuration: 6.0,
    durationStep: 1.5,
    speedMultiplier: 1.38
  },
  choker: {
    key: 'choker',
    icon: '⛓',
    name: 'Чокер-щит',
    desc: 'Время щита от 1 удара + сильный магнит',
    isAddon: false,
    minLevel: 1,
    baseCost: 30,
    costGrowth: 2.1,
    baseDuration: 8.0,
    durationStep: 2.0
  },
  tamagotchi: {
    key: 'tamagotchi',
    icon: '👾',
    name: 'Тамагочи-слоумо',
    desc: 'Длительность замедления времени',
    isAddon: false,
    minLevel: 1,
    baseCost: 35,
    costGrowth: 2.1,
    baseDuration: 5.5,
    durationStep: 1.4,
    timeScale: 0.52
  },
  // --- НОВЫЕ ПОКУПНЫЕ ДОПОЛНЕНИЯ ---
  boots: {
    key: 'boots',
    icon: '🥾',
    name: 'Платформы-пружины',
    desc: 'Открывает Двойной прыжок в воздухе и усиливает его',
    isAddon: true,
    minLevel: 0,
    baseCost: 55,
    costGrowth: 1.95
  },
  magnet: {
    key: 'magnet',
    icon: '🧲',
    name: 'Магнит-цепочка',
    desc: 'Постоянно притягивает соседние медиаторы в забеге',
    isAddon: true,
    minLevel: 0,
    baseCost: 45,
    costGrowth: 1.9
  },
  multiplier: {
    key: 'multiplier',
    icon: '🎸',
    name: 'Винил-бустер',
    desc: 'Шанс получить x2 медиаторов (+20% за уровень)',
    isAddon: true,
    minLevel: 0,
    baseCost: 65,
    costGrowth: 2.0
  }
};

export const CASSETTES = [
  // ГЛАВА 1
  {
    id: 'c1_1',
    chapter: 1,
    index: 1,
    title: 'TAPE_01 // ПОМЕХИ НА ЛЕСТНИЧНОЙ',
    speaker: 'АЛИСА',
    emotion: 'shock',
    mood: 'REC ● 01:14 // ДВОР',
    text: 'Плеер ловит хрип Киры — моей лучшей подруги-диджея, которая исчезла три дня назад: «Алис, если слышишь это, не открывай дверь курьерам в серых куртках. С телебашни запустили "Серый Эфир" — весь наш район за ночь стал одинаковым. Собирай мои кассеты, в них ключ от глушилки». Из соседнего подъезда уже вылетают патрульные дроны ЖЭК-Контроля.',
    choices: [
      {
        label: '«Кира, держись! Я вытащу и тебя, и наших ребят из двора»',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Пальцы сжимают корпус плеера до хруста. Если в этих кассетах правда есть шанс разбудить город — я добегу хоть до края карты.',
        reward: 15
      },
      {
        label: '«Звучит как очередной кринж-развод, но валить из панельки надо»',
        effects: { empathy: 0, cynicism: 3, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Мне плевать на спасение мира. Просто не хочу завтра проснуться в сером пуховике и с ипотекой на лице.',
        reward: 15
      },
      {
        label: '«О, апокалипсис? Наконец-то достойный вайб для пробежки!»',
        effects: { empathy: 0, cynicism: 0, madness: 3 },
        replyEmotion: 'psycho',
        reply: 'В наушниках бьет хардстайл, сирены идеально попадают в бит. Открываю банку энердоса и срываюсь с места.',
        reward: 15
      }
    ]
  },
  {
    id: 'c1_2',
    chapter: 1,
    index: 2,
    title: 'TAPE_02 // ГРАФФИТИ НА ГАРАЖАХ',
    speaker: 'АЛИСА',
    emotion: 'neutral',
    mood: 'REC ● 01:42 // ГАРАЖИ',
    text: 'На второй кассете слышен свист баллончика. Местные райтеры из команды «404» нарисовали яркие стрелки на бетонных блоках, чтобы сбить трекеры дронов, но одного пацана в балаклаве зажали у турникетов. Кира на записи просит: «Не бросай локалку, без живых людей андер сдохнет быстрее баса».',
    choices: [
      {
        label: 'Отвлечь дронов вспышкой плеера, чтобы райтер успел уйти',
        effects: { empathy: 3, cynicism: -1, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Дрон дергается на мой розовый стробоскоп, пацан перемахивает забор и кидает мне два пальца вверх. Своих не сливаем.',
        reward: 20
      },
      {
        label: 'Проскочить мимо, пока охрана занята им — каждый сам за себя',
        effects: { empathy: -1, cynicism: 3, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Жестко? Да. Зато у меня в кармане кассета, а не пластиковые стяжки на запястьях. Улица не прощает сантиментов.',
        reward: 20
      },
      {
        label: 'Просто ускориться и не вникать — чужие разборки мне до лампочки',
        effects: { empathy: 0, cynicism: 1, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Меньше знаешь — меньше ловишь проблем. Просто бегу дальше по рельсам, уставившись в носки кед.',
        reward: 10
      }
    ]
  },
  {
    id: 'c1_3',
    chapter: 1,
    index: 3,
    title: 'TAPE_03 // СВЕТ У ПЕРЕЕЗДА',
    speaker: 'АЛИСА',
    emotion: 'smirk',
    mood: 'REC ● 02:09 // Ж/Д ПУТИ',
    text: 'Панельки остаются позади. Пленка шипит, и поверх голоса Киры пробивается странный цифровой скрежет: «Если дошла до старого переезда — прыгай в сторону заброшенного трамвайного депо. Там наши держат последний рейв. Но осторожно: Серый Эфир уже просачивается в провода и ломает картинку».',
    choices: [
      {
        label: '«Если там собрались живые, я должна предупредить всех о рейде»',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Сверяюсь с картой в старом кнопочном телефоне. До депо пара километров по шпалам — успею до облавы.',
        reward: 25
      },
      {
        label: '«Рейв посреди зачистки? Гениально. Заберу кассеты и свалю»',
        effects: { empathy: 0, cynicism: 3, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Толпа на танцполе — идеальный живой щит от камер. Возьму, что нужно, и растворюсь за углом.',
        reward: 25
      },
      {
        label: '«Провода поют на моей частоте! Выкручиваю громкость в красную зону»',
        effects: { empathy: 0, cynicism: 0, madness: 3 },
        replyEmotion: 'psycho',
        reply: 'Воздух пахнет озоном и малиновым сиропом. В глазах мелькают комиксные вспышки — реальность наконец-то стала нормальной.',
        reward: 25
      }
    ]
  },
  // ГЛАВА 2
  {
    id: 'c2_1',
    chapter: 2,
    index: 1,
    title: 'TAPE_04 // САБВУФЕР НА РЕЛЬСАХ',
    speaker: 'АЛИСА',
    emotion: 'neutral',
    mood: 'REC ● 02:33 // ДЕПО',
    text: 'В ангаре грохочет брейккор, прожекторы режут дым. Кассета приклеена скотчем к колонке. Голос Киры перекрывает басы: «Алис, генератор еле дышит, а звук — единственное, что глушит Серый Эфир в этом квартале. Пацаны с пульта спрашивают, подкинешь ли пару медиаторов на сгоревший предохранитель».',
    choices: [
      {
        label: 'Скинуть медиаторы диджеям — пусть музыка орет до рассвета',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Сабвуфер снова бьет в грудную клетку, толпа взрывается криком. Пока качает бит, городу нас не переварить.',
        reward: 20
      },
      {
        label: 'Зажать медиаторы себе — мне апгрейды важнее чужой тусовки',
        effects: { empathy: -1, cynicism: 3, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Извините, ребят, благотворительность закрыта. На моих кедах держится вся операция, так что лут остается в кармане.',
        reward: 35
      },
      {
        label: 'Закоротить пульт напрямую и разогнать BPM до 240!',
        effects: { empathy: 0, cynicism: 0, madness: 3 },
        replyEmotion: 'psycho',
        reply: 'Из колонок летят розовые искры, стекла в крыше звенят. Не знаю, спасло это кого-то или нет, но выглядит легендарно.',
        reward: 25
      }
    ]
  },
  {
    id: 'c2_2',
    chapter: 2,
    index: 2,
    title: 'TAPE_05 // КИСЛОТНЫЙ БЛЭКАУТ',
    speaker: 'АЛИСА',
    emotion: 'psycho',
    mood: 'REC ● 02:51 // ТАНЦПОЛ',
    text: 'За барной стойкой из старых шпал нахожу кассету рядом с мерцающей банкой кастомного энергетика «GLITCH_ZERO». На этикетке почерк Киры: «Не пей это, если хочешь остаться человеком. Оно ускоряет синапсы, но стирает грань между тобой и сетью». Внутри плещется искрящаяся жидкость.',
    choices: [
      {
        label: 'Выпить залпом — чем быстрее мозг, тем слаще глитч',
        effects: { empathy: 0, cynicism: 0, madness: 4 },
        replyEmotion: 'psycho',
        reply: 'Вкус батарейки и вишневой жвачки! Пульс уходит в космос, трамваи вокруг кажутся медленными кадрами.',
        reward: 30
      },
      {
        label: 'Вылить на бетон — мне нужна трезвая голова, чтобы найти Киру',
        effects: { empathy: 2, cynicism: 0, madness: -1 },
        replyEmotion: 'neutral',
        reply: 'Лужа шипит и светится фиолетовым. Кира предупредила не просто так — не собираюсь превращаться в еще один баг.',
        reward: 20
      },
      {
        label: 'Спрятать банку на черный день — вдруг пригодится для торга',
        effects: { empathy: 0, cynicism: 2, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Редкий стафф в городе стоит дороже обещаний. Пусть полежит в рюкзаке, я сама решу, когда рисковать.',
        reward: 20
      }
    ]
  },
  {
    id: 'c2_3',
    chapter: 2,
    index: 3,
    title: 'TAPE_06 // РЕЙД В ТРИ НОЧИ',
    speaker: 'АЛИСА',
    emotion: 'shock',
    mood: 'REC ● 03:12 // ВЫЕЗД ИЗ ДЕПО',
    text: 'Ворота ангара сносит бронированный электробус с мигалками. Толпа бросается врассыпную. На шестой кассете Кира кричит сквозь сирену: «Они вычислили депо по треку! Уходи через грузовую рампу в ТЦ "Галактика". Я спрятала там следующий фрагмент ключа, у нашего старого винилового ларька».',
    choices: [
      {
        label: 'Придержать аварийную дверь, пока мелкие альты выбегают из зала',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Плечо ноет от удара створкой, но десятки ребят успевают уйти. Хватаю дыхание и прыгаю на крышу вагона.',
        reward: 30
      },
      {
        label: 'Свалить первой через вентиляцию, пока боты пакуют остальных',
        effects: { empathy: 0, cynicism: 3, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Каждый знал, на что подписывался, когда шел на подпольный рейв. Моя задача — дойти до молла целой.',
        reward: 30
      },
      {
        label: 'Не оглядываться — просто переключить трек и бежать на автопилоте',
        effects: { empathy: 0, cynicism: 1, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Шум сзади быстро глохнет. Впереди мигает розовая вывеска «ГАЛАКТИКА», и это единственное, что сейчас реально.',
        reward: 15
      }
    ]
  },
  // ГЛАВА 3
  {
    id: 'c3_1',
    chapter: 3,
    index: 1,
    title: 'TAPE_07 // ФУДКОРТ-ЛИМБО',
    speaker: 'АЛИСА',
    emotion: 'shock',
    mood: 'REC ● 03:38 // МОЛЛ',
    text: 'Огромный трехэтажный ТЦ застыл в пастельном свете. Из динамиков льется замедленный vaporwave, а пластиковые манекены в витринах синхронно поворачивают головы мне вслед. Кассета Киры лежит на подносе фудкорта: «Серый Эфир копирует здесь наши привычки, превращая стиль в бездушный мерч. Не верь витринам».',
    choices: [
      {
        label: '«Кира права: стиль — это про душу и друзей, а не про алгоритмы»',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Срываю с манекена поддельный чокер и бросаю в фонтан. Мы не дадим им превратить наш андеграунд в витрину.',
        reward: 30
      },
      {
        label: '«Да ладно, половина тусовки и до эфира была клонами из тиктока»',
        effects: { empathy: 0, cynicism: 3, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Честно говоря, разницы почти не видно. Одни носят черный для вида, другие — серый по команде. Лишь бы не мешали бежать.',
        reward: 30
      },
      {
        label: '«Подмигнуть манекенам — кажется, они зовут меня на секретный этаж»',
        effects: { empathy: 0, cynicism: 0, madness: 3 },
        replyEmotion: 'psycho',
        reply: 'Один из них правда поднял руку! Или это блик на стекле? Плевать, их пластиковый шепот звучит слишком прикольно.',
        reward: 30
      }
    ]
  },
  {
    id: 'c3_2',
    chapter: 3,
    index: 2,
    title: 'TAPE_08 // ЛАРЕК ВИНИЛА И ЧОКЕРОВ',
    speaker: 'АЛИСА',
    emotion: 'neutral',
    mood: 'REC ● 03:56 // ЭТАЖ 2',
    text: 'На втором этаже светится наш старый магазинчик «VOID_SHOP». Пожилой панк-продавец сидит за прилавком с мутным взглядом — Серый Эфир уже наполовину стер его память, он машинально складывает яркие футболки в серые пакеты. Рядом крутится восьмая кассета.',
    choices: [
      {
        label: 'Надеть на него свои наушники с живой записью Киры, чтобы вернуть память',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Глаза старика вдруг проясняются. «Алиса?.. Вали в техтуннель за кинотеатром, там спуск в старое метро». Он снова в строю.',
        reward: 35
      },
      {
        label: 'Тихо забрать кассету и пару запасных медиаторов с полки, не будя его',
        effects: { empathy: -1, cynicism: 3, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Ему уже поздно помогать, а мне лишний шум ни к чему. Забираю пленку и скольжу мимо кассы.',
        reward: 45
      },
      {
        label: 'Оставить его в покое — может, в тишине эфира ему спокойнее',
        effects: { empathy: 0, cynicism: 1, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Кладу кассету в карман и отвожу взгляд. У всех свой предел усталости от этого города.',
        reward: 20
      }
    ]
  },
  {
    id: 'c3_3',
    chapter: 3,
    index: 3,
    title: 'TAPE_09 // ЗЕРКАЛЬНЫЙ ЭСКАЛАТОР',
    speaker: 'АЛИСА',
    emotion: 'psycho',
    mood: 'REC ● 04:15 // АТРИУМ',
    text: 'Я несусь вниз по стоящему эскалатору, и в зеркальных панелях мое отражение отстает на полсекунды — а потом улыбается шире, чем я. Девятая кассета искрит в плеере: «Алис, ты слышишь? Эфир начал сканировать твой ритм. Если поддашься, станешь частью сигнала. Спускайся под фундамент, на ветку Призрак!»',
    choices: [
      {
        label: '«Загрузить себя в сигнал? Звучит как идеальный апгрейд моей тушки!»',
        effects: { empathy: 0, cynicism: 0, madness: 4 },
        replyEmotion: 'psycho',
        reply: 'Прикладываю ладонь к зеркалу — по стеклу бежит розовая рябь. Отражение подмигивает мне и исчезает внизу.',
        reward: 35
      },
      {
        label: '«Разбить зеркало кедом — мне не нужны цифровые двойники»',
        effects: { empathy: 0, cynicism: 3, madness: -1 },
        replyEmotion: 'smirk',
        reply: 'Осколки разлетаются конфетти. Я из мяса, костей и злости — никакой алгоритм меня не перерисует.',
        reward: 35
      },
      {
        label: '«Держусь за голос Киры — только он не дает мне потерять себя»',
        effects: { empathy: 3, cynicism: 0, madness: -1 },
        replyEmotion: 'neutral',
        reply: 'Перематываю пару секунд назад, чтобы снова услышать ее смех. Выбиваю служебную дверь и ныряю в шахту метро.',
        reward: 35
      }
    ]
  },
  // ГЛАВА 4
  {
    id: 'c4_1',
    chapter: 4,
    index: 1,
    title: 'TAPE_10 // СТАНЦИЯ БЕЗ НАЗВАНИЯ',
    speaker: 'АЛИСА',
    emotion: 'neutral',
    mood: 'REC ● 04:33 // ГЛУБИНА -80М',
    text: 'Холодный сквозняк несет запах сырого бетона и озона. По забытой ветке без остановок носятся поезда-призраки с пустыми вагонами и светящимися окнами. На десятой кассете голоса десятков пропавших бегунов — все они оставили здесь короткие записки тем, кто пойдет следом.',
    choices: [
      {
        label: 'Записать поверх свой голос со словами поддержки для следующих',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'smirk',
        reply: '«Если ты это слушаешь — ты не один. Держи ритм, мы пробьем потолок». Пленка щелкает и становится теплее в руке.',
        reward: 40
      },
      {
        label: 'Прокрутить болтовню и выдернуть только координаты выхода к башне',
        effects: { empathy: 0, cynicism: 3, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Красивые речи не остановят встречный состав. Мне нужны голые цифры и прямой тоннель наверх.',
        reward: 40
      },
      {
        label: 'Синхронизировать шаги с гулом поездов-призраков — они шепчут чит-коды',
        effects: { empathy: 0, cynicism: 0, madness: 3 },
        replyEmotion: 'psycho',
        reply: 'Рельсы поют, шпалы складываются в эквалайзер. Кажется, я начинаю видеть маршруты поездов сквозь стены.',
        reward: 40
      }
    ]
  },
  {
    id: 'c4_2',
    chapter: 4,
    index: 2,
    title: 'TAPE_11 // ГОЛОС ИЗ ТОННЕЛЯ',
    speaker: 'АЛИСА',
    emotion: 'shock',
    mood: 'REC ● 04:49 // ТОННЕЛЬ',
    text: 'Плеер вдруг сам включает приемник. Это не запись — Кира выходит в прямой эфир, но ее голос распадается на 8-битные сэмплы: «Алис... я не успела уйти с башни. Они оцифровали мой сет, чтобы стабилизировать Серый Эфир. Если ты дойдешь до крыши — придется выбрать, что делать со мной и с городом...»',
    choices: [
      {
        label: '«Слышишь меня?! Я выдерну тебя оттуда живой, даже не думай сдаваться!»',
        effects: { empathy: 4, cynicism: 0, madness: 0 },
        replyEmotion: 'shock',
        reply: 'В наушниках короткий всхлип и теплый аккорд синтезатора. Значит, она еще там. Значит, я не зря бежала всю ночь.',
        reward: 45
      },
      {
        label: '«Кира, будь реалисткой — если тебя уже вшили в код, я просто сожгу сервер»',
        effects: { empathy: -1, cynicism: 4, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Эфир отвечает долгим холодным шипением. Больно? Да. Но я не дам алгоритму крутить нами, как марионетками.',
        reward: 45
      },
      {
        label: '«Оставайся в сети, подруга! Скоро я приду туда к тебе — станем богами глюков!»',
        effects: { empathy: 0, cynicism: 0, madness: 4 },
        replyEmotion: 'psycho',
        reply: 'Связь взрывается эхом нашего общего смеха. В груди вместо сердца стучит перегретый процессор.',
        reward: 45
      }
    ]
  },
  {
    id: 'c4_3',
    chapter: 4,
    index: 3,
    title: 'TAPE_12 // ПОСЛЕДНЯЯ ПЕРЕСАДКА',
    speaker: 'АЛИСА',
    emotion: 'neutral',
    mood: 'REC ● 05:05 // УЗЕЛ БАШНИ',
    text: 'Впереди технический подъем прямо в основание телебашни. У заблокированного вагона жмутся трое школьников в потертых кедах — они пытались догнать меня, но застряли перед барьером. Двенадцатая кассета мигает на пульте стрелочника.',
    choices: [
      {
        label: 'Взломать щиток, выпустить ребят и показать им безопасный путь назад',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Барьер гаснет, мелкие благодарят на бегу и уводят друг друга к выходу. Наверх я пойду одна — там слишком жарко.',
        reward: 50
      },
      {
        label: 'Не тратить секунды — перепрыгнуть барьер и рвануть к лифту башни',
        effects: { empathy: 0, cynicism: 3, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Они сами залезли в метро. Если я задержусь, передатчик закончит цикл — и тогда уже никто никуда не выйдет.',
        reward: 50
      },
      {
        label: 'Пожать плечами — пусть сами разбираются, у меня уже сил нет думать',
        effects: { empathy: 0, cynicism: 1, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Усталость давит на плечи свинцом. Автоматически шагаю в проем грузового ствола телебашни.',
        reward: 25
      }
    ]
  },
  // ГЛАВА 5
  {
    id: 'c5_1',
    chapter: 5,
    index: 1,
    title: 'TAPE_13 // ЛИФТ В СТРАТОСФЕРУ',
    speaker: 'АЛИСА',
    emotion: 'smirk',
    mood: 'REC ● 05:22 // ВЫСОТА 300М',
    text: 'Я бегу по внешним техническим рельсам телебашни. Под ногами — океан огней мегаполиса, над головой — розовый рассвет и шпиль, бьющий искрами в тучи. Тринадцатая кассета дрожит от статики: «До вершины пара рывков, Алис. Весь город сейчас смотрит вверх и ждет, чем все кончится».',
    choices: [
      {
        label: '«Они получат назад свои цвета и свой голос. Обещаю!»',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Ветер треплет двухцветные пряди. Внизу, в окнах панелек, вдруг вспыхивают редкие розовые гирлянды — люди еще не сдались.',
        reward: 55
      },
      {
        label: '«Город ничего не ждет. Я делаю это только ради собственной свободы»',
        effects: { empathy: 0, cynicism: 3, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Пусть живут как хотят. Я просто снесу их антенну, чтобы никто больше не лез мне в голову.',
        reward: 55
      },
      {
        label: '«Почувствовать молнию на кончиках пальцев — я уже быстрее света!»',
        effects: { empathy: 0, cynicism: 0, madness: 3 },
        replyEmotion: 'psycho',
        reply: 'Разряд бьет в соседнюю мачту, а я даже не моргаю. Граница между ветром, кодом и мной окончательно растворилась.',
        reward: 55
      }
    ]
  },
  {
    id: 'c5_2',
    chapter: 5,
    index: 2,
    title: 'TAPE_14 // ИСХОДНЫЙ КОД КИРЫ',
    speaker: 'АЛИСА',
    emotion: 'shock',
    mood: 'REC ● 05:39 // ШПИЛЬ',
    text: 'На предпоследней площадке перед антенной крутится четырнадцатая кассета. Из нее звучит чистый, неискаженный голос Киры: «Правда в том, что Серый Эфир не создала корпорация — его вырастила наша общая апатия. Кассеты — это эмоциональный резонатор. То, что ты чувствовала всю эту ночь, и станет новым сигналом города».',
    choices: [
      {
        label: 'Вложить в резонатор память обо всех, кого я встретила и спасла',
        effects: { empathy: 4, cynicism: 0, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Райтер у гаражей, диджеи из депо, старик из винилового ларька, Кира... Их голоса сливаются в один живой хор.',
        reward: 60
      },
      {
        label: 'Отключить любые общие частоты — пусть каждый живет сам по себе',
        effects: { empathy: 0, cynicism: 4, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Никакого Серого Эфира, но и никаких новых идолов. Полная тишина и честное одиночество на рассвете.',
        reward: 60
      },
      {
        label: 'Выкрутить перегрузку резонатора и слить свой разум с антенной!',
        effects: { empathy: 0, cynicism: 0, madness: 4 },
        replyEmotion: 'psycho',
        reply: 'Зачем чинить скучную реальность, если можно переписать мегаполис в бесконечный комиксный трип?',
        reward: 60
      }
    ]
  },
  {
    id: 'c5_3',
    chapter: 5,
    index: 3,
    title: 'TAPE_15 // ФИНАЛЬНАЯ ЧАСТОТА',
    speaker: 'АЛИСА',
    emotion: 'smirk',
    mood: 'REC ● 05:57 // ПЕРЕДАТЧИК',
    text: 'Последняя, пятнадцатая кассета встает в слот главного пульта на самой крыше телебашни. Небо на горизонте заливается золотом и сиренью. Перед финальным спринтом до рубильника система требует подтвердить протокол вещания.',
    choices: [
      {
        label: '[ПРОТОКОЛ: АНДЕГРАУНД] — Запустить волну свободы и вытащить Киру',
        effects: { empathy: 4, cynicism: 0, madness: 0 },
        replyEmotion: 'smirk',
        reply: 'Все пятнадцать пленок начинают вращаться синхронно. Финальный рывок — и этот город снова проснется живым!',
        reward: 80
      },
      {
        label: '[ПРОТОКОЛ: СБРОС] — Выжечь передатчик дотла и уйти в закат одной',
        effects: { empathy: 0, cynicism: 4, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Ставлю таймер детонации. Никаких сетей, никаких правил. Доберусь до края крыши — и меня больше никто не найдет.',
        reward: 80
      },
      {
        label: '[ПРОТОКОЛ: ВОЗНЕСЕНИЕ] — Раствориться в эфире вместе с сигналом',
        effects: { empathy: 0, cynicism: 0, madness: 4 },
        replyEmotion: 'psycho',
        reply: 'Снимаю ограничитель мощности. Тело больше не нужно — увидимся на всех экранах этого города!',
        reward: 80
      }
    ]
  }
];

export const ENDINGS = [
  {
    id: 'queen',
    title: 'Королева андеграунда',
    tag: 'TRUE ENDING // EMPATHY',
    emotion: 'smirk',
    summary: 'Собраны все 15 кассет и победила эмпатия. Город проснулся, а Кира вернулась.',
    description:
      'Пятнадцать кассет сложились в единый резонансный трек. Серый Эфир рассыпался розовыми искрами над рассветным мегаполисом, освободив сознание Киры и тысяч уснувших горожан. В депо снова ревут сабвуферы, на панельках цветут свежие граффити, а твое имя передают шепотом как символ живого андеграунда.'
  },
  {
    id: 'ghost',
    title: 'Цифровой призрак',
    tag: 'GLITCH ENDING // MADNESS',
    emotion: 'psycho',
    summary: 'Лидирует безумие — передоз энергетиками и глитч-выборы стерли границу с сетью.',
    description:
      'На пике скорости таурин, озон и частота телебашни слились воедино. Тело осталось на крыше, а ты шагнула прямо в оптоволокно. Теперь тебя видят в отражениях витрин, слышат в помехах старых кассетников и зовут по имени на заброшенных рейвах.'
  },
  {
    id: 'wolf',
    title: 'Одинокий волк',
    tag: 'NOIR ENDING // CYNICISM',
    emotion: 'neutral',
    summary: 'Лидирует цинизм. Передатчик уничтожен, но ты ушла из города в одиночку.',
    description:
      'Главный рубильник взорвался снопом фиолетовых искр, навсегда обрубив Серый Эфир — вместе со всеми иллюзиями о спасении общества. Не дожидаясь аплодисментов, ты спустилась по товарным путям, накинула капюшон и исчезла за границей кольцевой.'
  },
  {
    id: 'skuf',
    title: 'Скуфизация',
    tag: 'BAD ENDING // GRAY STATIC',
    emotion: 'shock',
    summary: 'Не хватило решимости или кассет — Серый Эфир победил и стер все краски.',
    description:
      'На вершине башни плеер зажевал ленту, а в твоем сердце не нашлось достаточно огня, чтобы перекричать помехи. На следующее утро ты проснулась в идеально тихой панельке, аккуратно сложила чокер в дальний ящик, надела бежевую куртку и пошла на утренний автобус.'
  }
];

function normalizeUpgradeKey(key) {
  if (key === 'shield') return 'choker';
  if (key === 'slowmo') return 'tamagotchi';
  return key;
}

function createDefaultState() {
  return {
    currency: 0,
    totalDistance: 0,
    bestDistance: 0,
    currentChapter: 1,
    unlockedChapter: 1,
    chapterDistance: 0,
    chapterDistances: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    collectedCassettes: [],
    upgrades: {
      energy: 1,
      choker: 1,
      tamagotchi: 1,
      boots: 0,
      magnet: 0,
      multiplier: 0
    },
    ownedSkins: ['classic'],
    equippedSkin: 'classic',
    karma: {
      empathy: 0,
      cynicism: 0,
      madness: 0
    },
    energyDrinksUsed: 0,
    unlockedEndings: []
  };
}

export function getPortraitSVG(emotion = 'neutral') {
  const mood = ['neutral', 'smirk', 'shock', 'psycho'].includes(emotion)
    ? emotion
    : 'neutral';

  let aura = '';
  let brows = '';
  let eyes = '';
  let mouth = '';
  let fx = '';

  if (mood === 'neutral') {
    aura = '<circle cx="110" cy="112" r="84" fill="#ffe6f2" stroke="#14101f" stroke-width="3"/>';
    brows = `
      <path d="M74 96 Q86 92 98 97" fill="none" stroke="#14101f" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M122 97 Q134 92 146 96" fill="none" stroke="#14101f" stroke-width="3.2" stroke-linecap="round"/>
    `;
    eyes = `
      <path d="M73 108 Q86 101 99 109 Q86 117 73 108 Z" fill="#ffffff"/>
      <path d="M121 109 Q134 101 147 108 Q134 117 121 109 Z" fill="#ffffff"/>
      <circle cx="87" cy="109" r="6.2" fill="#7c4dff"/>
      <circle cx="133" cy="109" r="6.2" fill="#ff3b8d"/>
      <circle cx="87" cy="110" r="3.1" fill="#14101f"/>
      <circle cx="133" cy="110" r="3.1" fill="#14101f"/>
      <circle cx="84.5" cy="106.5" r="2.2" fill="#ffffff"/>
      <circle cx="130.5" cy="106.5" r="2.2" fill="#ffffff"/>
      <path d="M68 106 Q86 98 100 107" fill="none" stroke="#14101f" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 107 Q134 98 152 106" fill="none" stroke="#14101f" stroke-width="4" stroke-linecap="round"/>
    `;
    mouth = '<path d="M101 136 Q110 139 119 135" fill="none" stroke="#421d38" stroke-width="2.6" stroke-linecap="round"/>';
  } else if (mood === 'smirk') {
    aura = '<circle cx="110" cy="112" r="84" fill="#fff3bf" stroke="#14101f" stroke-width="3"/>';
    brows = `
      <path d="M73 98 Q86 93 99 99" fill="none" stroke="#14101f" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M121 95 Q134 86 147 93" fill="none" stroke="#14101f" stroke-width="3.2" stroke-linecap="round"/>
    `;
    eyes = `
      <path d="M74 109 Q86 103 99 109 Q86 116 74 109 Z" fill="#ffffff"/>
      <path d="M121 109 Q134 103 146 109 Q134 116 121 109 Z" fill="#ffffff"/>
      <circle cx="88" cy="109" r="5.8" fill="#ff3b8d"/>
      <circle cx="134" cy="109" r="5.8" fill="#7c4dff"/>
      <circle cx="88.5" cy="109.5" r="2.9" fill="#14101f"/>
      <circle cx="134.5" cy="109.5" r="2.9" fill="#14101f"/>
      <circle cx="85" cy="106.5" r="2.2" fill="#ffffff"/>
      <circle cx="131" cy="106.5" r="2.2" fill="#ffffff"/>
      <path d="M68 105 Q86 99 100 108" fill="none" stroke="#14101f" stroke-width="4.2" stroke-linecap="round"/>
      <path d="M120 108 Q134 99 152 105" fill="none" stroke="#14101f" stroke-width="4.2" stroke-linecap="round"/>
    `;
    mouth = `
      <path d="M97 135 Q111 143 125 131" fill="none" stroke="#14101f" stroke-width="2.8" stroke-linecap="round"/>
      <polygon points="118,135 121,140 123,133" fill="#ffffff"/>
    `;
    fx = '<path d="M168 62 L171 71 L180 74 L171 77 L168 86 L165 77 L156 74 L165 71 Z" fill="#ff3b8d" stroke="#14101f" stroke-width="1.5"/>';
  } else if (mood === 'shock') {
    aura = '<circle cx="110" cy="112" r="84" fill="#d0ebff" stroke="#14101f" stroke-width="3"/>';
    brows = `
      <path d="M74 90 Q86 81 98 89" fill="none" stroke="#14101f" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M122 89 Q134 81 146 90" fill="none" stroke="#14101f" stroke-width="3.2" stroke-linecap="round"/>
    `;
    eyes = `
      <ellipse cx="86" cy="109" rx="12" ry="11" fill="#ffffff" stroke="#14101f" stroke-width="3.2"/>
      <ellipse cx="134" cy="109" rx="12" ry="11" fill="#ffffff" stroke="#14101f" stroke-width="3.2"/>
      <circle cx="86" cy="110" r="4.6" fill="#7c4dff"/>
      <circle cx="134" cy="110" r="4.6" fill="#ff3b8d"/>
      <circle cx="86" cy="110" r="2.2" fill="#14101f"/>
      <circle cx="134" cy="110" r="2.2" fill="#14101f"/>
      <circle cx="83" cy="106" r="2" fill="#ffffff"/>
      <circle cx="131" cy="106" r="2" fill="#ffffff"/>
    `;
    mouth = `
      <ellipse cx="110" cy="138" rx="7.5" ry="9" fill="#3a0d2a" stroke="#14101f" stroke-width="2.4"/>
      <ellipse cx="110" cy="142" rx="4.5" ry="3.2" fill="#ff5ca8"/>
    `;
    fx = '<path d="M158 84 Q165 96 158 103 Q151 96 158 84 Z" fill="#3bc9db" stroke="#14101f" stroke-width="2"/>';
  } else {
    aura = '<circle cx="110" cy="112" r="84" fill="#ffc9e0" stroke="#14101f" stroke-width="3"/>';
    brows = `
      <path d="M72 90 L100 101" fill="none" stroke="#14101f" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M148 90 L120 101" fill="none" stroke="#14101f" stroke-width="3.6" stroke-linecap="round"/>
    `;
    eyes = `
      <ellipse cx="86" cy="110" rx="12.5" ry="11.5" fill="#180821" stroke="#ff3b8d" stroke-width="2.6"/>
      <ellipse cx="134" cy="110" rx="12.5" ry="11.5" fill="#180821" stroke="#3bc9db" stroke-width="2.6"/>
      <circle cx="86" cy="110" r="8.2" fill="none" stroke="#ff3b8d" stroke-width="2"/>
      <circle cx="134" cy="110" r="8.2" fill="none" stroke="#ff3b8d" stroke-width="2"/>
      <circle cx="86" cy="110" r="2.4" fill="#ffffff"/>
      <circle cx="134" cy="110" r="2.4" fill="#ffffff"/>
    `;
    mouth = `
      <path d="M90 132 Q110 152 130 132 Q110 136 90 132 Z" fill="#ffffff" stroke="#14101f" stroke-width="2.5"/>
      <path d="M98 134 L98 141 M106 135 L106 143 M114 135 L114 143 M122 134 L122 141" stroke="#14101f" stroke-width="1.6"/>
    `;
    fx = '<path d="M36 68 L50 76 L42 86 L56 96" fill="none" stroke="#ff3b8d" stroke-width="3.5" stroke-linecap="round"/>';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" role="img" aria-label="Портрет Алисы (${mood})">
    ${aura}
    <circle cx="56" cy="54" r="23" fill="#1d1629" stroke="#14101f" stroke-width="3.5"/>
    <circle cx="164" cy="54" r="23" fill="#1d1629" stroke="#14101f" stroke-width="3.5"/>
    <path d="M46 84 C36 124 40 164 56 190 L110 176 L164 190 C180 164 184 124 174 84 C166 44 142 30 110 30 C78 30 54 44 46 84 Z" fill="#1d1629" stroke="#14101f" stroke-width="3.5"/>
    <path d="M51 114 C46 144 50 170 62 188 L78 180 C68 158 66 134 69 112 Z" fill="#9775fa"/>
    <path d="M169 114 C174 144 170 170 158 188 L142 180 C152 158 154 134 151 112 Z" fill="#ff3b8d"/>
    <path d="M42 220 C48 184 72 170 96 168 L124 168 C148 170 172 184 178 220 Z" fill="#282038" stroke="#14101f" stroke-width="3.5"/>
    <rect x="97" y="148" width="26" height="28" rx="8" fill="#ffe0e8" stroke="#14101f" stroke-width="2.8"/>
    <rect x="93" y="159" width="34" height="10" rx="3" fill="#14101f"/>
    <circle cx="110" cy="171" r="5.5" fill="none" stroke="#ffd43b" stroke-width="2.6"/>
    <path d="M67 88 C67 60 86 48 110 48 C134 48 153 60 153 88 C153 122 137 148 110 156 C83 148 67 122 67 88 Z" fill="#fff0f4" stroke="#14101f" stroke-width="3.5"/>
    <ellipse cx="78" cy="122" rx="9" ry="4.5" fill="#ff7eb6" opacity="0.45"/>
    <ellipse cx="142" cy="122" rx="9" ry="4.5" fill="#ff7eb6" opacity="0.45"/>
    ${brows}
    ${eyes}
    ${mouth}
    <path d="M62 88 C62 52 84 36 110 36 C136 36 158 52 158 88 L150 96 L142 74 L132 95 L122 68 L112 96 L101 69 L90 95 L79 74 L70 96 Z" fill="#1d1629" stroke="#14101f" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M124 67 L132 93 L140 73 Z" fill="#ff3b8d"/>
    <path d="M79 73 L89 93 L98 69 Z" fill="#9775fa"/>
    <path d="M72 64 L84 74 M84 64 L72 74" stroke="#ffd43b" stroke-width="3.2" stroke-linecap="round"/>
    ${fx}
  </svg>`;
}

export class StorySystem {
  constructor(storageKey = SAVE_KEY) {
    this.storageKey = storageKey;
    this.state = createDefaultState();
    this.load();
  }

  get currency() { return this.state.currency; }
  set currency(value) { this.state.currency = Math.max(0, Math.floor(Number(value) || 0)); }
  get totalDistance() { return this.state.totalDistance; }
  get bestDistance() { return this.state.bestDistance; }
  get currentChapter() { return this.state.currentChapter; }
  get unlockedChapter() { return this.state.unlockedChapter; }
  get chapterDistance() { return this.state.chapterDistances[this.state.currentChapter] || 0; }
  get collectedCassettes() { return this.state.collectedCassettes; }
  get upgrades() { return this.state.upgrades; }
  get karma() { return this.state.karma; }
  get unlockedEndings() { return this.state.unlockedEndings; }

  load() {
    const defaults = createDefaultState();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        this.state = defaults;
        return this.state;
      }
      const parsed = JSON.parse(raw);
      const mergedDistances = { ...defaults.chapterDistances, ...(parsed.chapterDistances || {}) };
      const currentChapter = Math.min(5, Math.max(1, Number(parsed.currentChapter) || 1));
      const unlockedChapter = Math.min(5, Math.max(currentChapter, Number(parsed.unlockedChapter) || 1));

      if (typeof parsed.chapterDistance === 'number' && !parsed.chapterDistances) {
        mergedDistances[currentChapter] = Math.max(0, Math.floor(parsed.chapterDistance));
      }

      const ownedSkins = Array.isArray(parsed.ownedSkins)
        ? [...new Set(['classic', ...parsed.ownedSkins.filter((id) => SKINS.some((s) => s.id === id))])]
        : ['classic'];
      const equippedSkin = ownedSkins.includes(parsed.equippedSkin) ? parsed.equippedSkin : 'classic';

      this.state = {
        currency: Math.max(0, Math.floor(Number(parsed.currency) || 0)),
        totalDistance: Math.max(0, Math.floor(Number(parsed.totalDistance) || 0)),
        bestDistance: Math.max(0, Math.floor(Number(parsed.bestDistance) || 0)),
        currentChapter,
        unlockedChapter,
        chapterDistance: mergedDistances[currentChapter] || 0,
        chapterDistances: mergedDistances,
        collectedCassettes: Array.isArray(parsed.collectedCassettes)
          ? [...new Set(parsed.collectedCassettes.filter((id) => CASSETTES.some((c) => c.id === id)))]
          : [],
        upgrades: {
          energy: Math.min(MAX_UPGRADE_LEVEL, Math.max(1, Number(parsed.upgrades?.energy) || 1)),
          choker: Math.min(MAX_UPGRADE_LEVEL, Math.max(1, Number(parsed.upgrades?.choker) || 1)),
          tamagotchi: Math.min(MAX_UPGRADE_LEVEL, Math.max(1, Number(parsed.upgrades?.tamagotchi) || 1)),
          boots: Math.min(MAX_UPGRADE_LEVEL, Math.max(0, Number(parsed.upgrades?.boots) || 0)),
          magnet: Math.min(MAX_UPGRADE_LEVEL, Math.max(0, Number(parsed.upgrades?.magnet) || 0)),
          multiplier: Math.min(MAX_UPGRADE_LEVEL, Math.max(0, Number(parsed.upgrades?.multiplier) || 0))
        },
        ownedSkins,
        equippedSkin,
        karma: {
          empathy: Number(parsed.karma?.empathy) || 0,
          cynicism: Number(parsed.karma?.cynicism) || 0,
          madness: Number(parsed.karma?.madness) || 0
        },
        energyDrinksUsed: Math.max(0, Math.floor(Number(parsed.energyDrinksUsed) || 0)),
        unlockedEndings: Array.isArray(parsed.unlockedEndings)
          ? [...new Set(parsed.unlockedEndings.filter((id) => ENDINGS.some((e) => e.id === id)))]
          : []
      };
    } catch {
      this.state = defaults;
    }
    return this.state;
  }

  save() {
    this.state.chapterDistance = this.state.chapterDistances[this.state.currentChapter] || 0;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Игнорируем ограничения приватного режима
    }
  }

  getChapterConfig(chapterId = this.state.currentChapter) {
    return CHAPTERS.find((c) => c.id === chapterId) || CHAPTERS[0];
  }

  selectChapter(chapterId) {
    const id = Number(chapterId);
    if (id < 1 || id > CHAPTERS.length || id > this.state.unlockedChapter) return false;
    this.state.currentChapter = id;
    this.state.chapterDistance = this.state.chapterDistances[id] || 0;
    this.save();
    return true;
  }

  getChapterCassettes(chapterId = this.state.currentChapter) {
    return CASSETTES.filter((c) => c.chapter === chapterId);
  }

  getCassetteById(cassetteId) {
    return CASSETTES.find((c) => c.id === cassetteId) || null;
  }

  getCollectedCassettesInChapter(chapterId = this.state.currentChapter) {
    return this.getChapterCassettes(chapterId).filter((c) =>
      this.state.collectedCassettes.includes(c.id)
    );
  }

  getNextUncollectedCassette(chapterId = this.state.currentChapter) {
    return (
      this.getChapterCassettes(chapterId).find(
        (c) => !this.state.collectedCassettes.includes(c.id)
      ) || null
    );
  }

  getNextCassetteSpawnInterval() {
    return CASSETTE_SPAWN_MIN + Math.floor(Math.random() * (CASSETTE_SPAWN_MAX - CASSETTE_SPAWN_MIN + 1));
  }

  getChapterProgress(chapterId = this.state.currentChapter) {
    const cfg = this.getChapterConfig(chapterId);
    const distance = this.state.chapterDistances[cfg.id] || 0;
    const collected = this.getCollectedCassettesInChapter(cfg.id).length;
    const total = cfg.cassetteIds.length;
    return {
      chapterId: cfg.id,
      title: cfg.title,
      subtitle: cfg.subtitle,
      distance,
      targetDistance: cfg.targetDistance,
      distanceRatio: Math.min(1, distance / cfg.targetDistance),
      cassettesCollected: collected,
      cassettesTotal: total,
      completed: distance >= cfg.targetDistance && collected >= total
    };
  }

  isChapterComplete(chapterId = this.state.currentChapter) {
    return this.getChapterProgress(chapterId).completed;
  }

  recordEnergyDrink() {
    this.state.energyDrinksUsed += 1;
    if (this.state.energyDrinksUsed % 3 === 0) {
      this.state.karma.madness += 1;
    }
    this.save();
  }

  applyCassetteChoice(cassetteId, choiceIndex) {
    const cassette = this.getCassetteById(cassetteId);
    if (!cassette) return null;
    const choice = cassette.choices[choiceIndex] || cassette.choices[0];
    const isNew = !this.state.collectedCassettes.includes(cassette.id);

    if (isNew) {
      this.state.collectedCassettes.push(cassette.id);
      const eff = choice.effects || {};
      this.state.karma.empathy += Number(eff.empathy) || 0;
      this.state.karma.cynicism += Number(eff.cynicism) || 0;
      this.state.karma.madness += Number(eff.madness) || 0;
      if (choice.reward) this.state.currency += choice.reward;
    }

    const progression = this.checkChapterProgression();
    this.save();

    return {
      cassette,
      choice,
      isNew,
      reply: choice.reply,
      replyEmotion: choice.replyEmotion || cassette.emotion,
      reward: isNew ? choice.reward || 0 : 0,
      ...progression
    };
  }

  recordRun(distanceMeters, collectedMediators = 0) {
    const dist = Math.max(0, Math.floor(Number(distanceMeters) || 0));
    const meds = Math.max(0, Math.floor(Number(collectedMediators) || 0));
    const ch = this.state.currentChapter;

    this.state.totalDistance += dist;
    if (dist > this.state.bestDistance) this.state.bestDistance = dist;
    this.state.currency += meds;
    this.state.chapterDistances[ch] = (this.state.chapterDistances[ch] || 0) + dist;
    this.state.chapterDistance = this.state.chapterDistances[ch];

    const progression = this.checkChapterProgression();
    this.save();

    return {
      distance: dist,
      mediators: meds,
      progress: this.getChapterProgress(ch),
      ...progression
    };
  }

  checkChapterProgression() {
    const ch = this.state.currentChapter;
    const progress = this.getChapterProgress(ch);
    let unlockedNextChapter = null;
    let finaleEnding = null;

    if (progress.completed) {
      if (ch < CHAPTERS.length && this.state.unlockedChapter < ch + 1) {
        this.state.unlockedChapter = ch + 1;
        this.state.currentChapter = ch + 1;
        this.state.chapterDistance = this.state.chapterDistances[ch + 1] || 0;
        unlockedNextChapter = ch + 1;
      } else if (ch === CHAPTERS.length) {
        finaleEnding = this.evaluateEnding();
      }
    }
    return { chapterCompleted: progress.completed, unlockedNextChapter, finaleEnding };
  }

  // ---- АПГРЕЙДЫ И НОВЫЕ ДОПОЛНЕНИЯ ----
  getAllUpgrades() {
    return Object.values(UPGRADE_CONFIG).map((cfg) => ({
      ...cfg,
      level: this.getUpgradeLevel(cfg.key),
      cost: this.getUpgradeCost(cfg.key),
      affordable: this.canAffordUpgrade(cfg.key)
    }));
  }

  getUpgradeLevel(rawKey) {
    const key = normalizeUpgradeKey(rawKey);
    const cfg = UPGRADE_CONFIG[key];
    if (!cfg) return 0;
    const val = this.state.upgrades[key];
    return typeof val === 'number' ? val : cfg.minLevel;
  }

  getUpgradeCost(rawKey) {
    const key = normalizeUpgradeKey(rawKey);
    const cfg = UPGRADE_CONFIG[key];
    if (!cfg) return null;
    const level = this.getUpgradeLevel(key);
    if (level >= MAX_UPGRADE_LEVEL) return null;
    const step = level - cfg.minLevel;
    return Math.round((cfg.baseCost * Math.pow(cfg.costGrowth, step)) / 5) * 5;
  }

  getUpgradeEffect(rawKey) {
    const key = normalizeUpgradeKey(rawKey);
    const cfg = UPGRADE_CONFIG[key];
    if (!cfg) return null;
    const level = this.getUpgradeLevel(key);

    if (key === 'boots') {
      return {
        key,
        level,
        hasDoubleJump: level >= 1,
        doubleJumpBoost: 13.8 + Math.max(0, level - 1) * 0.9
      };
    }
    if (key === 'magnet') {
      return {
        key,
        level,
        radius: level > 0 ? 4.5 + level * 2.4 : 0
      };
    }
    if (key === 'multiplier') {
      return {
        key,
        level,
        doubleChance: Math.min(1, level * 0.2)
      };
    }

    const duration = Number((cfg.baseDuration + (level - 1) * cfg.durationStep).toFixed(1));
    return {
      key,
      level,
      duration,
      speedMultiplier: cfg.speedMultiplier || 1,
      timeScale: cfg.timeScale || 1
    };
  }

  canAffordUpgrade(rawKey) {
    const cost = this.getUpgradeCost(rawKey);
    return cost !== null && this.state.currency >= cost;
  }

  buyUpgrade(rawKey) {
    const key = normalizeUpgradeKey(rawKey);
    const cost = this.getUpgradeCost(key);
    if (cost === null || this.state.currency < cost) {
      return { success: false, level: this.getUpgradeLevel(key), cost };
    }
    this.state.currency -= cost;
    this.state.upgrades[key] = this.getUpgradeLevel(key) + 1;
    this.save();
    return {
      success: true,
      key,
      level: this.state.upgrades[key],
      nextCost: this.getUpgradeCost(key),
      currency: this.state.currency
    };
  }

  // ---- СКИНЫ ----
  getSkins() {
    return SKINS.map((skin) => ({
      ...skin,
      owned: this.state.ownedSkins.includes(skin.id),
      equipped: this.state.equippedSkin === skin.id,
      affordable: this.state.currency >= skin.cost
    }));
  }

  getEquippedSkin() {
    return SKINS.find((s) => s.id === this.state.equippedSkin) || SKINS[0];
  }

  buyOrEquipSkin(skinId) {
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return { success: false };

    if (this.state.ownedSkins.includes(skin.id)) {
      this.state.equippedSkin = skin.id;
      this.save();
      return { success: true, action: 'equipped', skin };
    }

    if (this.state.currency < skin.cost) {
      return { success: false, action: 'insufficient' };
    }

    this.state.currency -= skin.cost;
    this.state.ownedSkins.push(skin.id);
    this.state.equippedSkin = skin.id;
    this.save();
    return { success: true, action: 'bought', skin };
  }

  evaluateEnding() {
    const { empathy, cynicism, madness } = this.state.karma;
    const allCassettesCollected = this.state.collectedCassettes.length >= CASSETTES.length;
    const maxStat = Math.max(empathy, cynicism, madness);
    let endingId = 'skuf';

    if (maxStat < 12) {
      endingId = 'skuf';
    } else if (empathy >= cynicism && empathy >= madness) {
      endingId = allCassettesCollected ? 'queen' : 'skuf';
    } else if (madness >= empathy && madness >= cynicism) {
      endingId = 'ghost';
    } else if (cynicism >= empathy && cynicism >= madness) {
      endingId = 'wolf';
    }

    if (!this.state.unlockedEndings.includes(endingId)) {
      this.state.unlockedEndings.push(endingId);
      this.save();
    }
    return ENDINGS.find((e) => e.id === endingId) || ENDINGS[3];
  }

  getEndingsGallery() {
    return ENDINGS.map((ending) => ({
      ...ending,
      unlocked: this.state.unlockedEndings.includes(ending.id)
    }));
  }
}
