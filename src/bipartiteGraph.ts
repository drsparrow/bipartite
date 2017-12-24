import { IRawBGraph } from './Bipartite';

export enum BNodeType { SOURCE, TARGET }
export const { SOURCE, TARGET } = BNodeType;

export type NodeId = string;
export type nodeIndex = number;
export type BNodeData = {
  index: nodeIndex,
  id: NodeId,
  type: BNodeType,
  links: IBLink[],
  value: number;
};

export interface IBLink {
  source: BNodeData;
  target: BNodeData;
  value: number;
  id: string;
}

export default class BipartiteGraph {

  public sources: BNodeData[];
  public targets: BNodeData[];
  public links: IBLink[];

  constructor (private raw: IRawBGraph) {
    this.buildData();
  }

  private buildData () {
    const sources = this.buildSources();
    const targets = this.buildTargets();

    const { links } = this.raw;
    const sorted = links.sort((a, b) => {
      const diff = a.source - b.source;
      if (diff) { return diff; }
      return a.target - b.target;
    });

    this.links = sorted.map((rawLink) => {
      const source = sources[rawLink.source];
      const target = targets[rawLink.target];
      const id = `${rawLink.source}-${rawLink.target}`
      const { value } = rawLink;
      const link = {value, source, target, id};

      source.links.push(link);
      source.value += link.value;
      target.links.push(link);
      target.value += link.value;

      return link;
    });

    this.sources = sources;
    this.targets = targets;
  }

  private buildSources (): BNodeData[] {
    return this.raw.sources.map((n: NodeId, i) => ({id: n, index: i, type: SOURCE, links: [], value: 0}));
  }

  private buildTargets (): BNodeData[] {
    return this.raw.targets.map((n: NodeId, i) => ({id: n, index: i, type: TARGET, links: [], value: 0}));
  }
}
