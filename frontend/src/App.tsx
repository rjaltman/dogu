import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Home from './Home';
import Search from './Search';
import Header from './Header';
import CreateProject from './CreateProject';
import ProjectDisplay from './ProjectDisplay';
import Register from './Register';

type State = Readonly<{
  loggedIn: boolean,
  uname: string,
  page: string,
  userType: "Instructor" | "Student" | "Organizer" | "",
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
        userType: "Student",
        pid: 0
      };
      this.loginHandler = this.loginHandler.bind(this);
      this.logoutHandler = this.logoutHandler.bind(this);
      this.pageViewHandler = this.pageViewHandler.bind(this);
      this.userTypeHandler = this.userTypeHandler.bind(this);
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
  userTypeHandler(usertype: "Instructor" | "Student" | "Organizer" | "") {
    this.setState({
      userType: usertype
    });
  }
  logoutHandler() {
    this.setState({
      loggedIn: false,
      uname: "",
      page: "dashboard_unauthenticated"
    });
  }
  render() {
      if (!this.state.loggedIn) {
        if (this.state.page == "register") {
          return <div><Header pageHandler = {this.pageViewHandler} currentPage = {this.state.page} loggedin = {this.state.loggedIn} /><Register utype = {this.state.userType} onLogin = {this.loginHandler} pageHandler = {this.pageViewHandler} /></div>;
        }
        else {
          return <div>
            <Header pageHandler = {this.pageViewHandler} loggedin = {this.state.loggedIn} />
            <Login pageHandler = {this.pageViewHandler} onLogin = {this.loginHandler} userTypeHandler = {this.userTypeHandler} />
            </div>;
        }
      }
      else {
        switch(this.state.page) {
         case "create_project": {
            return <div><Header pageHandler = {this.pageViewHandler} currentPage = {this.state.page} loggedin = {this.state.loggedIn} logoutHandler = {this.logoutHandler} /><CreateProject id={this.state.pid} pageHandler = {this.pageViewHandler} /></div>
         }
         case "search_project": {
            return <div><Header pageHandler = {this.pageViewHandler} currentPage = {this.state.page} loggedin = {this.state.loggedIn} logoutHandler = {this.logoutHandler} /><Search pageHandler = {this.pageViewHandler} /></div>
         }
         case "display_project": {
            return <div><Header pageHandler = {this.pageViewHandler} currentPage = {this.state.page} loggedin = {this.state.loggedIn} logoutHandler = {this.logoutHandler} /><ProjectDisplay id={this.state.pid} pageHandler = {this.pageViewHandler} /></div>
         }
         default: {
           return <div><Header pageHandler = {this.pageViewHandler} currentPage = {this.state.page} loggedin = {this.state.loggedIn} logoutHandler = {this.logoutHandler} /><Home username = {this.state.uname} pageHandler = {this.pageViewHandler} /></div>;
         }
        }
      }
      // For when we want to re-add the project display
      // return <ProjectDisplay id={1} />;
  }
}

export default App;
