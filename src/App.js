import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Hero from './ui/Hero'
import Feature from './entities/Feature'
import FeatureFilter from './ui/FeatureFilter'
import arrayToTable from './util/arrayToTable'
import sortBy from './util/sortBy'
import mapToObjects from './util/mapToObjects'

class App extends Component {
  state = {
    filterSelection: {}
  }

  componentDidMount() {
    axios.get('/features.json')
         .then(response => this.setState({ features: sortBy(mapToObjects(response.data, Feature), 'title') }));
    axios.get('/heroes.json')
         .then(response => this.setState({ heroes: sortBy(response.data, 'name') }));
  }

  render() {
    const {filterSelection, features} = this.state;
    const mergeObjects = (a, b) => Object.assign({}, a, b)

    return (
      <div className="app">
        <FeatureFilter features={features || []}
                       selection={{}}
                       onChange={c => this.setState({ filterSelection: mergeObjects(filterSelection, c) })} />
        <table className='app__hero-table'>
          <tbody>
            {
              this.rowsOfHeroes().map(
                (row, i) => <tr key={i}>
                              {row.map(h => <td key={h.name}><Hero data={h} /></td>)}
                            </tr>
              )
            }
          </tbody>
        </table>
      </div>
    );
  }

  // TODO: cache it
  rowsOfHeroes() {
    const rowLength = 6;
    const heroes = this.filteredHeroes();
    return arrayToTable(heroes, rowLength);
  }

  filteredHeroes() {
    const {filterSelection} = this.state;
    const heroes = this.state.heroes || [];
    if(!this.isFilterEnabled()) {
      return heroes;
    }

    const requiredFeatures = Object.entries(filterSelection)
                                   .filter(keyvalue => keyvalue[1])
                                   .map(keyvalue => keyvalue[0]);

    const heroFilter = h => !requiredFeatures.find(f => !h.features[f]);
    return heroes.filter(heroFilter);
  }

  isFilterEnabled() {
    return -1 !== Object.values(this.state.filterSelection).indexOf(true);
  }
}

export default App;
