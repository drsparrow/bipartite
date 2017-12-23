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
      height += this.valueOfSource(i);
      height += sourceSpacing;
    }

    return height;
  }

  private targetHeight(index: nodeIndex) {
    let height = 0;
    let targetSpacing = this.targetSpacing();

    for (let i = 0; i < index; i++) {
      height += this.valueOfTarget(i);
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
    const color = this.getSourceColor();
    const pos = this.sourcePosition(index);
    const height = this.valueOfSource(index);
    const onClick = () => this.handleSourceClick(index);
    const isSelected = this.state.selectedSources.includes(index);
    return <BNode {...{height, pos, onClick, isSelected, color}} key={index}/>;
  }

  private renderTargetNode(index: nodeIndex) {
    const color = this.getTargetColor();
    const pos = this.targetPosition(index);
    const height = this.valueOfTarget(index);
    const onClick = () => this.handleTargetClick(index);
    const isSelected = this.state.selectedTargets.includes(index);
    return <BNode {...{height, pos, onClick, isSelected, color}} key={index}/>;
  }

  private valueOfSource(index: nodeIndex): number {
    return this.valueOfLinks(this.linksWithSource(index));
  }

  private valueOfTarget(index: nodeIndex): number {
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
    const y1 = this.sourceHeight(source) + this.sourceOffset(link) + link.value / 2;
    const y2 = this.targetHeight(target) + this.targetOffset(link) + link.value / 2;
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
        {this.renderLinksButton()}
        {this.renderTargetButton()}
      </div>
    );
  }

  private renderSourceButton() {
    const { selectedSources } = this.state;
    const setValue = selectedSources.toArray()
      .reduce((acc, n) => acc + this.valueOfSource(n), 0);

    return (
      <ClearButton
        setSize={this.state.selectedSources.size()}
        totalSize={this.sources.length}
        setValue={setValue}
        totalValue={this.totalValue()}
        onClick={() => this.setState({selectedSources: nSet()})}
        className="float-left"
      />
    );
  }

  private renderTargetButton() {
    const { selectedTargets } = this.state;
    const setValue = selectedTargets.toArray()
      .reduce((acc, n) => acc + this.valueOfTarget(n), 0);

    return (
      <ClearButton
        setSize={selectedTargets.size()}
        totalSize={this.targets.length}
        setValue={setValue}
        totalValue={this.totalValue()}
        onClick={() => this.setState({selectedTargets: nSet()})}
        className="float-right"
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
        totalValue={this.totalValue()}
        onClick={() => this.setState({selectedLinks: lSet()})}
        className="selected-links"
      />
    );
  }

  private colorDefs() {
    const sourceColor = this.getSourceColor();
    const targetColor = this.getTargetColor();
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

  private getSourceColor(): string {
    return colorValToHsl(this.state.sourceColorVal);
  }

  private getTargetColor(): string {
    return colorValToHsl(this.state.targetColorVal);
  }

  private svgStyle() {
    const border = '5px solid';
    return {
      border: `${border} black`,
      borderLeft: `${border} ${this.getSourceColor()}`,
      borderRight: `${border} ${this.getTargetColor()}`,
    };
  }
}

const colorValToHsl = (val: number) => `hsl(${val}, 100%, 50%)`;

const nSet = Set.emptySet<number>();
const lSet = Set.emptySet<IBasicBLink>();
