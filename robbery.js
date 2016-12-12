'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = true;

var WEEK_DAYS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
var WEEK_DAYS_ROBBERY = WEEK_DAYS.slice(1, 4);
var COUNT_MINUTES_LATER = 30;

function convertTime(time) {
    var parametersTime = time.split(/[+:]/).map(Number);

    return {
        hours: parametersTime[0],
        minutes: parametersTime[1],
        zone: parametersTime[2]
    };
}

function getDate(weekDayName, time) {
    // 'Mon Oct 17 2016 00:00:01 GMT+0000'
    var day = WEEK_DAYS.indexOf(weekDayName) + 16;

    return new Date(Date.UTC(2016, 9, day, time.hours - time.zone, time.minutes));
}

function convertDateTime(dateTime) {
    var parametersDateTime = dateTime.split(' ');
    var weekDayName = parametersDateTime[0];
    var time = convertTime(parametersDateTime[1]);

    return getDate(weekDayName, time);
}

function compareTime(period1, period2) {
    var timeDiff = period1.time - period2.time;
    if (timeDiff !== 0) {
        return timeDiff;
    }
    if (period1.type !== period2.type) {
        return period1.type === 'open' ? 1 : -1;
    }

    return 0;
}

function periodsRobbery(schedule, workingHours) {
    var periods = [];
    var bankWorkingTime = {
        from: convertTime(workingHours.from),
        to: convertTime(workingHours.to)
    };
    WEEK_DAYS_ROBBERY.forEach(function (weekDayName) {
        periods.push(
            { type: 'open', time: getDate(weekDayName, bankWorkingTime.from) },
            { type: 'close', time: getDate(weekDayName, bankWorkingTime.to) }
        );
    });
    Object.keys(schedule).forEach(function (name) {
        schedule[name].forEach(function (time) {
            periods.push(
                { type: 'close', time: convertDateTime(time.from) },
                { type: 'open', time: convertDateTime(time.to) }
            );
        });
    });
    periods.sort(compareTime);

    return periods;
}

function addZero(time) {
    time = String(time);
    if (time.length < 2) {
        time = '0' + time;
    }

    return time;
}

function formatView(template, startTime, zone) {
    var localDate = new Date(startTime);
    localDate.setUTCHours(localDate.getUTCHours() + zone);
    var hours = addZero(localDate.getUTCHours());
    var minutes = addZero(localDate.getUTCMinutes());
    template = template.replace(/%DD/, WEEK_DAYS[localDate.getUTCDay()]);
    template = template.replace(/%HH/, hours);
    template = template.replace(/%MM/, minutes);

    return template;
}

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var periods = periodsRobbery(schedule, workingHours);
    var bankZone = convertTime(workingHours.from).zone;
    var robberCount = Object.keys(schedule).length;
    var countMatch = robberCount;
    var possibleStart = null;
    var allPossibleStarts = [];
    var durationInMilliseconds = duration * 60 * 1000;
    periods.forEach(function (period) {
        countMatch = (period.type === 'open') ? countMatch + 1 : countMatch - 1;
        if (countMatch === robberCount + 1) {
            possibleStart = period.time;
        } else if (possibleStart !== null) {
            if ((period.time - possibleStart) >= durationInMilliseconds) {
                allPossibleStarts.push(
                    {
                        from: possibleStart,
                        to: period.time
                    }
                );
            }
            possibleStart = null;
        }
    });
    var startTime = (allPossibleStarts.length !== 0) ? allPossibleStarts[0].from : null;

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            return startTime !== null;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            return startTime !== null ? formatView(template, startTime, bankZone) : '';
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            if (allPossibleStarts.length === 0) {
                return false;
            }
            var currentTime = new Date(startTime);
            currentTime.setUTCMinutes(currentTime.getUTCMinutes() + COUNT_MINUTES_LATER);

            return allPossibleStarts.some(function (period) {
                var nextTime = period.from;
                if (currentTime > nextTime) {
                    nextTime = currentTime;
                }
                if ((period.to - nextTime) >= durationInMilliseconds) {
                    startTime = nextTime;

                    return true;
                }

                return false;
            });
        }
    };
};
