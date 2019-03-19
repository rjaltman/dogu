import React, { Component } from 'react';
import { post, get } from './utils';
interface LoginProps {
    username? : string,
    password?: string,
    onAuth?: (username: string) => void
};

type State = Readonly<{
    usernameVal: string,
    passwordVal: string,
    passwordVal2: string,
    positionVal: "Instructor" | "Student" | "Organizer",
    deptVal: string,
    emailVal: string,
    error: string,
    registering: boolean,
}>;

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

        this.state = {usernameVal: defaultUsername,
            passwordVal: defaultPassword,
            error: "",
            registering: false,
            passwordVal2: "",
            positionVal: "Student",
            deptVal: "",
            emailVal: ""};
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    render() {
        let somePadding: React.CSSProperties = { margin: 2 };

        let errorStyle: React.CSSProperties = {
            color: "red",
            textDecoration: "italic",
            fontSize: "1.2em",
        };

        let rowFlex: React.CSSProperties = {
            display: "flex",
            flexDirection: "row"
        }

        let columnFlex: React.CSSProperties = {
            display: "flex",
            flexDirection: "column"
        };

        let tabStyles: React.CSSProperties = {display: "inline-block", border: "1px solid darkgrey", borderRadius: "5px", margin: 5, padding: 5, paddingLeft: 20, paddingRight: 20};
        let setRegistering = (registering: boolean) => {
            return () => {
                this.setState({error: "", registering});
            }
        };
        let getColor = (which: boolean) => this.state.registering === which ? "rgb(192,192,192)" : "rgb(247,247,247)";

        let loginTab = <div style={Object.assign({}, tabStyles, {backgroundColor: getColor(false)})} onClick={setRegistering(false)}> Login </div>;
        let registerTab = <div style={Object.assign({}, tabStyles, {backgroundColor: getColor(true)})} onClick={setRegistering(true)}> Register </div>;

        let tabDiv = <div style={rowFlex} >
            {loginTab}
            {registerTab}
        </div>;

        let buttonStyle: React.CSSProperties = Object.assign({}, somePadding, {display: "inline-block", width: "max-content"});

        let loginForm = <>
        <div style={rowFlex}>
        <div style={somePadding}>Username:</div>
          <input name="usernameVal" style={somePadding} onChange={this.handleChange} />
      </div>
        <div style={rowFlex}>
          <div style={somePadding}>Password:</div>
          <input name="passwordVal" type="password" style={somePadding} onChange={this.handleChange} />
      </div>
          <button style={buttonStyle} onClick={this.onSubmit} >Log in</button>
        </>;

        let registerForm = <>
        <div style={rowFlex}>
          <div style={somePadding}>Username:</div>
          <input name="usernameVal" style={somePadding} onChange={this.handleChange} />
      </div>

        <div style={rowFlex}>
          <div style={somePadding}>Password:</div>
          <input name="passwordVal" type="password" style={somePadding} onChange={this.handleChange} />
      </div>

        <div style={rowFlex}>
          <div style={somePadding}>Confirm:</div>
          <input name="passwordVal2" type="password" style={somePadding} onChange={this.handleChange} />
      </div>

        <div style={rowFlex}>
          <div style={somePadding}>Email:</div>
          <input name="emailVal" type="password" style={somePadding} onChange={this.handleChange} />
      </div>

          <button onClick={this.onSubmit} style={buttonStyle}>Register</button>
        </>;


      return <div onKeyDown={this.handleKeydown} style={columnFlex}>
          {tabDiv}
          <div style={errorStyle}>{this.state.error}</div>
          {this.state.registering ? registerForm : loginForm}
      </div>;
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const name: string = e.target.name;
      const value: string = e.target.value;
      this.setState({[name]: value});
  }

  async onSubmit() {
      const username = this.state.usernameVal;
      const password = this.state.passwordVal;
      if(this.state.registering) {
          let data = {username, password, email: this.state.emailVal};
          if(this.state.passwordVal2 !== password) {
              this.setState({error: "Your passwords don't match"});
          } else if (data.email === "") {
              this.setState({error: "You must give an email address"});
          } else { 
              await this.register(data);
          }
      } else {
          await this.login(username, password);
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

  async register({password, username, email}: {username: string, password: string, email: string}) {
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
