import * as React from 'react';
import Set from './set';
import BNode, { NODE_WIDTH } from './BNode';
import BLink from './BLink';
import ClearButton from './ClearButton';

type BasicNode = string;
type nodeIndex = number;
type NSet = Set<number>;
type LSet = Set<IBasicBLink>;

interface IBasicBLink {
  source: nodeIndex;
  target: nodeIndex;
}

export interface IBLink<DataType = {}> extends IBasicBLink {
  value: number;
  data?: DataType;
}

export interface IBGraph<NodeType = BasicNode, LinkType = {}> {
  sources: NodeType[];
  targets: NodeType[];
  links: IBLink<LinkType>[];
}

export interface IBipartiteProps<NodeType = {}, LinkType = {}, DataType = {}> {
  graph: IBGraph<NodeType, LinkType>;
  data?: DataType;
}

export interface IBipartiteState {
  selectedSources: NSet;
  selectedTargets: NSet;
  selectedLinks: LSet;
  tightness: number;
}

export type NodePosition = {x: number, y: number};

export default class Bipartite extends React.Component<IBipartiteProps, IBipartiteState> {

  public state = {
    selectedSources: nSet(),
    selectedTargets: nSet(),
    selectedLinks: lSet(),
    tightness: 0
  };

  private height = 400;
  private width = 700;
  private x1 = 0;
  private x2 = this.width;
  private links = this.buildLinks();
  private sources = this.props.graph.sources;
  private targets = this.props.graph.targets;

  public render () {
    const {width, height} = this;
    return (
      <div className="Bipartite">
        {this.slider()}
        <br/>
        <span className="svg-container">
          <svg {...{width, height}} xmlns="http://www.w3.org/2000/svg">
            {this.renderLinks()}
            {this.renderSources()}
            {this.renderTargets()}
          </svg>
          {this.renderButtons()}
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
      height += this.sizeOfSource(i);
      height += sourceSpacing;
    }

    return height;
  }

  private targetHeight(index: nodeIndex) {
    let height = 0;
    let targetSpacing = this.targetSpacing();

    for (let i = 0; i < index; i++) {
      height += this.sizeOfTarget(i);
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
    return <BNode {...{height, pos, onClick, isSelected}} key={index}/>;
  }

  private renderTargetNode(index: nodeIndex) {
    const pos = this.targetPosition(index);
    const height = this.sizeOfTarget(index);
    const onClick = () => this.handleTargetClick(index);
    const isSelected = this.state.selectedTargets.includes(index);
    return <BNode {...{height, pos, onClick, isSelected}} key={index}/>;
  }

  private sizeOfSource(index: nodeIndex): number {
    return this.valueOfLinks(this.linksWithSource(index));
  }

  private sizeOfTarget(index: nodeIndex): number {
    return this.valueOfLinks(this.linksWithTarget(index));
  }

  private handleSourceClick (index: nodeIndex) {
    this.setState(prevState => ({
      selectedSources: prevState.selectedSources.toggleAndCopy(index)
    }));
  }

  private handleTargetClick (index: nodeIndex) {
    this.setState(prevState => ({
      selectedTargets: prevState.selectedTargets.toggleAndCopy(index)
    }));
  }

  private handleLinkClick (link: IBLink) {
    this.setState(prevState => {
      const {selectedSources, selectedTargets, selectedLinks} = prevState;
      const {source, target} = link;

      if (selectedSources.includes(source) || selectedTargets.includes(target)) {
        return {
          selectedSources: selectedSources.removeAndCopy(source),
          selectedTargets: selectedTargets.removeAndCopy(target),
          selectedLinks: selectedLinks.removeAndCopy(link),
        }
      }

      return {selectedLinks: selectedLinks.toggleAndCopy(link), selectedSources, selectedTargets};
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
    const { selectedSources, selectedTargets, selectedLinks } = state;
    const {tightness} = state;
    const y1 = this.sourceHeight(source) + this.sourceOffset(link) + link.value / 2;
    const y2 = this.targetHeight(target) + this.targetOffset(link) + link.value / 2;
    const isHighlighted = selectedSources.includes(source) || selectedTargets.includes(target) || selectedLinks.includes(link);
    const key = `${source}-${target}`;
    const onClick = () => this.handleLinkClick(link);

    return <BLink {...{value, x1, x2, y1, y2, tightness, isHighlighted, key, onClick}}/>
  }

  private sourceOffset (link: IBLink): number {
    const links = this.linksWithSource(link.source);
    return this.offsetFromLinks(link, links);
  }

  private targetOffset (link: IBLink): number {
    const links = this.linksWithTarget(link.target);
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
      if (link === l) { return true; }
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
        onChange={(e) => this.setState({tightness: +e.target.value})}
      />
    );
  }

  private totalValue (): number {
    return this.valueOfLinks(this.links);
  }

  private valueOfLinks(links: IBLink[]): number {
    return links.reduce((acc, l) => acc + l.value, 0);
  }

  private sourceSpacing (): number {
    return this.nodeSpacing(this.sources);
  }

  private targetSpacing (): number {
    return this.nodeSpacing(this.targets);
  }

  private nodeSpacing (collection: {}[]): number {
    return (this.height - this.totalValue()) / (collection.length - 1);
  }

  private buildLinks (): IBLink[] {
    const { links } = this.props.graph;
    return links.sort((a, b) => {
      const diff = a.source - b.source;
      if (diff) { return diff; }
      return a.target - b.target;
    });
  }

  private renderButtons () {
    return (
      <div>
        {this.renderSourceButton()}
        {this.renderTargetButton()}
      </div>
    );
  }

  private renderSourceButton() {
    const { selectedSources } = this.state;
    const setValue = selectedSources.toArray().reduce((acc, n) =>
      acc + this.sizeOfSource(n)
    , 0);

    return (
      <ClearButton
        setSize={this.state.selectedSources.size()}
        setValue={setValue}
        onClick={() => this.setState({selectedSources: nSet()})}
        className="float-left"
      />
    );
  }

  private renderTargetButton() {
    const { selectedTargets } = this.state;
    const setValue = selectedTargets.toArray().reduce((acc, n) =>
      acc + this.sizeOfTarget(n)
    , 0);

    return (
      <ClearButton
        setSize={selectedTargets.size()}
        setValue={setValue}
        onClick={() => this.setState({selectedTargets: nSet()})}
        className="float-right"
      />
    );
  }
}

const nSet = Set.emptySet<number>();
const lSet = Set.emptySet<IBasicBLink>();
