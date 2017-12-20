import * as React from 'react';
import Set from './set';
import BNode from './BNode';
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
}

export type NodePosition = {x: number, y: number};

export default class Bipartite extends React.Component<IBipartiteProps, IBipartiteState> {
  private height = 400;
  private width = 700;
  private padding = 10;
  private x1 = this.padding;
  private x2 = this.width - this.padding;

  constructor (props: IBipartiteProps) {
    super(props);
    this.state = {
      selectedSources: new Set(),
      selectedTargets: new Set()
    }
  }

  public render () {
    const {width, height} = this;
    return (
      <svg className="Bipartite" {...{width, height}} xmlns="http://www.w3.org/2000/svg">
        {this.renderLinks()}
        {this.renderSources()}
        {this.renderTargets()}
      </svg>
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
      x: this.x2,
      y: this.targetHeight(index)
    };
  }

  private sourceHeight(index: nodeIndex) {
    return this.indexToHeight(index, this.props.graph.sources.length);
  }

  private targetHeight(index: nodeIndex) {
    return this.indexToHeight(index, this.props.graph.targets.length);
  }

  private indexToHeight (index: nodeIndex, length: number) {
    const step = this.height / (length + 1);
    return step * (index + 1);
  }

  private renderSources () {
    const { sources } = this.props.graph;
    return (
      <g className="sources">
        {sources.map((n, i) => this.renderSourceNode(i))}
      </g>
    );
  }

  private renderTargets () {
    const { targets } = this.props.graph;
    return (
      <g className="targets">
        {targets.map((n, i) => this.renderTargetNode(i))}
      </g>
    );
  }

  private renderSourceNode(index: nodeIndex) {
    const pos = this.sourcePosition(index);
    const height = this.sizeOfSource(index);
    const onClick = () => this.handleSourceClick(index);
    const isSelected = this.state.selectedSources.includes(index);
    return <BNode {...{height, pos, onClick, isSelected}}/>
  }

  private renderTargetNode(index: nodeIndex) {
    const pos = this.targetPosition(index);
    const height = this.sizeOfTarget(index);
    const onClick = () => this.handleTargetClick(index);
    const isSelected = this.state.selectedTargets.includes(index);
    return <BNode {...{height, pos, onClick, isSelected}}/>
  }

  private sizeOfSource(index: nodeIndex): number {
    let size = 0;
    this.props.graph.links.forEach(l => {
      if (l.source === index) { size += l.value }
    });

    return size;
  }

  private sizeOfTarget(index: nodeIndex): number {
    let size = 0;
    this.props.graph.links.forEach(l => {
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
    const { links } = this.props.graph;
    return (
      <g className="links">
        {links.map(l => this.renderLink(l))}
      </g>
    );
  }

  private renderLink (link: IBLink) {
    const { x1, x2 } = this;
    const { source, target, value } = link;
    const y1 = this.sourceHeight(source) + this.sourceOffset(link) + link.value/2;
    const y2 = this.targetHeight(target) + this.targetOffset(link) + link.value/2;
    return <BLink {...{value, x1, x2, y1, y2}}/>;
  }

  private sourceOffset (link: IBLink): number {
    const links = this.props.graph.links.filter(l => l.source === link.source).sort((a,b) => a.target - b.target);
    return this.offsetFromLinks(link, links);
  }

  private targetOffset (link: IBLink): number {
    const links = this.props.graph.links.filter(l => l.target === link.target).sort((a,b) => a.target - b.target);
    return this.offsetFromLinks(link, links);
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
}
