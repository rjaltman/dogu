import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Home from './Home';
import Search from './Search';
import Header from './Header';

type State = Readonly<{
  loggedIn: boolean,
  uname: string,
  page: string
}>;
type AppProps = Readonly<{}>;


class App extends Component {
  readonly state: State;
  constructor(props: AppProps) {
      super(props);
      this.state = {
        loggedIn: false,
        uname: "",
        page: ""
      };
      this.loginHandler = this.loginHandler.bind(this);
  }
  loginHandler(username: string) {
    this.setState({
      loggedIn: true,
      uname: username,
      page: "dashboard_authenticated"
    });
  }
  render() {
      if (!this.state.loggedIn) {
        return <div>
          <Header />
          <Login onLogin = {this.loginHandler} />
          </div>;
      }
      else {
        return <div><Header /><Home username = {this.state.uname} /></div>
      }
  }
}

export default App;
