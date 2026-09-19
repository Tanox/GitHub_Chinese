/**
 * 采集向导存储模块
 * @file public/js/wizard/store.js
 */
import { STORAGE_KEYS } from './constants.js';

export const wizardStore = {
  getRawInput() {
    return localStorage.getItem(STORAGE_KEYS.INPUT) || '';
  },

  setRawInput(value) {
    localStorage.setItem(STORAGE_KEYS.INPUT, value);
  },

  getSavedState() {
    return {
      log: localStorage.getItem(STORAGE_KEYS.LOG),
      width: localStorage.getItem(STORAGE_KEYS.PROG_WIDTH),
      percent: localStorage.getItem(STORAGE_KEYS.PROG_PERCENT),
      text: localStorage.getItem(STORAGE_KEYS.PROG_TEXT),
    };
  },

  saveProgressState(log, width, percent, text) {
    localStorage.setItem(STORAGE_KEYS.LOG, log);
    localStorage.setItem(STORAGE_KEYS.PROG_WIDTH, width);
    localStorage.setItem(STORAGE_KEYS.PROG_PERCENT, percent);
    localStorage.setItem(STORAGE_KEYS.PROG_TEXT, text);
  },

  clearProgress() {
    localStorage.removeItem(STORAGE_KEYS.LOG);
    localStorage.removeItem(STORAGE_KEYS.PROG_WIDTH);
    localStorage.removeItem(STORAGE_KEYS.PROG_PERCENT);
    localStorage.removeItem(STORAGE_KEYS.PROG_TEXT);
  },

  getLastBackupTime() {
    return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
  },

  saveBackup(input, state) {
    if (input) {
      this.setRawInput(input);
    }
    if (state && state.log) {
      this.saveProgressState(state.log, state.width, state.percent, state.text);
    }
    const now = new Date().toLocaleTimeString();
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, now);
    return now;
  },
};
