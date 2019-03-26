import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Search from './Search';
import CreateProject from './CreateProject';

type State = Readonly<{}>;
type AppProps = Readonly<{}>;
class App extends Component {
    constructor(props: AppProps) {
        super(props);
    }
  render() {
      return <CreateProject />;
  }

}

export default App;
