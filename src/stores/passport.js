import { defineStore } from 'pinia';
import * as PassportAPI from '../api/passport.js';

export const usePassportStore = defineStore('passport', {
  state: () => ({
    exploredCountries: [],
    loading: false,
    error: null,
    histories: {},
    historyLoading: {},
  }),
  actions: {
    async fetchExploredCountries(userId) {
      if (!userId) return;
      this.loading = true;
      this.error = null;
      try {
        const countries = await PassportAPI.getExploredCountries(userId);
        this.exploredCountries = Array.isArray(countries) ? countries : [];
      } catch (err) {
        this.error = err?.message || 'Failed to load explored countries';
        this.exploredCountries = [];
      } finally {
        this.loading = false;
      }
    },
    async fetchHistoryForCountry(userId, country) {
      if (!userId || !country) return;
      if (this.histories[country] || this.historyLoading[country]) return;

      this.historyLoading = { ...this.historyLoading, [country]: true };
      try {
        const history = await PassportAPI.getHistoryForCountry(userId, country);
        const normalized = Array.isArray(history)
          ? history.map((item) => {
              const entryNode = item.entry || item;
              const songNode = entryNode.song || item.song || {};
              return {
                songTitle: songNode.songTitle || songNode.title || 'Unknown Song',
                artist: songNode.artist || 'Unknown Artist',
                date: entryNode.date || item.date || null,
              };
            })
          : [];
        this.histories = { ...this.histories, [country]: normalized };
      } catch (err) {
        console.error(`Failed to load history for ${country}:`, err);
        this.histories = { ...this.histories, [country]: [] };
      } finally {
        const { [country]: _ignored, ...rest } = this.historyLoading;
        this.historyLoading = rest;
      }
    },
  },
});

