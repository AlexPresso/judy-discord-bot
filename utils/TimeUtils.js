const days = [
    { name: 'Monday', value: 1 },
    { name: 'Tuesday', value: 2 },
    { name: 'Wednesday', value: 3 },
    { name: 'Thursday', value: 4 },
    { name: 'Friday', value: 5 },
    { name: 'Saturday', value: 6 },
    { name: 'Sunday', value: 0 },
];

module.exports = {
    days,
    isValidTime: (time) => {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return regex.test(time);
    },
    timeToCron: (dayOfWeek, time) => {
        const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
        if (!match)
            throw new Error("time must be in HH:MM 24-hour format");

        return `${match[2]} ${match[1]} * * ${dayOfWeek || "*"}`;
    },
    cronToTime: (cronTime) => {
        const match = /^(\d{1,2}) (\d{1,2}) \* \* (\*|\d)$/.exec(cronTime);
        if (!match)
            throw new Error("Invalid cron format");

        const minute = match[1].padStart(2, "0");
        const hour = match[2].padStart(2, "0");
        let dayOfWeek = match[3] === "*" ? null : parseInt(match[3], 10);
        dayOfWeek = dayOfWeek ?
            days.find(d => d.value === dayOfWeek).name :
            "any"

        return `${dayOfWeek} ${hour}:${minute}`;
    }
}
