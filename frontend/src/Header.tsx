import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/header.css'

interface HeaderProps {
    username? : string,
    password?: string,
    pageHandler?: (page: string, pid: number) => void
};

class Header extends Component<HeaderProps, any> {
  constructor(props : HeaderProps) {
      super(props);
      this.goHome = this.goHome.bind(this);
  }
  goHome() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("dashboard_authenticated",0);
  }
  render() {
      var material = <i className="material-icons hyperlinked">&#xe91d;</i>;
      return <div id="header" className="hyperlinked" onClick={this.goHome}>{material} Dogu</div>;
  }
}

export default Header;
