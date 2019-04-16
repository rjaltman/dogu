import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/header.css'

interface HeaderProps {
    username? : string,
    password?: string,
    loggedin?: boolean,
    pageHandler?: (page: string, pid: number) => void
};

class Header extends Component<HeaderProps, any> {
  constructor(props : HeaderProps) {
      super(props);
      this.goHome = this.goHome.bind(this);
      this.goRegister = this.goRegister.bind(this);
  }
  goHome() {
    if ((this.props.loggedin !== undefined) && (this.props.loggedin)) {
      if (this.props.pageHandler !== undefined) {
        this.props.pageHandler("dashboard_authenticated",0);
      }
    }

  }
  goRegister() {
    if (this.props.pageHandler !== undefined) {
      this.props.pageHandler("register",0);
    }

  }
  render() {
      var material = <i className="material-icons hyperlinked">&#xe91d;</i>;
      var links =
        <ul id="header-links">
          <li className="active hyperlinked" onClick={this.goHome}>Home</li>
          <li className="hyperlinked" onClick={this.goRegister}>Register</li>
        </ul>
      return <div id="header">{material} Dogu {links}</div>;
  }
}

export default Header;
