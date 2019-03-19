import React, { Component } from 'react';
import { post, get } from './utils';
interface LoginProps {
    username? : string,
    password?: string,
    onAuth?: (username: string) => void
};
type State = Readonly<{usernameVal: string, passwordVal: string, error: string, registering: boolean}>;

class Login extends Component<LoginProps, any> {
    readonly state: State;
    constructor(props: LoginProps) {
        super(props);

        let defaultUsername: string = "";
        let defaultPassword: string = "";
        const cb = props.onAuth;
        if(props.username !== undefined)
            defaultUsername = props.username;
        if(props.password !== undefined)
            defaultPassword = props.password;

        this.state = {usernameVal: defaultUsername, passwordVal: defaultPassword, error: "", registering: false};
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    render() {
      let gridStyle: (row: number, column: number) => React.CSSProperties = (row, column) => ({
          gridColumnStart: column,
          gridColumnEnd: "span 1",
          gridRowStart: row,
          gridRowEnd: "span 1",
      });
      
        let somePadding: React.CSSProperties = {
            margin: 2,
        };

        let errorStyle: React.CSSProperties = {
            color: "red",
            textDecoration: "italic",
            fontSize: "1.2em",
        };

        let tabStyles: React.CSSProperties = {display: "inline-block", border: "1px solid darkgrey", width: "40%", borderRadius: "5px", margin: 2, padding: 2};
        let setRegistering = (registering: boolean) => {
            return () => {
                this.setState({registering});
            }
        };
        let getColor = (which: boolean) => this.state.registering === which ? "rgb(192,192,192)" : "rgb(247,247,247)";
        let loginTab = <div style={Object.assign({}, tabStyles, {backgroundColor: getColor(false)})} onClick={setRegistering(false)}> Login </div>;
        let registerTab = <div style={Object.assign({}, tabStyles, {backgroundColor: getColor(true)})} onClick={setRegistering(true)}> Register </div>;

        let tabDiv = <div style={{gridColumnStart: 1, gridColumnEnd: "span 2", gridRowStart: 1, gridRowEnd: "span 1"}} >
            {loginTab}
            {registerTab}
        </div>;


      return <div onKeyDown={this.handleKeydown} style={{display: "inline-grid", gridTemplateRows: "repeat(5, auto)", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", width: "auto"}}>
          {tabDiv}
          <div style={Object.assign(gridStyle(2,1), somePadding)}>Username:</div>
          <input name="usernameVal" style={Object.assign(gridStyle(2,2), somePadding)} onChange={this.handleChange} />
          <div style={Object.assign(gridStyle(3,1), somePadding)}>Password:</div>
          <input name="passwordVal" type="password" style={Object.assign(gridStyle(3,2), somePadding)} onChange={this.handleChange} />
          <button onClick={this.onSubmit} style={gridStyle(4, 2)} >{ this.state.registering ? "Register" : "Log in" }</button>
          <div style={Object.assign(gridStyle(5, 1), errorStyle, {gridColumnEnd: "span 2"})}>{this.state.error}</div>
      </div>;
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const name: string = e.target.name;
      const value: string = e.target.value;
      this.setState({[name]: value});
  }

  async onSubmit() {
      const username = this.state.usernameVal;
      const pw = this.state.passwordVal;
      if(this.state.registering) {
          await this.register(username, pw);
      } else {
          await this.login(username, pw);
      }
  }

  async login(username: string, pw: string) {
      let res: any = await post("api/auth/login", {username, password: pw});
      if(res["success"]) {
          if(this.props.onAuth !== undefined)
              this.props.onAuth(username);

          this.setState({error: ""});
      } else {
          this.setState({error: res["error"]});
      }
  }

  async register(username: string, pw: string) {
  }

  handleKeydown<El>(e: React.KeyboardEvent<El>) {
      const ENTER_KEY = 13;
      let keyCode: number = e.which;
      if(keyCode == ENTER_KEY) {
          this.onSubmit();
      }
  }
}

export default Login;
