'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = false;

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
var mainZone;
var signsWeekDays = {
    1: 'ПН',
    2: 'ВТ',
    3: 'СР'
};

function returnDayWeek(hourWithoutZone, diffZone, dayWithoutZone) {
    var dayWithZone = dayWithoutZone;
    var currentNumbDay;
    for (var index in signsWeekDays) {
        if (signsWeekDays[index] === dayWithoutZone) {
            currentNumbDay = Number(index);
        }
    }
    if ((Number(hourWithoutZone) + diffZone) >= 24) {
        dayWithZone = signsWeekDays[currentNumbDay + 1];
    }
    if ((Number(hourWithoutZone) + diffZone) < 0) {
        dayWithZone = signsWeekDays[currentNumbDay - 1];
    }

    return dayWithZone;
}
function returnHour(hour) {
    var ansHour = hour;
    if (Number(hour) >= 24) {
        ansHour = Number(hour) - 24;
    } else if (Number(hour) < 0) {
        ansHour = 24 + Number(hour);
    }

    return ansHour;
}
function timeToMinute(hour, minute) {

    return Number(hour) * 60 + Number(minute);
}
function parseBusyPeriod(stringPeriod) {
    var reg = /[\s,+,:]/;
    var currentData = stringPeriod.split(reg);
    var diffZone = Number(mainZone) - Number(currentData[3]);
    var hourWithoutZone = Number(currentData[1]);
    var currentHour = returnHour(hourWithoutZone + diffZone);
    var currentMinute = currentData[2];
    var dayWithoutZone = currentData[0];
    var currentDay = returnDayWeek(hourWithoutZone, diffZone, dayWithoutZone);
    if (String(currentHour).length === 1) {
        currentHour = '0' + String(currentHour);
    }
    if (String(currentMinute).length === 1) {
        currentMinute = '0' + String(currentMinute);
    }

    return {
        day: currentDay,
        hour: currentHour,
        minute: currentMinute
    };
}
function formatShortTime(time) {
    if (String(time).length === 1) {
        time = '0' + String(time);
    }

    return time;
}
function translateMinToTime(min) {
    var ansMin = min % 60;
    var tempHour = min / 60;
    var arr = String(tempHour).split('.');
    var ansHour = arr[0];

    return {
        hour: ansHour,
        min: ansMin
    };
}
function getCountMin(currentCountFreeMin, countMin, minute) {
    if (currentCountFreeMin === 0) {
        return minute;
    }

    return countMin;
}
function searchFreeMoment(daysWeek, duration) {
    var countMin;
    var startRobbery = [];
    var startAttack = '';
    Object.keys(daysWeek).forEach(function (day) {
        var currentCountFreeMin = 0;
        if (startRobbery.length !== 0) {
            startAttack = startRobbery[0];

            return startAttack;
        }
        for (var minute in daysWeek[day]) {
            if (daysWeek[day][minute] === 1) {
                countMin = getCountMin(currentCountFreeMin, countMin, minute);

                currentCountFreeMin++;
            } else {
                currentCountFreeMin = 0;
            }
            if (currentCountFreeMin === duration) {

                startRobbery.push({
                    day: day,
                    timeInMin: countMin
                });
            }
        }
    });

    return startAttack;
}

function changeSchedual(begin, end) {
    var firstFrom = begin.day + ' ' + begin.hour + ':' + begin.minute;
    firstFrom += '+' + mainZone;
    var firstTo = begin.day + ' 23:59+' + mainZone;
    var secondFrom = end.day + ' 00:00+' + mainZone;
    var secondTo = end.day + ' ' + end.hour + ':' + end.minute;
    secondTo += '+' + mainZone;

    var firstPeriod = {
        from: firstFrom,
        to: firstTo
    };
    var secondPeriod = {
        from: secondFrom,
        to: secondTo
    };

    return [firstPeriod, secondPeriod];
}
function fillingArray(schedule, daysWeek) {
    var beginBusy;
    var endBusy;
    Object.keys(schedule).forEach(function (name) {
        schedule[name].forEach(function (period) {
            beginBusy = parseBusyPeriod(period.from);
            endBusy = parseBusyPeriod(period.to);
            var beginBusyMin = timeToMinute(beginBusy.hour, beginBusy.minute);
            var endBusyMin = timeToMinute(endBusy.hour, endBusy.minute);
            for (var j = beginBusyMin; j < endBusyMin; j++) {
                if (daysWeek[beginBusy.day][j] === 1) {
                    daysWeek[beginBusy.day][j] = 0;
                }
            }
        });
    });

    return daysWeek;
}
function addNewWrites(schedule) {
    var beginBusy;
    var endBusy;
    Object.keys(schedule).forEach(function (name) {
        schedule[name].forEach(function (period) {
            beginBusy = parseBusyPeriod(period.from);
            endBusy = parseBusyPeriod(period.to);
            if (beginBusy.day !== endBusy.day) {
                var newWrites = changeSchedual(beginBusy, endBusy, name);
                schedule[name].push(newWrites[0]);
                schedule[name].push(newWrites[1]);
            }
        });
    });

    return schedule;
}
function getRobberyMoment(duration, schedule, daysWeek, bankFrom) {
    var answer;
    if (duration === 0) {
        answer = {
            day: 'ПН',
            timeInMin: bankFrom
        };
    } else {
        schedule = addNewWrites(schedule);
        daysWeek = fillingArray(schedule, daysWeek);
        answer = searchFreeMoment(daysWeek, duration);
    }

    return answer;
}
function checkUncorrect(hourFinishBank, minuteFinishBank) {
    if (hourFinishBank > 23 || minuteFinishBank > 59) {
        return true;
    }

    return false;
}
exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var dataStartBank = workingHours.from.split(/[:,+]/);
    var dataFinishBank = workingHours.to.split(/[:,+]/);
    mainZone = dataStartBank[2];
    var workingBankInMin = {
        from: timeToMinute(dataStartBank[0], dataStartBank[1]),
        to: timeToMinute(dataFinishBank[0], dataFinishBank[1])
    };

    var daysWeek = {
        'ПН': [],
        'ВТ': [],
        'СР': []
    };

    for (var i = 0; i < (workingBankInMin.to - workingBankInMin.from); i++) {
        var minuteBank = Number(workingBankInMin.from) + i;
        daysWeek['ПН'][minuteBank] = 1;
        daysWeek['ВТ'][minuteBank] = 1;
        daysWeek['СР'][minuteBank] = 1;
    }
    var answer = getRobberyMoment(duration, schedule, daysWeek, workingBankInMin.from);


    var ansFormatTime = translateMinToTime(answer.timeInMin);
    var checkUncorrectData = checkUncorrect(dataFinishBank[0], dataFinishBank[1]);

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {

            if (answer !== '' && !checkUncorrectData) {
                return true;
            }

            return false;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (answer !== '' && !checkUncorrectData) {
                var ansHour = formatShortTime(ansFormatTime.hour);
                var ansMin = formatShortTime(ansFormatTime.min);
                template = template.replace(/%HH/, ansHour);
                template = template.replace(/%MM/, ansMin);
                template = template.replace(/%DD/, answer.day);

                return template;
            }

            return '';
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            return false;
        }
    };
};
