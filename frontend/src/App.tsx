import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props: Object) {
        super(props);
        this.state = {people: {}};
        fetch("/api/")
            .then((resp) => resp.json())
        .then(jsonObj => this.setState({people: jsonObj}));
    }
  render() {
    return (
      <div className="App">
          <h1>
              DOGU
          </h1>
          <h2>
              How can dogs be real if our eyes aren't real?
          </h2>
      </div>
    );
  }
}

export default App;
