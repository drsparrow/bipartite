import * as React from 'react';
import Set from './set';
import BNode, { NODE_WIDTH } from './BNode';
import BLink from './BLink';
import ClearButton from './ClearButton';
import ColorSlider from './ColorSlider';
import ColorDefs from './ColorDefs';
import { colorValToHsl, Color } from './colorHelper';
import BipartiteGraph, { BNodeType, BNodeData, IBLink, NodeId, nodeIndex, SOURCE, TARGET } from './bipartiteGraph';

type idSet = Set<string>;

export interface IRawBLink {
  source: nodeIndex;
  target: nodeIndex;
  value: number;
}

export interface IRawBGraph {
  sources: NodeId[];
  targets: NodeId[];
  links: IRawBLink[];
}

export interface IBipartiteProps {
  graph: IRawBGraph;
}

export interface IBipartiteState {
  selectedSources: idSet;
  selectedTargets: idSet;
  selectedLinks: idSet;
  tightness: number;
  sourceColorVal: number;
  targetColorVal: number;
  showChild: boolean;
}

export type NodePosition = {x: number, y: number};

export default class Bipartite extends React.Component<IBipartiteProps, IBipartiteState> {

  public state = {
    selectedSources: idSet(),
    selectedTargets: idSet(),
    selectedLinks: idSet(),
    sourceColorVal: 0,
    targetColorVal: 180,
    tightness: 0,
    showChild: false
  };

  private height = 400;
  private width = 700;
  private x1 = 0;
  private x2 = this.width;
  private sources: BNodeData[];
  private targets: BNodeData[];
  private links: IBLink[];

  private totalValue: number;

  constructor(props: IBipartiteProps) {
    super(props);
    const graph = new BipartiteGraph(props.graph);
    this.links = graph.links;
    this.sources = graph.sources;
    this.targets = graph.targets;
    this.totalValue = this.valueOfLinks(this.links);
  }

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
        <button onClick={() => this.setState({showChild: true})}/>
        {this.state.showChild ? this.renderChild() : null}
      </div>
    );
  }

  private nodePosition (node: BNodeData): NodePosition {
    const {x1, x2} = this;
    return {
      x: isSource(node.type) ? x1 : x2 - NODE_WIDTH,
      y: this.nodeHeight(node)
    };
  }

  private nodeHeight(node: BNodeData) {
    let height = 0;
    const nodes = isSource(node.type) ? this.sources : this.targets;
    let spacing = this.nodeSpacing(nodes);

    for (let i = 0; i < node.index; i++) {
      height += nodes[i].value;
      height += spacing;
    }

    return height;
  }

  private renderSources () {
    return (
      <g className="sources">
        {this.sources.map((n, i) => this.renderNode(n))}
      </g>
    );
  }

  private renderTargets () {
    return (
      <g className="targets">
        {this.targets.map((n, i) => this.renderNode(n))}
      </g>
    );
  }

  private renderNode(node: BNodeData) {
    const {type, index} = node;
    const color = this.getColor(type);
    const pos = this.nodePosition(node);
    const height = node.value;
    const onClick = () => this.handleNodeClick(node);
    const isSelected = this.nodeIsSelected(node);
    return <BNode {...{height, pos, onClick, isSelected, color}} key={index}/>;
  }

  private handleNodeClick (node: BNodeData) {
    this.setState(prevState => {
      let {selectedSources, selectedTargets} = prevState;
      if (isSource(node.type)) {
        selectedSources = selectedSources.toggleAndCopy(node.id);
      } else {
        selectedTargets = selectedTargets.toggleAndCopy(node.id);
      }
      return {selectedSources, selectedTargets};
    });
  }

  private handleLinkClick (link: IBLink) {
    this.setState(prevState => ({
      selectedLinks: prevState.selectedLinks.toggleAndCopy(link.id)
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
    const { y1, y2 } = this.linkYs(link);
    const {isLeftHighlighted, isRightHighlighted, isSelected} = this.linkSelected(link);
    const key = `${source.id}-${target.id}`;
    const onClick = () => this.handleLinkClick(link);

    return (
      <BLink
        {...{value, x1, x2, y1, y2, tightness, isLeftHighlighted, isRightHighlighted, isSelected, key, onClick}}
      />
    );
  }

  private linkIsLeftHighlighted (link: IBLink) {
    return this.state.selectedSources.includes(link.source.id);
  }

  private linkIsRightHighlighted (link: IBLink) {
    return this.state.selectedTargets.includes(link.target.id);
  }

  private linkIsSelected (link: IBLink) {
    return this.state.selectedLinks.includes(link.id);
  }

  private sourceOffset (link: IBLink): number {
    return this.offsetFromLinks(link, link.source.links);
  }

  private targetOffset (link: IBLink): number {
    return this.offsetFromLinks(link, link.target.links);
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
    const nodes = isSource(type) ? selectedSources : selectedTargets;
    const allNodes = isSource(type) ? this.sources : this.targets;
    const setValue = this.selectedNodesValue(type);
    const className = isSource(type) ? 'float-left' : 'float-right';

    const clearSource = {selectedSources: idSet(), selectedTargets};
    const clearTarget = {selectedTargets: idSet(), selectedSources};
    const newState = isSource(type) ? clearSource : clearTarget;

    return (
      <ClearButton
        setSize={nodes.size()}
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
        setValue={this.selectedLinksValue()}
        totalValue={this.totalValue}
        onClick={() => this.setState({selectedLinks: idSet()})}
        className="selected-links"
      />
    );
  }

  private selectedLinksValue () {
    return this.valueFrom(this.state.selectedLinks, this.links);
  }

  private selectedNodesValue (type: BNodeType) {
    const { selectedTargets, selectedSources } = this.state;
    const allNodes = isSource(type) ? this.sources : this.targets;
    const nodes = isSource(type) ? selectedSources : selectedTargets;

    return this.valueFrom(nodes, allNodes);
  }

  private valueFrom(idSet: idSet, fullList: (BNodeData | IBLink)[]) {
    return fullList.reduce((acc, nodeOrLink) => (
      acc + (idSet.includes(nodeOrLink.id) ? nodeOrLink.value : 0)
    ), 0);
  }

  private colorDefs() {
    const sourceColor = this.getColor(SOURCE);
    const targetColor = this.getColor(TARGET);
    return (
      <ColorDefs {...{sourceColor, targetColor}}/>
    );
  }

  private getColor(type: BNodeType): Color {
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

  private nodeIsSelected(node: BNodeData) {
    const {selectedSources, selectedTargets} = this.state;
    const nodes = isSource(node.type) ? selectedSources : selectedTargets;
    return nodes.includes(node.id);
  }

  private linkYs(link: IBLink) {
    const { source, target } = link;
    const midpoint = link.value / 2;
    return {
      y1: this.nodeHeight(source) + this.sourceOffset(link) + midpoint,
      y2: this.nodeHeight(target) + this.targetOffset(link) + midpoint,
    };
  }

  private linkSelected(link: IBLink) {
    return {
      isLeftHighlighted: this.linkIsLeftHighlighted(link),
      isRightHighlighted: this.linkIsRightHighlighted(link),
      isSelected: this.linkIsSelected(link)
    };
  }

  private filteredGraph () {
    const sourceSet = new Set<NodeId>();
    const targetSet = new Set<NodeId>();

    const filteredLinks = this.links.filter(link => (
      this.linkIsSelected(link) ||
      this.linkIsLeftHighlighted(link) ||
      this.linkIsRightHighlighted(link)
    ));

    filteredLinks.forEach(link => {
      sourceSet.add(link.source.id);
      targetSet.add(link.target.id);
    });

    const sources = sourceSet.toArray();
    const targets = targetSet.toArray();

    const links = filteredLinks.map(link => ({
      value: link.value,
      source: sources.indexOf(link.source.id),
      target: targets.indexOf(link.target.id)
    }));

    return { links, sources, targets };
  }

  private renderChild (): JSX.Element {
    return <Bipartite graph={this.filteredGraph()} key={JSON.stringify(this.filteredGraph())}/>;
  }
}

const idSet = Set.emptySet<string>();

const isSource = (type: BNodeType): boolean => type === SOURCE;
