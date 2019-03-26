import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import Home from './Home';
interface LoginProps {
    username? : string,
    password?: string,
    onAuth?: (username: string) => void,
    onLogin?: (username: string) => void
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

/*
 * This is the Component that handles logging into
 * the app. For the time being, it also handles registration,
 * but that should probably change soon. (cf. #7).
 * It's prop inputs are the default username, the default
 * password (which I suspect will never be used), and a function
 * taking the username as its input that will be called when the user
 * successfully logs in. Presumably, this function will change the
 * state of the caller so as to go to the next logical state of the
 * application.
 */
class Login extends Component<LoginProps, any> {
    readonly state: State;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    constructor(props: LoginProps) {
        super(props);

        let defaultUsername: string = "";
        let defaultPassword: string = "";
        if(props.username !== undefined)
            defaultUsername = props.username;
        if(props.password !== undefined)
            defaultPassword = props.password;

        this.state = {
            usernameVal: defaultUsername,
            passwordVal: defaultPassword,
            error: "",
            registering: false,
            passwordVal2: "",
            positionVal: "Student",
            deptVal: "",
            emailVal: ""
        };
        this.handleChange = handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    render() {
        const somePadding: React.CSSProperties = { margin: 2 };

        const errorStyle: React.CSSProperties = {
            color: "red",
            textDecoration: "italic",
            fontSize: "1.2em",
        };

        const rowFlex: React.CSSProperties = {
            display: "flex",
            flexDirection: "row"
        }

        const columnFlex: React.CSSProperties = {
            display: "flex",
            flexDirection: "column"
        };

        const tabStyles: React.CSSProperties = {
            display: "inline-block",
            border: "1px solid darkgrey",
            borderRadius: "5px",
            margin: 5,
            padding: 5,
            paddingLeft: 20,
            paddingRight: 20
        };

        // This function returns a callback function that you can give to the onClick
        // attribute of a component. See the example of its use below. If there is
        // no example, delete it, because it's confusing and bad.
        const setRegistering = (registering: boolean) => {
            return () => {
                this.setState({error: "", registering});
            }
        };

        const getColor = (which: boolean) => this.state.registering === which ? "rgb(192,192,192)" : "rgb(247,247,247)";

        const loginTab = <div style={Object.assign({}, tabStyles, {backgroundColor: getColor(false)})} onClick={setRegistering(false)}> Login </div>;
        const registerTab = <div style={Object.assign({}, tabStyles, {backgroundColor: getColor(true)})} onClick={setRegistering(true)}> Register </div>;

        const tabDiv = <div style={rowFlex}>
            {loginTab}
            {registerTab}
        </div>;

        const buttonStyle: React.CSSProperties = Object.assign({}, somePadding, {display: "inline-block", width: "max-content"});

        const loginForm = <>
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

        <button onClick={this.onSubmit} style={buttonStyle}>Register</button>
        </>;


      return <div onKeyDown={this.handleKeydown} style={columnFlex}>
          {tabDiv}
          <div style={errorStyle}>{this.state.error}</div>
          {this.state.registering ? registerForm : loginForm}
      </div>;
    }


  async onSubmit() {
      const username = this.state.usernameVal;
      const password = this.state.passwordVal;
      if(this.state.registering) {
          let data = {username, password, email: this.state.emailVal};
          if(this.state.passwordVal2 !== password) {
              this.setState({error: "Your passwords don't match"});
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
          // TODO modify to render new page
          if (this.props.onLogin !== undefined)
            this.props.onLogin(username);

      } else {
          this.setState({error: res["error"]});
      }
  }

  async register({password, username, email}: {username: string, password: string, email: string}) {
      let res: any = await post("api/auth/register", {username, password});
      if(res["success"]) {
          this.setState({error: "", registering: false});
          console.log("You registered");
      } else {
          this.setState({error: res["error"]});
      }
  }

  /*
   * All this does is make the form respond to the
   * enter key being pressed by submitting the form
   */
  handleKeydown<El>(e: React.KeyboardEvent<El>) {
      const ENTER_KEY = 13;
      let keyCode: number = e.which;
      if(keyCode == ENTER_KEY) {
          this.onSubmit();
      }
  }
}

export default Login;
