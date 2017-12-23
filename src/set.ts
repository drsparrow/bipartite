const {parse, stringify} = JSON;

export default class Set<T> {
  protected store: {[key: string]: boolean} = {}

  static emptySet = <T>() => () => new Set<T>();

  constructor (elements: T[] = []) {
    elements.forEach(e => this.store[stringify(e)] = true);
  }

  public toggle(e: T): this {
    const key = stringify(e);
    this.store[key] ? delete this.store[key] : this.store[key] = true;
    return this;
  }

  public toggleAndCopy(e: T): Set<T> {
    const copy = new Set<T>();
    copy.store = {...this.store};
    return copy.toggle(e);
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

  private keys (): string[] {
    return Object.keys(this.store);
  }
}

export const emptySet = <T>() => { new Set<T>(); }
