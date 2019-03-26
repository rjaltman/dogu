import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ProjectDisplay from './ProjectDisplay';

type State = Readonly<{}>;
type AppProps = Readonly<{}>;
class App extends Component {
    constructor(props: AppProps) {
        super(props);
    }
  render() {

      return <ProjectDisplay id={2} />;
  }

}

export default App;
