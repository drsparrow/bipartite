const {parse, stringify} = JSON;

export default class Set<T> {
  protected store: {[key: string]: boolean} = {};

  static emptySet = <T>() => () => new Set<T>();

  constructor (elements: T[] = []) {
    elements.forEach(e => this.store[stringify(e)] = true);
  }

  public toggle(e: T): this {
    return this.includes(e) ? this.remove(e) : this.add(e);
  }

  public toggleAndCopy(e: T): Set<T> {
    return this.copy().toggle(e);
  }

  public removeAndCopy(e: T): Set<T> {
    return this.copy().remove(e);
  }

  public includes(e: T): boolean {
    return !!this.store[stringify(e)];
  }

  public isEmpty (): boolean {
    return this.size() === 0;
  }

  public size (): number {
    return this.toArray().length;
  }

  public toArray (): T[] {
    return this.keys().map(e => parse(e) as T);
  }

  public add(e: T): this {
    this.store[stringify(e)] = true;
    return this;
  }

  public remove(e: T): this {
    delete this.store[stringify(e)];
    return this;
  }

  public copy () {
    const copy = new Set<T>();
    copy.store = {...this.store};
    return copy;
  }

  private keys (): string[] {
    return Object.keys(this.store);
  }
}
