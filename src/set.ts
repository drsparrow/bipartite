export default class Set {
  protected store: {[number: number]: boolean} = {};

  constructor (elements: number[] = []) {
    elements.forEach(e => this.store[e] = true);
  }

  public toggle(e: number): this {
    this.store[e] ? delete this.store[e] : this.store[e] = true;
    return this;
  }

  public toggleAndCopy(e: number): Set {
    const copy = new Set;
    copy.store = {...this.store};
    return copy.toggle(e);
  }

  public includes(e: number): boolean {
    return !!this.store[e];
  }
}
