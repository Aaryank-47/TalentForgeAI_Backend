import dayjs from 'dayjs';

export const formatDate = (
    date: Date | string | number,
    format: string = 'DD MM YYYY'
): string => {
    return dayjs(date).format(format);
}

export const formatDateTime = (
    date: Date | string | number,
    format: string = 'DD MM YYYY HH:mm:ss'
): string => {
    return dayjs(date).format(format);
}

export const currentTimestamp = (): string =>{
    return dayjs().toISOString();
}

export const addDays = (
    date: Date | string | number,
    days: number
): string => {
    return dayjs(date).add(days, 'day').toISOString();
}

export const subtractDays = (
    date: Date | string | number,
    days: number
): string => {
    return dayjs(date).subtract(days, 'day').toISOString();
}

export const isPastDate = (
    date: Date | string | number
): boolean => {
    return dayjs(date).isBefore(dayjs());
}