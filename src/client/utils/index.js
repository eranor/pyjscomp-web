import startCase from 'lodash/startCase';
import format from 'date-fns/format';
import { FixedQueue } from '@/utils/fixed_queue';

export * from './network';
export * from './models';
export * from './validation';
export * from './uuid';
export * from './fixed_queue';

export const capitalizeName = (user) => {
  return [user.firstName, user.lastName].map((it) => startCase(it)).join(' ');
};

export const parseDate = (value, falseText = 'Never') => {
  return value ? format(new Date(Date.parse(value)), 'D/M/YYYY H:m:s') : falseText;
};

export function createConsoleStore(sizeLimit = 10) {
  const originalLog = console.log;
  console.log = function() {
    let temp = localStorage.getItem('consoleText');
    let store = temp ? new FixedQueue(sizeLimit, JSON.parse(temp)) : new FixedQueue(sizeLimit);
    store.push(Array.from(arguments));
    localStorage.setItem('consoleText', JSON.stringify(store));
    originalLog.apply(console, arguments);
  };
}

export function getConsoleData() {
  return JSON.parse(localStorage.getItem('consoleText'));
}

export function clearConsoleData() {
  localStorage.removeItem('consoleText');
}
