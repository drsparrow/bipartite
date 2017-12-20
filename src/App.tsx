import * as React from 'react';
import './App.css';
import Bipartite, { IBGraph } from './Bipartite';

const sources = ['a', 'b', 'c', 'd', 'e'];
const targets = ['w', 'x', 'y', 'z'];
const links = [
  {source: 0, target: 0, value: 2},
  {source: 0, target: 1, value: 2},
  {source: 1, target: 2, value: 4},
  {source: 1, target: 3, value: 3},
  {source: 2, target: 1, value: 2},
  {source: 2, target: 2, value: 3},
  {source: 3, target: 2, value: 2},
  {source: 3, target: 0, value: 1},
  {source: 4, target: 0, value: 4},
  {source: 4, target: 1, value: 1},
  {source: 4, target: 2, value: 2},
  {source: 4, target: 3, value: 3},
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
