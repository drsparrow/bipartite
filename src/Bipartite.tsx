import * as React from 'react';
import Set from './set';
import BNode, {NODE_WIDTH} from './BNode';
import BLink from './BLink';

type BasicNode = string;
type nodeIndex = number;

export interface IBLink<DataType={}> {
  source: nodeIndex;
  target: nodeIndex;
  value: number;
  data?: DataType;
}

export interface IBGraph<NodeType=BasicNode, LinkType={}> {
  sources: NodeType[];
  targets: NodeType[];
  links: IBLink<LinkType>[];
}

export interface IBipartiteProps<NodeType={}, LinkType={}, DataType={}> {
  graph: IBGraph<NodeType, LinkType>;
  data?: DataType;
}

export interface IBipartiteState {
  selectedSources: Set;
  selectedTargets: Set;
  tightness: number;
}

export type NodePosition = {x: number, y: number};

export default class Bipartite extends React.Component<IBipartiteProps, IBipartiteState> {
  private height = 400;
  private width = 700;
  private x1 = 0;
  private x2 = this.width;
  private links = this.buildLinks();
  private sources = this.props.graph.sources;
  private targets = this.props.graph.targets;

  constructor (props: IBipartiteProps) {
    super(props);
    this.state = {
      selectedSources: new Set(),
      selectedTargets: new Set(),
      tightness: 0
    }
  }

  public render () {
    const {width, height} = this;
    return (
      <div className="Bipartite">
        {this.slider()}
        <span className="svg-container">
          <svg {...{width, height}} xmlns="http://www.w3.org/2000/svg">
            {this.renderLinks()}
            {this.renderSources()}
            {this.renderTargets()}
          </svg>
        </span>
      </div>
    );
  }

  private sourcePosition (index: nodeIndex): NodePosition {
    return {
      x: this.x1,
      y: this.sourceHeight(index)
    };
  }

  private targetPosition (index: nodeIndex): NodePosition {
    return {
      x: this.x2 - NODE_WIDTH,
      y: this.targetHeight(index)
    };
  }

  private sourceHeight(index: nodeIndex) {
    let height = 0;
    let sourceSpacing = this.sourceSpacing();

    for (let i = 0; i < index; i++) {
      height += this.valueOfLinks(this.linksWithSource(i));
      height += sourceSpacing;
    }

    return height;
  }

  private targetHeight(index: nodeIndex) {
    let height = 0;
    let targetSpacing = this.targetSpacing();

    for (let i = 0; i < index; i++) {
      height += this.valueOfLinks(this.linksWithTarget(i));
      height += targetSpacing;
    }

    return height;
  }

  private renderSources () {
    return (
      <g className="sources">
        {this.sources.map((n, i) => this.renderSourceNode(i))}
      </g>
    );
  }

  private renderTargets () {
    return (
      <g className="targets">
        {this.targets.map((n, i) => this.renderTargetNode(i))}
      </g>
    );
  }

  private renderSourceNode(index: nodeIndex) {
    const pos = this.sourcePosition(index);
    const height = this.sizeOfSource(index);
    const onClick = () => this.handleSourceClick(index);
    const isSelected = this.state.selectedSources.includes(index);
    return <BNode {...{height, pos, onClick, isSelected}} key={index}/>
  }

  private renderTargetNode(index: nodeIndex) {
    const pos = this.targetPosition(index);
    const height = this.sizeOfTarget(index);
    const onClick = () => this.handleTargetClick(index);
    const isSelected = this.state.selectedTargets.includes(index);
    return <BNode {...{height, pos, onClick, isSelected}} key={index}/>
  }

  private sizeOfSource(index: nodeIndex): number {
    let size = 0;
    this.links.forEach(l => {
      if (l.source === index) { size += l.value }
    });

    return size;
  }

  private sizeOfTarget(index: nodeIndex): number {
    let size = 0;
    this.links.forEach(l => {
      if (l.target === index) { size += l.value }
    });

    return size;
  }

  private handleSourceClick (index: nodeIndex) {
    this.setState(prevState => {
      const {selectedSources} = prevState;
      return {selectedSources: selectedSources.toggleAndCopy(index)}
    });
  }

  private handleTargetClick (index: nodeIndex) {
    this.setState(prevState => {
      const {selectedTargets} = prevState;
      return {selectedTargets: selectedTargets.toggleAndCopy(index)}
    });
  }

  private renderLinks () {
    return (
      <g className="links">
        {this.links.map(l => this.renderLink(l))}
      </g>
    );
  }

  private renderLink (link: IBLink) {
    const { x1, x2, state } = this;
    const { source, target, value } = link;
    const { selectedSources, selectedTargets } = state;
    const {tightness} = state;
    const y1 = this.sourceHeight(source) + this.sourceOffset(link) + link.value/2;
    const y2 = this.targetHeight(target) + this.targetOffset(link) + link.value/2;
    const isSelected = selectedSources.includes(source) || selectedTargets.includes(target)
    return <BLink {...{value, x1, x2, y1, y2, tightness, isSelected}} key={`${source}-${target}`}/>;
  }

  private sourceOffset (link: IBLink): number {
    const links = this.linksWithSource(link.source)
    return this.offsetFromLinks(link, links);
  }

  private targetOffset (link: IBLink): number {
    const links = this.linksWithTarget(link.target)
    return this.offsetFromLinks(link, links);
  }

  private linksWithSource(index: nodeIndex) {
    return this.links.filter(l => l.source === index);
  }

  private linksWithTarget(index: nodeIndex) {
    return this.links.filter(l => l.target === index);
  }

  private offsetFromLinks (link: IBLink, links: IBLink[]) {
    let offset = 0;
    links.some(l => {
      if (link === l) { return true }
      offset += l.value;
      return false;
    });

    return offset;
  }

  private slider () {
    return (
      <input
        type="range"
        min="-1"
        max="0"
        value={this.state.tightness}
        step="0.01"
        onChange={(e) => {this.setState({tightness: +e.target.value})}}
      />
    );
  }

  private totalValue (): number {
    return this.valueOfLinks(this.links);
  }

  private valueOfLinks(links: IBLink[]): number {
    return links.reduce((acc,l) => acc + l.value, 0);
  }

  private sourceSpacing (): number {
    return this.nodeSpacing(this.sources);
  }

  private targetSpacing (): number {
    return this.nodeSpacing(this.targets);
  }

  private nodeSpacing (collection: any[]): number {
    return (this.height - this.totalValue()) / (collection.length - 1);
  }

  private buildLinks (): IBLink[] {
    const { links } = this.props.graph;
    return links.sort((a, b) => {
      const diff = a.source - b.source;
      if (diff) { return diff }
      return a.target - b.target;
    });
  }
}
