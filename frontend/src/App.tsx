import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Home from './Home';
import Search from './Search';

type State = Readonly<{
  loggedIn: boolean,
  uname: string,
}>;
type AppProps = Readonly<{}>;


class App extends Component {
  readonly state: State;
  constructor(props: AppProps) {
      super(props);
      this.state = {
        loggedIn: false,
        uname: ""
      };
      this.loginHandler = this.loginHandler.bind(this);
  }
  loginHandler() {
    this.setState({
      loggedIn: true,
      uname: "DOGU User"
    });
  }
  render() {
      if (!this.state.loggedIn) {
        return <Login onLogin = {this.loginHandler} />;
      }
      else {
        return <Home />
      }
  }
}

export default App;
