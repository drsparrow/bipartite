import * as React from 'react';
import Set from './set';

type BasicNode = string;
type nodeIndex = number;

export interface BLink<DataType={}> {
  source: nodeIndex;
  target: nodeIndex;
  value?: number;
  data?: DataType;
}

export interface BGraph<NodeType=BasicNode, LinkType={}> {
  sources: NodeType[];
  targets: NodeType[];
  links: BLink<LinkType>[];
}

export interface BipartiteProps<NodeType={}, LinkType={}, DataType={}> {
  graph: BGraph<NodeType, LinkType>;
  data?: DataType;
}

export interface BipartiteState {
  selectedSources: Set;
  selectedTargets: Set;
}

type Position = {x: number, y: number};

export default class Bipartite extends React.Component<BipartiteProps, BipartiteState> {
  private height = 400;
  private width = 700;
  private padding = 10;
  private x1 = this.padding;
  private x2 = this.width - this.padding;
  private strokeWidth=2;

  constructor (props: BipartiteProps) {
    super(props);
    this.state = {
      selectedSources: new Set(),
      selectedTargets: new Set()
    }
  }

  public render () {
    const {width, height} = this;
    return (
      <svg className="Bipartite" {...{width, height}}>
        {this.renderLinks()}
        {this.renderSources()}
        {this.renderTargets()}
      </svg>
    );
  }

  private sourcePosition (index: nodeIndex): Position {
    return {
      x: this.x1,
      y: this.sourceHeight(index)
    };
  }

  private targetPosition (index: nodeIndex): Position {
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
    return this.renderCircle(pos, () => this.handleSourceClick(index), this.state.selectedSources.includes(index));
  }

  private renderTargetNode(index: nodeIndex) {
    const pos = this.targetPosition(index);
    return this.renderCircle(pos, () => this.handleTargetClick(index), this.state.selectedTargets.includes(index));
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

  private renderLink (link: BLink) {
    const { x1, x2 } = this;
    const { source, target } = link;
    const y1 = this.sourceHeight(source);
    const y2 = this.targetHeight(target);
    return (
      <line
        {...{x1, x2, y1, y2}}
        strokeWidth={link.value}
        stroke="black"
      />
    );
  }

  private renderCircle(pos: Position, handleClick: () => void, isSelected: boolean) {
    return (
      <circle
        cx={pos.x}
        cy={pos.y}
        r={this.padding - 1 - this.strokeWidth}
        stroke="black"
        strokeWidth="2"
        onClick={handleClick}
        fill={isSelected ? 'gray' : 'white'}
      />
    );
  }
}
