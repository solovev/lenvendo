export default class MatchMediaListener {
  constructor({ query, callback }) {
    this.query = query;
    this.callback = callback;
  }

  init() {
    if ('matchMedia' in window) {
      this.mqListener = (e) => {
        const isMatch = (e || this.mqList).matches;
        this.callback(isMatch);
      };
      this.mqList = window.matchMedia(`(${this.query})`);
      this.mqList.addListener(this.mqListener);

      this.mqListener();
    }
  }

  dispose() {
    if (this.mqList) {
      this.mqList.removeListener(this.mqListener);
    }
  }
}
