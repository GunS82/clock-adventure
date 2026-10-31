const GAME_LEVELS = [
  // READ TIME (O'clock)
  { id: 1, type: "read", question: "Который час?", targetH: 3, targetM: 0, textTime: "3:00", hint: "Маленькая стрелка указывает на часы." },
  { id: 2, type: "read", question: "Который час?", targetH: 8, targetM: 0, textTime: "8:00", hint: "Большая стрелка на 12 означает ровно час." },
  { id: 3, type: "read", question: "Какое время показывают часы?", targetH: 12, targetM: 0, textTime: "12:00", hint: "Обе стрелки смотрят вверх!" },
  { id: 4, type: "read", question: "Который час?", targetH: 5, targetM: 0, textTime: "5:00", hint: "Куда указывает короткая стрелка?" },
  { id: 5, type: "read", question: "Какое время на часах?", targetH: 10, targetM: 0, textTime: "10:00", hint: "Красная стрелка - это часы, зелёная - минуты." },
  
  // SET TIME (O'clock)
  { id: 6, type: "set", question: "Установи на часах 2:00", targetH: 2, targetM: 0, hint: "Поставь красную стрелку на 2, а зелёную на 12." },
  { id: 7, type: "set", question: "Установи на часах 7:00", targetH: 7, targetM: 0, hint: "Маленькая на 7, большая на 12." },
  { id: 8, type: "set", question: "Установи на часах 11:00", targetH: 11, targetM: 0, hint: "Красная стрелка почти достигла верха." },
  { id: 9, type: "set", question: "Установи на часах 4:00", targetH: 4, targetM: 0, hint: "Большая стрелка должна быть на самом верху." },
  { id: 10, type: "set", question: "Установи на часах 9:00", targetH: 9, targetM: 0, hint: "Красная стрелка смотрит ровно влево." },

  // READ TIME (Half past)
  { id: 11, type: "read", question: "Который час?", targetH: 1, targetM: 30, textTime: "1:30", hint: "Большая стрелка на 6 - это 30 минут (половина)." },
  { id: 12, type: "read", question: "Какое время показывают часы?", targetH: 6, targetM: 30, textTime: "6:30", hint: "Обе стрелки внизу!" },
  { id: 13, type: "read", question: "Который час?", targetH: 9, targetM: 30, textTime: "9:30", hint: "Красная стрелка между 9 и 10." },
  { id: 14, type: "read", question: "Какое время на часах?", targetH: 4, targetM: 30, textTime: "4:30", hint: "Половина пятого." },
  { id: 15, type: "read", question: "Который час?", targetH: 11, targetM: 30, textTime: "11:30", hint: "Скоро будет 12 часов." },

  // SET TIME (Half past)
  { id: 16, type: "set", question: "Установи на часах 3:30", targetH: 3, targetM: 30, hint: "Зелёная стрелка должна указывать на 6." },
  { id: 17, type: "set", question: "Установи на часах 8:30", targetH: 8, targetM: 30, hint: "Красная стрелка между 8 и 9." },
  { id: 18, type: "set", question: "Установи на часах 10:30", targetH: 10, targetM: 30, hint: "Зелёная стрелка смотрит вниз." },
  { id: 19, type: "set", question: "Установи на часах 12:30", targetH: 0, targetM: 30, hint: "Красная между 12 и 1, зелёная на 6." },
  { id: 20, type: "set", question: "Установи на часах 5:30", targetH: 5, targetM: 30, hint: "Половина шестого." },

  // READ TIME (Minutes in 15 increments)
  { id: 21, type: "read", question: "Который час?", targetH: 2, targetM: 15, textTime: "2:15", hint: "Большая стрелка на 3 - это 15 минут." },
  { id: 22, type: "read", question: "Какое время показывают часы?", targetH: 7, targetM: 45, textTime: "7:45", hint: "Большая стрелка на 9 - это 45 минут." },
  { id: 23, type: "read", question: "Который час?", targetH: 10, targetM: 15, textTime: "10:15", hint: "Четверть одиннадцатого." },
  
  // SET TIME (Minutes in 15 increments)
  { id: 24, type: "set", question: "Установи на часах 4:15", targetH: 4, targetM: 15, hint: "Зелёная стрелка на 3." },
  { id: 25, type: "set", question: "Установи на часах 9:45", targetH: 9, targetM: 45, hint: "Зелёная стрелка на 9. Красная почти на 10." },
  { id: 26, type: "set", question: "Установи на часах 1:15", targetH: 1, targetM: 15, hint: "Обе стрелки смотрят вправо." },

  // DURATION (Simple logic for kids: what time will it be in X hours)
  { id: 27, type: "duration", question: "Сейчас 2:00. Который час будет через 1 час?", currentH: 2, currentM: 0, offsetH: 1, offsetM: 0, targetH: 3, targetM: 0, hint: "Просто прибавь 1 час к 2." },
  { id: 28, type: "duration", question: "Сейчас 5:00. Который час будет через 2 часа?", currentH: 5, currentM: 0, offsetH: 2, offsetM: 0, targetH: 7, targetM: 0, hint: "5 + 2 = ?" },
  { id: 29, type: "duration", question: "Сейчас 8:30. Который час будет через 1 час?", currentH: 8, currentM: 30, offsetH: 1, offsetM: 0, targetH: 9, targetM: 30, hint: "Минуты не меняются, прибавь только часы." },
  
  // DURATION (Minutes)
  { id: 30, type: "duration", question: "Сейчас 10:00. Который час будет через 30 минут?", currentH: 10, currentM: 0, offsetH: 0, offsetM: 30, targetH: 10, targetM: 30, hint: "Большая стрелка пройдёт половину круга." },
  { id: 31, type: "duration", question: "Сейчас 3:30. Который час будет через 30 минут?", currentH: 3, currentM: 30, offsetH: 0, offsetM: 30, targetH: 4, targetM: 0, hint: "Большая стрелка сделает полный круг и вернётся на 12." },
  { id: 32, type: "duration", question: "Сейчас 11:45. Который час будет через 15 минут?", currentH: 11, currentM: 45, offsetH: 0, offsetM: 15, targetH: 0, targetM: 0, hint: "Следующий час - 12:00." },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GAME_LEVELS };
}
