import dayjs from 'dayjs';
export const formatDate = (date, format = 'DD MM YYYY') => {
    return dayjs(date).format(format);
};
export const formatDateTime = (date, format = 'DD MM YYYY HH:mm:ss') => {
    return dayjs(date).format(format);
};
export const currentTimestamp = () => {
    return dayjs().toISOString();
};
export const addDays = (date, days) => {
    return dayjs(date).add(days, 'day').toISOString();
};
export const subtractDays = (date, days) => {
    return dayjs(date).subtract(days, 'day').toISOString();
};
export const isPastDate = (date) => {
    return dayjs(date).isBefore(dayjs());
};
//# sourceMappingURL=date.helper.js.map