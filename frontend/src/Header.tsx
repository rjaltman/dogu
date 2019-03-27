import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/header.css'

interface HeaderProps {
    username? : string,
    password?: string
};

class Header extends Component<HeaderProps, any> {
  constructor(props : HeaderProps) {
      super(props);
  }
  render() {
      var material = <i className="material-icons">&#xe91d;</i>;
      return <div id="header">{material} Dogu</div>;
  }
}

export default Header;
