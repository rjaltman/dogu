import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Search from './Search';
import CreateProject from './CreateProject';
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
