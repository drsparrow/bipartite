import * as React from 'react';
import './App.css';
import Bipartite, { IBGraph } from './Bipartite';

const sources = ['a', 'b', 'c', 'd', 'e'];
const targets = ['w', 'x', 'y'];
const links = [
  {source: 0, target: 0, value: 2},
  {source: 0, target: 1, value: 12},
  {source: 1, target: 2, value: 4},
  {source: 1, target: 0, value: 10},
  {source: 2, target: 1, value: 2},
  {source: 2, target: 2, value: 3},
  {source: 3, target: 2, value: 32},
  {source: 3, target: 1, value: 42},
  {source: 4, target: 0, value: 14},
  {source: 4, target: 1, value: 8},
  {source: 4, target: 2, value: 2},
];

const graph: IBGraph = {sources, targets, links};

class App extends React.Component {
  render() {
    return (
      <div className='App'>
        <Bipartite graph={graph}/>
      </div>
    );
  }
}

export default App;
