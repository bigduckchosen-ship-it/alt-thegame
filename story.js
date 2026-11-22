export const SAVE_KEY = 'alt_runner_save';

export const CASSETTE_SPAWN_MIN = 1200;
export const CASSETTE_SPAWN_MAX = 1500;
export const MAX_UPGRADE_LEVEL = 5;

export const CHAPTERS = [
  {
    id: 1,
    title: 'Побег из панельки',
    subtitle: 'Сектор-07 // Бетонные дворы',
    targetDistance: 8000,
    cassetteIds: ['c1_1', 'c1_2', 'c1_3'],
    palette: {
      fog: 0x0b0714,
      accent: 0xff2a85,
      secondary: 0x9d4edd,
      grid: 0x2c1445
    }
  },
  {
    id: 2,
    title: 'Андеграунд-рейв в депо',
    subtitle: 'Трамвайный парк // Басы на рельсах',
    targetDistance: 11000,
    cassetteIds: ['c2_1', 'c2_2', 'c2_3'],
    palette: {
      fog: 0x100518,
      accent: 0xff2a85,
      secondary: 0x56cfe1,
      grid: 0x3b1259
    }
  },
  {
    id: 3,
    title: 'Неоновый ТЦ',
    subtitle: 'Молл «Галактика» // Ночной лимб',
    targetDistance: 14000,
    cassetteIds: ['c3_1', 'c3_2', 'c3_3'],
    palette: {
      fog: 0x14081c,
      accent: 0xff99c8,
      secondary: 0x9d4edd,
      grid: 0x4a196b
    }
  },
  {
    id: 4,
    title: 'Ветка метро Призрак',
    subtitle: 'Глубина -80м // Потерянная линия',
    targetDistance: 17000,
    cassetteIds: ['c4_1', 'c4_2', 'c4_3'],
    palette: {
      fog: 0x060914,
      accent: 0x56cfe1,
      secondary: 0x9d4edd,
      grid: 0x142c47
    }
  },
  {
    id: 5,
    title: 'Крыша телебашни',
    subtitle: 'Высота 540м // Источник Серого Эфира',
    targetDistance: 20000,
    cassetteIds: ['c5_1', 'c5_2', 'c5_3'],
    palette: {
      fog: 0x120512,
      accent: 0xff2a85,
      secondary: 0xe0aaff,
      grid: 0x520f42
    }
  }
];

export const UPGRADE_CONFIG = {
  energy: {
    key: 'energy',
    alias: 'energy',
    name: 'Энергетик',
    baseCost: 25,
    costGrowth: 2.15,
    baseDuration: 6.0,
    durationStep: 1.5,
    speedMultiplier: 1.38
  },
  choker: {
    key: 'choker',
    alias: 'shield',
    name: 'Чокер-щит',
    baseCost: 30,
    costGrowth: 2.15,
    baseDuration: 8.0,
    durationStep: 2.0
  },
  tamagotchi: {
    key: 'tamagotchi',
    alias: 'slowmo',
    name: 'Тамагочи-слоумо',
    baseCost: 35,
    costGrowth: 2.15,
    baseDuration: 5.5,
    durationStep: 1.4,
    timeScale: 0.52
  }
};

export const CASSETTES = [
  // ================= ГЛАВА 1: ПОБЕГ ИЗ ПАНЕЛЬКИ =================
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
        label: '«О, апокалипсис? Наконец-то достойный вайб для ночной пробежки!»',
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
    text: 'На второй кассете слышен свист баллончика. Местный райтеры из команды «404» нарисовали неоновые стрелки на бетонных блоках, чтобы сбить трекеры дронов, но одного пацана в балаклаве зажали у турникетов. Кира на записи просит: «Не бросай локалку, без живых людей андер сдохнет быстрее баса».',
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
    title: 'TAPE_03 // СИНИЙ СВЕТ У ПЕРЕЕЗДА',
    speaker: 'АЛИСА',
    emotion: 'smirk',
    mood: 'REC ● 02:09 // Ж/Д ПУТИ',
    text: 'Панельки остаются позади. Пленка шипит, и поверх голоса Киры пробивается странный цифровой скрежет: «Если дошла до старого переезда — прыгай в сторону заброшенного трамвайного депо. Там наши держат последний ночной рейв. Но осторожно: Серый Эфир уже просачивается в провода и ломает картинку».',
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
        reply: 'Толпа на танцполе — идеальный живой щит от камер. Возьму, что нужно, и растворюсь в темноте.',
        reward: 25
      },
      {
        label: '«Провода поют на моей частоте! Выкручиваю громкость в красную зону»',
        effects: { empathy: 0, cynicism: 0, madness: 3 },
        replyEmotion: 'psycho',
        reply: 'Воздух пахнет озоном и малиновым сиропом. В глазах мелькают фиолетовые пиксели — реальность наконец-то стала нормальной.',
        reward: 25
      }
    ]
  },

  // ================= ГЛАВА 2: АНДЕГРАУНД-РЕЙВ В ДЕПО =================
  {
    id: 'c2_1',
    chapter: 2,
    index: 1,
    title: 'TAPE_04 // САБВУФЕР НА РЕЛЬСАХ',
    speaker: 'АЛИСА',
    emotion: 'neutral',
    mood: 'REC ● 02:33 // ДЕПО',
    text: 'В ангаре грохочет брейккор, стробоскопы режут дым от дешевых вейпов. Кассета приклеена скотчем к колонке. Голос Киры перекрывает басы: «Алис, генератор еле дышит, а звук — единственное, что глушит Серый Эфир в этом квартале. Пацаны с пульта спрашивают, подкинешь ли пару медиаторов на сгоревший предохранитель».',
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
    text: 'За барной стойкой из старых шпал нахожу кассету рядом с мерцающей банкой кастомного энергетика «GLITCH_ZERO». На этикетке почерк Киры: «Не пей это, если хочешь остаться человеком. Оно ускоряет синапсы, но стирает грань между тобой и сетью». Внутри плещется неоновая жидкость.',
    choices: [
      {
        label: 'Выпить залпом — чем быстрее мозг, тем слаще глитч',
        effects: { empathy: 0, cynicism: 0, madness: 4 },
        replyEmotion: 'psycho',
        reply: 'Вкус батарейки и вишневой жвачки! Пульс уходит в космос, трамваи вокруг кажутся медленными полигонами.',
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
    text: 'Ворота ангара сносит бронированный электробус с мигалками. Толпа бросается врассыпную. На шестой кассете Кира кричит сквозь сирену: «Они вычислили депо по треку! Уходи через грузовую рампу в ночной ТЦ "Галактика". Я спрятала там следующий фрагмент ключа, у нашего старого винилового ларька».',
    choices: [
      {
        label: 'Придержать аварийную дверь, пока мелкие альты выбегают из зала',
        effects: { empathy: 3, cynicism: 0, madness: 0 },
        replyEmotion: 'neutral',
        reply: 'Плечо ноет от удара створкой, но десятки ребят успевают уйти в ночь. Хватаю дыхание и прыгаю на крышу вагона.',
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

  // ================= ГЛАВА 3: НЕОНОВЫЙ ТЦ =================
  {
    id: 'c3_1',
    chapter: 3,
    index: 1,
    title: 'TAPE_07 // ФУДКОРТ-ЛИМБО',
    speaker: 'АЛИСА',
    emotion: 'shock',
    mood: 'REC ● 03:38 // МОЛЛ',
    text: 'Огромный трехэтажный ТЦ застыл в пастельном неоне. Из динамиков льется замедленный vaporwave, а пластиковые манекены в витринах синхронно поворачивают головы мне вслед. Кассета Киры лежит на подносе фудкорта: «Серый Эфир копирует здесь наши привычки, превращая стиль в бездушный мерч. Не верь витринам».',
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
    text: 'На втором этаже светится наш старый магазинчик «VOID_SHOP». Пожилой панк-продавец сидит за прилавком с мутным взглядом — Серый Эфир уже наполовину стер его память, он машинально складывает черные футболки в серые пакеты. Рядом крутится восьмая кассета.',
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

  // ================= ГЛАВА 4: ВЕТКА МЕТРО ПРИЗРАК =================
  {
    id: 'c4_1',
    chapter: 4,
    index: 1,
    title: 'TAPE_10 // СТАНЦИЯ БЕЗ НАЗВАНИЯ',
    speaker: 'АЛИСА',
    emotion: 'neutral',
    mood: 'REC ● 04:33 // ГЛУБИНА -80М',
    text: 'Холодный сквозняк несет запах сырого бетона и озона. По забытой ветке без остановок носятся поезда-призраки с пустыми вагонами и фиолетовыми экранами вместо окон. На десятой кассете голоса десятков пропавших бегунов — все они оставили здесь короткие записки тем, кто пойдет следом.',
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
    text: 'Впереди технический подъем прямо в основание телебашни. У заблокированного вагона жмутся трое школьников в потертых кедах — они пытались догнать меня, но застряли перед лазерным барьером. Двенадцатая кассета мигает на пульте стрелочника.',
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

  // ================= ГЛАВА 5: КРЫША ТЕЛЕБАШНИ =================
  {
    id: 'c5_1',
    chapter: 5,
    index: 1,
    title: 'TAPE_13 // ЛИФТ В СТРАТОСФЕРУ',
    speaker: 'АЛИСА',
    emotion: 'smirk',
    mood: 'REC ● 05:22 // ВЫСОТА 300М',
    text: 'Я бегу по внешним техническим рельсам телебашни. Под ногами — океан кислотных огней ночного мегаполиса, над головой — шпиль, бьющий фиолетовыми молниями в тучи. Тринадцатая кассета дрожит от статики: «До вершины пара рывков, Алис. Весь город сейчас смотрит в черное небо и ждет, чем все кончится».',
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
        reply: 'Зачем чинить скучную реальность, если можно переписать мегаполис в бесконечный неоновый трип?',
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
    text: 'Последняя, пятнадцатая кассета встает в слот главного пульта на самой крыше телебашни. Небо на горизонте начинает светлеть. Перед финальным спринтом до рубильника система требует подтвердить протокол вещания.',
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
        label: '[ПРОТОКОЛ: ВОЗНЕСЕНИЕ] — Раствориться в неоне вместе с сигналом',
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
      'Пятнадцать кассет сложились в единый резонансный трек. Серый Эфир рассыпался розовыми искрами над рассветным мегаполисом, освободив сознание Киры и тысяч уснувших горожан. В депо снова ревут сабвуферы, на панельках цветут свежие граффити, а твое имя передают шепотом как символ живого ночного андеграунда.'
  },
  {
    id: 'ghost',
    title: 'Цифровой призрак',
    tag: 'GLITCH ENDING // MADNESS',
    emotion: 'psycho',
    summary: 'Лидирует безумие — передоз энергетиками и глитч-выборы стерли границу с сетью.',
    description:
      'На пике скорости таурин, озон и частота телебашни слились воедино. Тело осталось на крыше, а ты шагнула прямо в оптоволокно. Теперь тебя видят в отражениях ночных витрин, слышат в помехах старых кассетников и зовут по имени на заброшенных рейвах. Ты стала бессмертной легендой кибер-эфира.'
  },
  {
    id: 'wolf',
    title: 'Одинокий волк',
    tag: 'NOIR ENDING // CYNICISM',
    emotion: 'neutral',
    summary: 'Лидирует цинизм. Передатчик уничтожен, но ты ушла из города в одиночку.',
    description:
      'Главный рубильник взорвался снопом фиолетовых искр, навсегда обрубив Серый Эфир — вместе со всеми иллюзиями о спасении общества. Не дожидаясь аплодисментов и благодарностей, ты спустилась по товарным путям, накинула капюшон и исчезла за границей кольцевой. Свобода стоит дорого, но ты заплатила за нее сама.'
  },
  {
    id: 'skuf',
    title: 'Скуфизация',
    tag: 'BAD ENDING // GRAY STATIC',
    emotion: 'shock',
    summary: 'Не хватило решимости или кассет — Серый Эфир победил и стер все краски.',
    description:
      'На вершине башни плеер зажевал ленту, а в твоем сердце не нашлось достаточно огня, чтобы перекричать помехи. На следующее утро ты проснулась в идеально тихой панельке, аккуратно сложила чокер в дальний ящик, надела бежевую куртку и пошла на утренний автобус. Неоновый город остался лишь смутным сном из юности.'
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
      tamagotchi: 1
    },
    karma: {
      empathy: 0,
      cynicism: 0,
      madness: 0
    },
    energyDrinksUsed: 0,
    unlockedEndings: []
  };
}

/**
 * Генерирует компактную SVG-строку стилизованного аниме/комикс портрета Альтушки.
 * @param {'neutral'|'smirk'|'shock'|'psycho'} emotion
 * @returns {string}
 */
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
    aura = '<circle cx="110" cy="112" r="84" fill="none" stroke="#9d4edd" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.55"/>';
    brows = `
      <path d="M74 96 Q86 92 98 97" fill="none" stroke="#120c18" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M122 97 Q134 92 146 96" fill="none" stroke="#120c18" stroke-width="3.2" stroke-linecap="round"/>
    `;
    eyes = `
      <path d="M73 108 Q86 101 99 109 Q86 117 73 108 Z" fill="#fff7fc"/>
      <path d="M121 109 Q134 101 147 108 Q134 117 121 109 Z" fill="#fff7fc"/>
      <circle cx="87" cy="109" r="6.2" fill="#9d4edd"/>
      <circle cx="133" cy="109" r="6.2" fill="#ff2a85"/>
      <circle cx="87" cy="110" r="3.1" fill="#09090b"/>
      <circle cx="133" cy="110" r="3.1" fill="#09090b"/>
      <circle cx="84.5" cy="106.5" r="2" fill="#ffffff"/>
      <circle cx="130.5" cy="106.5" r="2" fill="#ffffff"/>
      <path d="M68 106 Q86 98 100 107" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 107 Q134 98 152 106" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/>
      <path d="M68 106 L62 103 M152 106 L158 103" stroke="#09090b" stroke-width="2.6" stroke-linecap="round"/>
    `;
    mouth = '<path d="M101 136 Q110 138 119 135" fill="none" stroke="#421d38" stroke-width="2.6" stroke-linecap="round"/>';
  } else if (mood === 'smirk') {
    aura = '<circle cx="110" cy="112" r="86" fill="none" stroke="#ff2a85" stroke-width="2" stroke-dasharray="10 4" opacity="0.7"/>';
    brows = `
      <path d="M73 98 Q86 93 99 99" fill="none" stroke="#120c18" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M121 95 Q134 86 147 93" fill="none" stroke="#120c18" stroke-width="3.2" stroke-linecap="round"/>
    `;
    eyes = `
      <path d="M74 109 Q86 103 99 109 Q86 116 74 109 Z" fill="#fff7fc"/>
      <path d="M121 109 Q134 103 146 109 Q134 116 121 109 Z" fill="#fff7fc"/>
      <circle cx="88" cy="109" r="5.8" fill="#ff2a85"/>
      <circle cx="134" cy="109" r="5.8" fill="#9d4edd"/>
      <circle cx="88.5" cy="109.5" r="2.9" fill="#09090b"/>
      <circle cx="134.5" cy="109.5" r="2.9" fill="#09090b"/>
      <circle cx="85" cy="106.5" r="2.1" fill="#ffffff"/>
      <circle cx="131" cy="106.5" r="2.1" fill="#ffffff"/>
      <path d="M68 105 Q86 99 100 108" fill="none" stroke="#09090b" stroke-width="4.2" stroke-linecap="round"/>
      <path d="M120 108 Q134 99 152 105" fill="none" stroke="#09090b" stroke-width="4.2" stroke-linecap="round"/>
    `;
    mouth = `
      <path d="M97 135 Q111 143 125 131" fill="none" stroke="#36132d" stroke-width="2.8" stroke-linecap="round"/>
      <polygon points="118,135 121,140 123,133" fill="#ffffff"/>
    `;
    fx = `
      <path d="M168 62 L171 71 L180 74 L171 77 L168 86 L165 77 L156 74 L165 71 Z" fill="#ff99c8"/>
      <path d="M48 76 L50 81 L55 83 L50 85 L48 90 L46 85 L41 83 L46 81 Z" fill="#e0aaff"/>
    `;
  } else if (mood === 'shock') {
    aura = '<circle cx="110" cy="112" r="88" fill="none" stroke="#56cfe1" stroke-width="2" stroke-dasharray="4 5" opacity="0.75"/>';
    brows = `
      <path d="M74 90 Q86 81 98 89" fill="none" stroke="#120c18" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M122 89 Q134 81 146 90" fill="none" stroke="#120c18" stroke-width="3.2" stroke-linecap="round"/>
    `;
    eyes = `
      <ellipse cx="86" cy="109" rx="12" ry="11" fill="#ffffff" stroke="#09090b" stroke-width="3.2"/>
      <ellipse cx="134" cy="109" rx="12" ry="11" fill="#ffffff" stroke="#09090b" stroke-width="3.2"/>
      <circle cx="86" cy="110" r="4.6" fill="#9d4edd"/>
      <circle cx="134" cy="110" r="4.6" fill="#ff2a85"/>
      <circle cx="86" cy="110" r="2.2" fill="#09090b"/>
      <circle cx="134" cy="110" r="2.2" fill="#09090b"/>
      <circle cx="83" cy="106" r="2" fill="#ffffff"/>
      <circle cx="131" cy="106" r="2" fill="#ffffff"/>
    `;
    mouth = `
      <ellipse cx="110" cy="138" rx="7.5" ry="9" fill="#3a0d2a" stroke="#09090b" stroke-width="2.4"/>
      <ellipse cx="110" cy="142" rx="4.5" ry="3.2" fill="#ff5ca8"/>
    `;
    fx = `
      <path d="M158 84 Q165 96 158 103 Q151 96 158 84 Z" fill="#56cfe1" stroke="#09090b" stroke-width="1.5"/>
      <path d="M40 54 L56 64 M180 54 L164 64 M34 94 L50 96 M186 94 L170 96" stroke="#ff99c8" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else {
    // psycho
    aura = `
      <circle cx="110" cy="112" r="88" fill="none" stroke="#ff2a85" stroke-width="2.5" opacity="0.85"/>
      <polygon points="110,16 122,36 146,28 144,52 170,56 154,76 176,94 156,110 172,130 148,136 152,162 128,154 110,174 92,154 68,162 72,136 48,130 64,110 44,94 66,76 50,56 76,52 74,28 98,36" fill="none" stroke="#ff2a85" stroke-width="1.4" opacity="0.45"/>
    `;
    brows = `
      <path d="M72 90 L100 101" fill="none" stroke="#09090b" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M148 90 L120 101" fill="none" stroke="#09090b" stroke-width="3.6" stroke-linecap="round"/>
    `;
    eyes = `
      <ellipse cx="86" cy="110" rx="12.5" ry="11.5" fill="#180821" stroke="#ff2a85" stroke-width="2.6"/>
      <ellipse cx="134" cy="110" rx="12.5" ry="11.5" fill="#180821" stroke="#56cfe1" stroke-width="2.6"/>
      <circle cx="86" cy="110" r="8.2" fill="none" stroke="#ff2a85" stroke-width="2"/>
      <circle cx="134" cy="110" r="8.2" fill="none" stroke="#ff2a85" stroke-width="2"/>
      <circle cx="86" cy="110" r="4.4" fill="none" stroke="#e0aaff" stroke-width="1.8"/>
      <circle cx="134" cy="110" r="4.4" fill="none" stroke="#e0aaff" stroke-width="1.8"/>
      <circle cx="86" cy="110" r="2" fill="#ffffff"/>
      <circle cx="134" cy="110" r="2" fill="#ffffff"/>
      <path d="M74 123 Q86 127 97 122 M123 122 Q134 127 146 123" fill="none" stroke="#9d4edd" stroke-width="2" opacity="0.8"/>
    `;
    mouth = `
      <path d="M90 132 Q110 152 130 132 Q110 136 90 132 Z" fill="#ffffff" stroke="#09090b" stroke-width="2.5"/>
      <path d="M98 134 L98 141 M106 135 L106 143 M114 135 L114 143 M122 134 L122 141" stroke="#09090b" stroke-width="1.6"/>
    `;
    fx = `
      <path d="M36 68 L50 76 L42 86 L56 96" fill="none" stroke="#ff2a85" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M184 68 L170 76 L178 86 L164 96" fill="none" stroke="#56cfe1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="44" y="138" width="22" height="3" fill="#ff2a85" opacity="0.8"/>
      <rect x="156" y="128" width="26" height="3" fill="#56cfe1" opacity="0.8"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" role="img" aria-label="Портрет Алисы (${mood})">
    <defs>
      <radialGradient id="altGlow_${mood}" cx="50%" cy="48%" r="50%">
        <stop offset="0%" stop-color="#ff2a85" stop-opacity="0.34"/>
        <stop offset="65%" stop-color="#9d4edd" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="altHoodie_${mood}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1c1427"/>
        <stop offset="100%" stop-color="#0b0910"/>
      </linearGradient>
    </defs>

    <circle cx="110" cy="112" r="96" fill="url(#altGlow_${mood})"/>
    ${aura}

    <!-- Задний слой двухцветных волос + пучки -->
    <circle cx="56" cy="54" r="23" fill="#14101c" stroke="#09090b" stroke-width="3"/>
    <circle cx="164" cy="54" r="23" fill="#14101c" stroke="#09090b" stroke-width="3"/>
    <path d="M46 46 Q56 36 68 48" fill="none" stroke="#9d4edd" stroke-width="4" stroke-linecap="round"/>
    <path d="M152 48 Q164 36 174 46" fill="none" stroke="#ff2a85" stroke-width="4" stroke-linecap="round"/>

    <path d="M46 84 C36 124 40 164 56 190 L92 178 L110 176 L128 178 L164 190 C180 164 184 124 174 84 C166 44 142 30 110 30 C78 30 54 44 46 84 Z" fill="#14101c" stroke="#09090b" stroke-width="3"/>
    <!-- Неоновые пряди -->
    <path d="M51 114 C46 144 50 170 62 188 L78 180 C68 158 66 134 69 112 Z" fill="#9d4edd"/>
    <path d="M169 114 C174 144 170 170 158 188 L142 180 C152 158 154 134 151 112 Z" fill="#ff2a85"/>

    <!-- Плечи и худи -->
    <path d="M42 220 C48 184 72 170 96 168 L124 168 C148 170 172 184 178 220 Z" fill="url(#altHoodie_${mood})" stroke="#09090b" stroke-width="3"/>
    <path d="M84 171 L110 198 L136 171" fill="none" stroke="#ff2a85" stroke-width="2.5" opacity="0.85"/>
    <path d="M98 186 L98 220 M122 186 L122 220" stroke="#e0aaff" stroke-width="2" stroke-dasharray="4 3" opacity="0.55"/>

    <!-- Шея и чокер с шипами + кольцом -->
    <rect x="97" y="148" width="26" height="28" rx="8" fill="#ebd6e4" stroke="#09090b" stroke-width="2.5"/>
    <path d="M97 154 Q110 163 123 154 L123 162 Q110 170 97 162 Z" fill="#d5b6cc"/>
    <rect x="93" y="159" width="34" height="10" rx="3" fill="#0d0a12" stroke="#ff2a85" stroke-width="1.4"/>
    <polygon points="97,159 100,153 103,159" fill="#e0aaff"/>
    <polygon points="117,159 120,153 123,159" fill="#e0aaff"/>
    <circle cx="110" cy="171" r="5.5" fill="none" stroke="#e0aaff" stroke-width="2.4"/>

    <!-- Лицо -->
    <path d="M67 88 C67 60 86 48 110 48 C134 48 153 60 153 88 C153 122 137 148 110 156 C83 148 67 122 67 88 Z" fill="#f7e7f2" stroke="#09090b" stroke-width="3"/>
    <!-- Легкий румянец -->
    <ellipse cx="78" cy="122" rx="9" ry="4.2" fill="#ff5ca8" opacity="0.28"/>
    <ellipse cx="142" cy="122" rx="9" ry="4.2" fill="#ff5ca8" opacity="0.28"/>
    <!-- Нос -->
    <path d="M109 119 L111 124 L108 125" fill="none" stroke="#b995b0" stroke-width="1.9" stroke-linecap="round"/>

    ${brows}
    ${eyes}
    ${mouth}

    <!-- Рваная челка + неоновые заколки -->
    <path d="M62 88 C62 52 84 36 110 36 C136 36 158 52 158 88 L150 96 L142 74 L132 95 L122 68 L112 96 L101 69 L90 95 L79 74 L70 96 Z" fill="#14101c" stroke="#09090b" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M124 67 L132 93 L140 73 Z" fill="#ff2a85" opacity="0.9"/>
    <path d="M79 73 L89 93 L98 69 Z" fill="#9d4edd" opacity="0.85"/>
    <!-- Заколка крест-накрест -->
    <path d="M72 64 L84 74 M84 64 L72 74" stroke="#ff99c8" stroke-width="3" stroke-linecap="round"/>
    <path d="M140 62 L150 70" stroke="#56cfe1" stroke-width="3" stroke-linecap="round"/>

    ${fx}
  </svg>`;
}

export class StorySystem {
  constructor(storageKey = SAVE_KEY) {
    this.storageKey = storageKey;
    this.state = createDefaultState();
    this.load();
  }

  get currency() {
    return this.state.currency;
  }

  set currency(value) {
    this.state.currency = Math.max(0, Math.floor(Number(value) || 0));
  }

  get totalDistance() {
    return this.state.totalDistance;
  }

  get bestDistance() {
    return this.state.bestDistance;
  }

  get currentChapter() {
    return this.state.currentChapter;
  }

  get unlockedChapter() {
    return this.state.unlockedChapter;
  }

  get chapterDistance() {
    return this.state.chapterDistances[this.state.currentChapter] || 0;
  }

  get collectedCassettes() {
    return this.state.collectedCassettes;
  }

  get upgrades() {
    return this.state.upgrades;
  }

  get karma() {
    return this.state.karma;
  }

  get unlockedEndings() {
    return this.state.unlockedEndings;
  }

  load() {
    const defaults = createDefaultState();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        this.state = defaults;
        return this.state;
      }
      const parsed = JSON.parse(raw);
      const mergedDistances = {
        ...defaults.chapterDistances,
        ...(parsed.chapterDistances || {})
      };
      const currentChapter = Math.min(5, Math.max(1, Number(parsed.currentChapter) || 1));
      const unlockedChapter = Math.min(
        5,
        Math.max(currentChapter, Number(parsed.unlockedChapter) || 1)
      );

      if (typeof parsed.chapterDistance === 'number' && !parsed.chapterDistances) {
        mergedDistances[currentChapter] = Math.max(0, Math.floor(parsed.chapterDistance));
      }

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
          tamagotchi: Math.min(
            MAX_UPGRADE_LEVEL,
            Math.max(1, Number(parsed.upgrades?.tamagotchi) || 1)
          )
        },
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
      // Игнорируем переполнение или приватный режим хранилища
    }
  }

  resetSave() {
    this.state = createDefaultState();
    this.save();
    return this.state;
  }

  getChapterConfig(chapterId = this.state.currentChapter) {
    return CHAPTERS.find((c) => c.id === chapterId) || CHAPTERS[0];
  }

  selectChapter(chapterId) {
    const id = Number(chapterId);
    if (id < 1 || id > CHAPTERS.length || id > this.state.unlockedChapter) {
      return false;
    }
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

  isCassetteCollected(cassetteId) {
    return this.state.collectedCassettes.includes(cassetteId);
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
    return (
      CASSETTE_SPAWN_MIN +
      Math.floor(Math.random() * (CASSETTE_SPAWN_MAX - CASSETTE_SPAWN_MIN + 1))
    );
  }

  getChapterProgress(chapterId = this.state.currentChapter) {
    const cfg = this.getChapterConfig(chapterId);
    const distance = this.state.chapterDistances[cfg.id] || 0;
    const collected = this.getCollectedCassettesInChapter(cfg.id).length;
    const total = cfg.cassetteIds.length;
    const distanceRatio = Math.min(1, distance / cfg.targetDistance);
    const completed = distance >= cfg.targetDistance && collected >= total;

    return {
      chapterId: cfg.id,
      title: cfg.title,
      subtitle: cfg.subtitle,
      distance,
      targetDistance: cfg.targetDistance,
      distanceRatio,
      cassettesCollected: collected,
      cassettesTotal: total,
      completed
    };
  }

  isChapterComplete(chapterId = this.state.currentChapter) {
    return this.getChapterProgress(chapterId).completed;
  }

  addCurrency(amount) {
    const delta = Math.floor(Number(amount) || 0);
    if (delta === 0) return this.state.currency;
    this.state.currency = Math.max(0, this.state.currency + delta);
    this.save();
    return this.state.currency;
  }

  /**
   * Регистрирует подбор энергетика в забеге.
   * Злоупотребление энергетиками сдвигает карму в сторону безумия (для ветки «Цифровой призрак»).
   */
  recordEnergyDrink() {
    this.state.energyDrinksUsed += 1;
    if (this.state.energyDrinksUsed % 3 === 0) {
      this.state.karma.madness += 1;
    }
    this.save();
  }

  /**
   * Применяет выбор игрока из визуальной новеллы и помечает кассету как собранную.
   */
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
      if (choice.reward) {
        this.state.currency += choice.reward;
      }
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

  /**
   * Фиксирует итоги забега: дистанцию, собранные медиаторы и прогресс текущей главы.
   */
  recordRun(distanceMeters, collectedMediators = 0) {
    const dist = Math.max(0, Math.floor(Number(distanceMeters) || 0));
    const meds = Math.max(0, Math.floor(Number(collectedMediators) || 0));
    const ch = this.state.currentChapter;

    this.state.totalDistance += dist;
    if (dist > this.state.bestDistance) {
      this.state.bestDistance = dist;
    }
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

    return {
      chapterCompleted: progress.completed,
      unlockedNextChapter,
      finaleEnding
    };
  }

  getUpgradeLevel(rawKey) {
    const key = normalizeUpgradeKey(rawKey);
    return this.state.upgrades[key] || 1;
  }

  getUpgradeCost(rawKey) {
    const key = normalizeUpgradeKey(rawKey);
    const cfg = UPGRADE_CONFIG[key];
    if (!cfg) return null;
    const level = this.getUpgradeLevel(key);
    if (level >= MAX_UPGRADE_LEVEL) return null;
    return Math.round((cfg.baseCost * Math.pow(cfg.costGrowth, level - 1)) / 5) * 5;
  }

  getUpgradeEffect(rawKey) {
    const key = normalizeUpgradeKey(rawKey);
    const cfg = UPGRADE_CONFIG[key];
    if (!cfg) return null;
    const level = this.getUpgradeLevel(key);
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
    this.state.upgrades[key] += 1;
    this.save();
    return {
      success: true,
      key,
      level: this.state.upgrades[key],
      nextCost: this.getUpgradeCost(key),
      currency: this.state.currency
    };
  }

  /**
   * Вычисляет и разблокирует одну из 4 концовок после прохождения 5-й главы.
   */
  evaluateEnding() {
    const { empathy, cynicism, madness } = this.state.karma;
    const allCassettesCollected = this.state.collectedCassettes.length >= CASSETTES.length;
    const maxStat = Math.max(empathy, cynicism, madness);
    const minConvictionThreshold = 12;

    let endingId = 'skuf';

    if (maxStat < minConvictionThreshold) {
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
