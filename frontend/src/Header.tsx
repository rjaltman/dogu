import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/header.css'

interface HeaderProps {
    username? : string,
    password?: string,
    currentPage?: string,
    loggedin?: boolean,
    pageHandler?: (page: string, pid: number) => void,
    logoutHandler?: () => void
};

class Header extends Component<HeaderProps, any> {
  constructor(props : HeaderProps) {
      super(props);
      this.goHome = this.goHome.bind(this);
      this.goRegister = this.goRegister.bind(this);
      this.goSearch = this.goSearch.bind(this);
      this.goLogOut = this.goLogOut.bind(this);
  }
  goHome() {
    if ((this.props.loggedin !== undefined) && (this.props.loggedin)) {
      if (this.props.pageHandler !== undefined) {
        this.props.pageHandler("dashboard_authenticated",0);
      }
    }
    else if(this.props.loggedin !== undefined) {
      if (this.props.pageHandler !== undefined) {
        this.props.pageHandler("dashboard_unauthenticated",0);
      }
    }

  }
  goRegister() {
    if (this.props.pageHandler !== undefined) {
      this.props.pageHandler("register",0);
    }
  }

  goSearch() {
    if (this.props.pageHandler !== undefined) {
      this.props.pageHandler("search_project",0);
    }
  }

  goLogOut() {
    if (this.props.logoutHandler !== undefined) {
      this.props.logoutHandler();
    }
  }

  render() {
      var material = <i className="material-icons hyperlinked" onClick={this.goHome}>&#xe91d;</i>;
      var links =
        <ul id="header-links">
          <li className="active hyperlinked" onClick={this.goHome}>Home</li>
          <li className="hyperlinked" onClick={this.goRegister}>Register</li>
        </ul>

      if ((this.props.loggedin !== undefined) && (this.props.loggedin)) {
        if ((this.props.currentPage !== undefined) && (this.props.currentPage == "search_project")) {
          links = <ul id="header-links">
              <li className="hyperlinked" onClick={this.goHome}>Dashboard</li>
              <li className="active hyperlinked" onClick={this.goSearch}>Search</li>
              <li className="hyperlinked" onClick={this.goLogOut}>Log Out</li>
            </ul>
        }
        else {
          links = <ul id="header-links">
              <li className="active hyperlinked" onClick={this.goHome}>Dashboard</li>
              <li className="hyperlinked" onClick={this.goSearch}>Search</li>
              <li className="hyperlinked" onClick={this.goLogOut}>Log Out</li>
            </ul>
        }

      }
      else if ((this.props.currentPage !== undefined) && (this.props.currentPage == "register")) {
        links = <ul id="header-links">
            <li className="hyperlinked" onClick={this.goHome}>Home</li>
            <li className="active hyperlinked" onClick={this.goRegister}>Register</li>
          </ul>
      }

      return <div id="header">{material} <span className="hyperlinked" onClick={this.goHome}>Dogu</span> {links}</div>;
  }
}

export default Header;
