import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';

type State = Readonly<{}>;
type AppProps = Readonly<{}>;
class App extends Component {
    constructor(props: AppProps) {
        super(props);
    }
  render() {
      return <Login />;
  }

  refreshPeople() {
      fetch("/api/")
        .then((resp) => resp.json())
        .then((jsonObj: {data: Array<[string, number]>}) => {
            this.setState({people: jsonObj.data});
        });
  }

}

export default App;
