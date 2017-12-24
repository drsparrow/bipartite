import * as React from 'react';
import Set from './set';
import BNode, { NODE_WIDTH } from './BNode';
import BLink from './BLink';
import ClearButton from './ClearButton';
import ColorSlider from './ColorSlider';

type BasicNode = string;
type nodeIndex = number;
type NSet = Set<number>;
type LSet = Set<IBasicBLink>;

enum BNodeType { SOURCE, TARGET }
const { SOURCE, TARGET } = BNodeType;

interface IBasicBLink {
  source: nodeIndex;
  target: nodeIndex;
  value: number; // evil. value should be in IBLink
}

export interface IBLink<DataType = {}> extends IBasicBLink {
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
  sourceColorVal: number;
  targetColorVal: number;
}

export type NodePosition = {x: number, y: number};

export default class Bipartite extends React.Component<IBipartiteProps, IBipartiteState> {

  public state = {
    selectedSources: nSet(),
    selectedTargets: nSet(),
    selectedLinks: lSet(),
    sourceColorVal: 0,
    targetColorVal: 180,
    tightness: 0
  };

  private height = 400;
  private width = 700;
  private x1 = 0;
  private x2 = this.width;
  private links = this.buildLinks();
  private sources = this.props.graph.sources;
  private targets = this.props.graph.targets;
  private totalValue = this.valueOfLinks(this.links);

  public render () {
    const {width, height} = this;
    return (
      <div className="Bipartite">
        {this.tightnessSlider()}
        {this.sourceColorSlider()}
        {this.targetColorSlider()}
        <br/>
        <span className="svg-container" style={this.svgStyle()}>
          <svg {...{width, height}} xmlns="http://www.w3.org/2000/svg">
            {this.renderLinks()}
            {this.renderSources()}
            {this.renderTargets()}
            {this.colorDefs()}
          </svg>
          {this.renderButtons()}
        </span>
      </div>
    );
  }

  private nodePosition (index: nodeIndex, type: nodeIndex): NodePosition {
    const {x1, x2} = this;
    return {
      x: isSource(type) ? x1 : x2 - NODE_WIDTH,
      y: this.nodeHeight(index, type)
    };
  }

  private nodeHeight(index: nodeIndex, type: BNodeType) {
    let height = 0;
    let spacing = this.nodeSpacing(isSource(type) ? this.sources : this.targets);

    for (let i = 0; i < index; i++) {
      height += this.valueOfNode(i, type);
      height += spacing;
    }

    return height;
  }

  private renderSources () {
    return (
      <g className="sources">
        {this.sources.map((n, i) => this.renderNode(i, SOURCE))}
      </g>
    );
  }

  private renderTargets () {
    return (
      <g className="targets">
        {this.targets.map((n, i) => this.renderNode(i, TARGET))}
      </g>
    );
  }

  private renderNode(index: nodeIndex, type: BNodeType) {
    const color = this.getColor(type);
    const pos = this.nodePosition(index, type);
    const height = this.valueOfNode(index, type);
    const onClick = () => this.handleNodeClick(index, type);
    const isSelected = this.nodeIsSelected(index, type);
    return <BNode {...{height, pos, onClick, isSelected, color}} key={index}/>;
  }

  private valueOfNode(index: nodeIndex, type: BNodeType) {
    const links = this.linksWithNode(index, type);
    return this.valueOfLinks(links);
  }

  private handleNodeClick (index: nodeIndex, type: BNodeType) {
    this.setState(prevState => {
      const {selectedSources, selectedTargets} = prevState;
      if (isSource(type)) {
        return {
          selectedSources: selectedSources.toggleAndCopy(index), selectedTargets
        };
      } else {
        return {
          selectedTargets: selectedTargets.toggleAndCopy(index), selectedSources
        };
      }
    });
  }

  private handleLinkClick (link: IBLink) {
    this.setState(prevState => ({
      selectedLinks: prevState.selectedLinks.toggleAndCopy(link)
    }));
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
    const {tightness} = state;
    const y1 = this.nodeHeight(source, SOURCE) + this.sourceOffset(link) + link.value / 2;
    const y2 = this.nodeHeight(target, TARGET) + this.targetOffset(link) + link.value / 2;
    const isLeftHighlighted = this.linkIsLeftHighlighted(link);
    const isRightHighlighted = this.linkIsRightHighlighted(link);
    const isSelected = this.linkIsSelected(link);
    const key = `${source}-${target}`;
    const onClick = () => this.handleLinkClick(link);

    return (
      <BLink
        {...{value, x1, x2, y1, y2, tightness, isLeftHighlighted, isRightHighlighted, isSelected, key, onClick}}
      />
    );
  }

  private linkIsLeftHighlighted (link: IBLink) {
    return this.state.selectedSources.includes(link.source);
  }

  private linkIsRightHighlighted (link: IBLink) {
    return this.state.selectedTargets.includes(link.target);
  }

  private linkIsSelected (link: IBLink) {
    return this.state.selectedLinks.includes(link);
  }

  private sourceOffset (link: IBLink): number {
    const links = this.linksWithNode(link.source, SOURCE);
    return this.offsetFromLinks(link, links);
  }

  private targetOffset (link: IBLink): number {
    const links = this.linksWithNode(link.target, TARGET);
    return this.offsetFromLinks(link, links);
  }

  private linksWithNode(index: nodeIndex, type: BNodeType) {
    const getter = isSource(type) ? (l: IBLink) => l.source : (l: IBLink) => l.target;
    return this.links.filter(link => getter(link) === index);
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

  private tightnessSlider () {
    return (
      <input
        type="range"
        min="-1"
        max="0"
        value={this.state.tightness}
        step="0.01"
        onChange={e => this.setState({tightness: +e.target.value})}
      />
    );
  }

  private sourceColorSlider () {
    return (
      <ColorSlider
        value={this.state.sourceColorVal}
        onChange={e => this.setState({sourceColorVal: +e.target.value})}
      />
    );
  }

  private targetColorSlider () {
    return (
      <ColorSlider
        value={this.state.targetColorVal}
        onChange={e => this.setState({targetColorVal: +e.target.value})}
      />
    );
  }

  private valueOfLinks(links: IBLink[]): number {
    return links.reduce((acc, l) => acc + l.value, 0);
  }

  private nodeSpacing (collection: {}[]): number {
    return (this.height - this.totalValue) / (collection.length - 1);
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
        {this.renderNodeButton(SOURCE)}
        {this.renderLinksButton()}
        {this.renderNodeButton(TARGET)}
      </div>
    );
  }

  private renderNodeButton(type: BNodeType) {
    const { selectedTargets, selectedSources } = this.state;
    const nodes = (isSource(type) ? selectedSources : selectedTargets).toArray();
    const allNodes = isSource(type) ? this.sources : this.targets;
    const setValue = nodes.reduce((acc, n) => acc + this.valueOfNode(n, type), 0);
    const className = isSource(type) ? 'float-left' : 'float-right';

    const clearSource = {selectedSources: nSet(), selectedTargets};
    const clearTarget = {selectedTargets: nSet(), selectedSources};
    const newState = isSource(type) ? clearSource : clearTarget;

    return (
      <ClearButton
        setSize={nodes.length}
        totalSize={allNodes.length}
        setValue={setValue}
        totalValue={this.totalValue}
        onClick={() => this.setState(newState)}
        className={className}
      />
    );
  }

  private renderLinksButton() {
    const { selectedLinks } = this.state;
    return (
      <ClearButton
        setSize={selectedLinks.size()}
        totalSize={this.links.length}
        setValue={this.valueOfLinks(selectedLinks.toArray())}
        totalValue={this.totalValue}
        onClick={() => this.setState({selectedLinks: lSet()})}
        className="selected-links"
      />
    );
  }

  private colorDefs() {
    const sourceColor = this.getColor(SOURCE);
    const targetColor = this.getColor(TARGET);
    return (
      <defs>
        <linearGradient id="left-highlighted">
            <stop offset="0%" stopColor={sourceColor}/>
            <stop offset="100%" stopColor="black"/>
        </linearGradient>
        <linearGradient id="right-highlighted">
            <stop offset="0%" stopColor="black"/>
            <stop offset="100%" stopColor={targetColor}/>
        </linearGradient>
        <linearGradient id="both-highlighted">
            <stop offset="0%" stopColor={sourceColor}/>
            <stop offset="100%" stopColor={targetColor}/>
        </linearGradient>
      </defs>
    );
  }

  private getColor(type: BNodeType): string {
    const {sourceColorVal, targetColorVal} = this.state;
    return colorValToHsl(isSource(type) ? sourceColorVal : targetColorVal);
  }

  private svgStyle() {
    const border = '5px solid';
    return {
      border: `${border} black`,
      borderLeft: `${border} ${this.getColor(SOURCE)}`,
      borderRight: `${border} ${this.getColor(TARGET)}`,
    };
  }

  private nodeIsSelected(node: nodeIndex, type: BNodeType) {
    const {selectedSources, selectedTargets} = this.state;
    const nodes = isSource(type) ? selectedSources : selectedTargets;
    return nodes.includes(node);
  }
}

const colorValToHsl = (val: number) => `hsl(${val}, 100%, 50%)`;

const nSet = Set.emptySet<number>();
const lSet = Set.emptySet<IBasicBLink>();

const isSource = (type: BNodeType): boolean => type === SOURCE;
