const GAME_LEVELS = [
  // Zone 1: Лес (Простые задачи, ровные часы)
  { id: 1, type: "read", question: "Который час?", targetH: 3, targetM: 0, textTime: "3:00", hints: ["Маленькая стрелка указывает на часы.", "Смотри на красную стрелку, она указывает на 3."] },
  { id: 2, type: "set", question: "Установи на часах 2:00", targetH: 2, targetM: 0, hints: ["Поставь красную (короткую) стрелку на 2.", "А зелёную (длинную) на 12."] },
  { id: 3, type: "read", question: "Какое время показывают часы?", targetH: 12, targetM: 0, textTime: "12:00", hints: ["Обе стрелки смотрят вверх!", "И часы, и минуты на 12."] },
  { id: 4, type: "set", question: "Установи на часах 7:00", targetH: 7, targetM: 0, hints: ["Маленькая стрелка на 7.", "Большая стрелка должна быть на 12."] },
  { id: 5, type: "read", question: "Который час?", targetH: 5, targetM: 0, textTime: "5:00", hints: ["Куда указывает короткая стрелка?", "Она указывает на 5."] },
  { id: 6, type: "compare", question: "Какое время наступает раньше?", options: ["3:00", "5:00"], correctAnswer: "3:00", hints: ["Раньше — значит меньше часов.", "3 меньше, чем 5."] },
  { id: 7, type: "set", question: "Установи на часах 11:00", targetH: 11, targetM: 0, hints: ["Красная стрелка почти достигла верха.", "Укажи ею на 11, а зелёной на 12."] },
  { id: 8, type: "read", question: "Какое время на часах?", targetH: 10, targetM: 0, textTime: "10:00", hints: ["Красная стрелка - это часы, зелёная - минуты.", "Красная указывает на 10."] },
  { id: 9, type: "compare", question: "Кто пришёл позже?", options: ["Заяц в 2:00", "Волк в 4:00"], correctAnswer: "Волк в 4:00", hints: ["Позже — значит число больше.", "4 больше, чем 2."] },
  { id: 10, type: "set", question: "Установи на часах 9:00", targetH: 9, targetM: 0, hints: ["Красная стрелка смотрит ровно влево.", "Поставь её на 9."] },
  { id: 11, type: "duration", question: "Сейчас 2:00. Который час будет через 1 час?", currentH: 2, currentM: 0, offsetH: 1, offsetM: 0, targetH: 3, targetM: 0, hints: ["Просто прибавь 1 час к 2.", "2 + 1 = 3."] },
  { id: 12, type: "compare", question: "Что длится дольше?", options: ["1 час", "2 часа"], correctAnswer: "2 часа", hints: ["Дольше — значит больше времени.", "2 часа больше."] },

  // Zone 2: Город (Половины часов, сложнее)
  { id: 13, type: "read", question: "Который час?", targetH: 1, targetM: 30, textTime: "1:30", hints: ["Большая стрелка на 6 - это 30 минут (половина).", "Время между 1 и 2."] },
  { id: 14, type: "set", question: "Установи на часах 3:30", targetH: 3, targetM: 30, hints: ["Зелёная стрелка должна указывать на 6.", "Красная стрелка будет между 3 и 4, но достаточно поставить примерно."] },
  { id: 15, type: "read", question: "Какое время показывают часы?", targetH: 6, targetM: 30, textTime: "6:30", hints: ["Большая стрелка внизу на 6.", "Маленькая тоже около 6."] },
  { id: 16, type: "set", question: "Установи на часах 8:30", targetH: 8, targetM: 30, hints: ["Зелёная стрелка на 6.", "Красная на 8."] },
  { id: 17, type: "duration", question: "Сейчас 5:00. Который час будет через 2 часа?", currentH: 5, currentM: 0, offsetH: 2, offsetM: 0, targetH: 7, targetM: 0, hints: ["Прибавь 2 к 5.", "Получится 7:00."] },
  { id: 18, type: "read", question: "Который час?", targetH: 9, targetM: 30, textTime: "9:30", hints: ["Большая стрелка на 6.", "Маленькая между 9 и 10."] },
  { id: 19, type: "compare", question: "Какое время наступает позже?", options: ["8:30", "7:00"], correctAnswer: "8:30", hints: ["Сравни сначала часы.", "8 больше, чем 7."] },
  { id: 20, type: "set", question: "Установи на часах 12:30", targetH: 0, targetM: 30, hints: ["Зелёная стрелка на 6.", "Красная на 12."] },
  { id: 21, type: "read", question: "Какое время на часах?", targetH: 4, targetM: 30, textTime: "4:30", hints: ["Половина пятого.", "Маленькая между 4 и 5, большая на 6."] },
  { id: 22, type: "duration", question: "Сейчас 10:00. Который час будет через 30 минут?", currentH: 10, currentM: 0, offsetH: 0, offsetM: 30, targetH: 10, targetM: 30, hints: ["Большая стрелка пройдёт половину круга.", "Она окажется на 6."] },
  { id: 23, type: "set", question: "Установи на часах 5:30", targetH: 5, targetM: 30, hints: ["Половина шестого.", "Зелёная на 6, красная на 5."] },
  { id: 24, type: "compare", question: "Что дольше?", options: ["30 минут", "1 час"], correctAnswer: "1 час", hints: ["В 1 часе целых 60 минут.", "60 больше, чем 30."] },

  // Zone 3: Замок (Четверти часа, сложные расчеты)
  { id: 25, type: "read", question: "Который час?", targetH: 2, targetM: 15, textTime: "2:15", hints: ["Большая стрелка на 3 - это 15 минут.", "Маленькая стрелка указывает на 2."] },
  { id: 26, type: "set", question: "Установи на часах 4:15", targetH: 4, targetM: 15, hints: ["Зелёная стрелка на 3.", "Красная на 4."] },
  { id: 27, type: "duration", question: "Сейчас 8:30. Который час будет через 1 час?", currentH: 8, currentM: 30, offsetH: 1, offsetM: 0, targetH: 9, targetM: 30, hints: ["Минуты не меняются, прибавь только часы.", "8 + 1 = 9."] },
  { id: 28, type: "read", question: "Какое время показывают часы?", targetH: 7, targetM: 45, textTime: "7:45", hints: ["Большая стрелка на 9 - это 45 минут.", "Маленькая между 7 и 8."] },
  { id: 29, type: "set", question: "Установи на часах 9:45", targetH: 9, targetM: 45, hints: ["Зелёная стрелка на 9 (это 45 минут).", "Красная стрелка стоит на 9 или почти на 10."] },
  { id: 30, type: "duration", question: "Сейчас 3:30. Который час будет через 30 минут?", currentH: 3, currentM: 30, offsetH: 0, offsetM: 30, targetH: 4, targetM: 0, hints: ["Большая стрелка сделает полный круг и вернётся на 12.", "Час увеличится на 1."] },
  { id: 31, type: "compare", question: "Что короче по времени?", options: ["45 минут", "1 час"], correctAnswer: "45 минут", hints: ["1 час = 60 минут.", "45 меньше 60."] },
  { id: 32, type: "read", question: "Который час?", targetH: 10, targetM: 15, textTime: "10:15", hints: ["Четверть одиннадцатого.", "Большая стрелка на 3."] },
  { id: 33, type: "set", question: "Установи на часах 1:15", targetH: 1, targetM: 15, hints: ["Обе стрелки смотрят вправо.", "Зелёная на 3, красная на 1."] },
  { id: 34, type: "duration", question: "Сейчас 11:45. Который час будет через 15 минут?", currentH: 11, currentM: 45, offsetH: 0, offsetM: 15, targetH: 0, targetM: 0, hints: ["15 минут до полного часа.", "После 11:59 наступает 12:00."] },
  { id: 35, type: "compare", question: "Кто пришёл первым?", options: ["Кот в 12:15", "Сова в 11:45"], correctAnswer: "Сова в 11:45", hints: ["Первым — значит раньше.", "11 часов раньше, чем 12."] }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GAME_LEVELS };
}
