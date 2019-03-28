import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Home from './Home';
import Search from './Search';
import Header from './Header';
import CreateProject from './CreateProject';
import ProjectDisplay from './ProjectDisplay';

type State = Readonly<{
  loggedIn: boolean,
  uname: string,
  page: string,
  pid: number
}>;
type AppProps = Readonly<{}>;


class App extends Component {
  readonly state: State;
  constructor(props: AppProps) {
      super(props);
      this.state = {
        loggedIn: false,
        uname: "",
        page: "",
        pid: 0
      };
      this.loginHandler = this.loginHandler.bind(this);
      this.pageViewHandler = this.pageViewHandler.bind(this);
  }
  loginHandler(username: string) {
    this.setState({
      loggedIn: true,
      uname: username,
      page: "dashboard_authenticated"
    });
  }
  pageViewHandler(page: string, pid: number) {
    this.setState({
      page: page,
      pid: pid
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
        switch(this.state.page) {
         case "create_project": {
            return <div><Header pageHandler = {this.pageViewHandler} /><CreateProject id={this.state.pid}/></div>
         }
         case "search_project": {
            return <div><Header pageHandler = {this.pageViewHandler} /><Search pageHandler = {this.pageViewHandler} /></div>
         }
         case "display_project": {
            return <div><Header pageHandler = {this.pageViewHandler} /><ProjectDisplay id={this.state.pid} pageHandler = {this.pageViewHandler} /></div>
         }
         default: {
           return <div><Header pageHandler = {this.pageViewHandler} /><Home username = {this.state.uname} pageHandler = {this.pageViewHandler} /></div>;
         }
        }
      }
      // For when we want to re-add the project display
      // return <ProjectDisplay id={1} />;
  }
}

export default App;
