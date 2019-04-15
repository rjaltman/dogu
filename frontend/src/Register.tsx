import React, { Component, SyntheticEvent } from 'react';
import { post, get, handleChange } from './utils';
import './css/register.css';

interface RegisterProps {
    onAuth?: (username: string) => void,
    pageHandler?: (page: string, pid: number) => void,
    utype? : string;
};

type State = Readonly<{
    usernameVal: string,
    passwordVal: string,
    passwordVal2: string,
    positionVal: "Instructor" | "Student" | "Organizer" | "",
    deptVal: string,
    emailVal: string,
    profilePictureVal: string,
    error: string,
    registering: boolean,
    firstVal: string,
    middleVal: string,
    lastVal: string,
    universityVal: string
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
class Register extends Component<RegisterProps, any> {
  readonly state: State;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  constructor(props: RegisterProps) {
      super(props);
      this.handleChange = handleChange.bind(this);
      this.onCreateAccount = this.onCreateAccount.bind(this);
      this.onChooseUserType = this.onChooseUserType.bind(this);
      this.getFirstStep = this.getFirstStep.bind(this);
      this.getStudentRender = this.getStudentRender.bind(this);
      this.getInstructorRender = this.getInstructorRender.bind(this);
      this.getOrganizerRender = this.getOrganizerRender.bind(this);
      this.setDefaultImage = this.setDefaultImage.bind(this);

      // Borrowed from the old login code here
      let defaultUsername: string = "";
      let defaultPassword: string = "";

      this.state = {
          usernameVal: defaultUsername,
          passwordVal: defaultPassword,
          error: "",
          registering: false,
          passwordVal2: "",
          positionVal: "Student",
          deptVal: "",
          emailVal: "",
          profilePictureVal: "URL to a profile picture",
          firstVal: "",
          middleVal: "",
          lastVal: "",
          universityVal: ""
      };
  }
  setDefaultImage() {
    this.setState({
      profilePictureVal: "https://www.gravatar.com/avatar/?default=mm&size=160"
    });
  }
  onCreateAccount() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("create_project",0);
  }
  onChooseUserType() {
    // Nothing for now, TODO
  }
  getFirstStep() {
    var getStarted = <div id="firstThingsFirst"></div>
    return getStarted;
  }
  getStudentRender() {
    var top_icon = <i className="material-icons large_icon">&#xe7fe;</i>;
    var top_text = <div id="top_text">{top_icon} <span className="title">Sounds good!</span><span className="subtitle">Let's get you signed up as a student.</span></div>
    var profile_picture = <img src={this.state.profilePictureVal} onError={this.setDefaultImage} />

    var first = <div className="register_form_field"><input name="firstVal" value={this.state.firstVal} placeholder="First Name" onChange={this.handleChange} /></div>
    var middle = <div className="register_form_field"><input name="middleVal" value={this.state.middleVal} placeholder="Middle Name" onChange={this.handleChange} /></div>
    var last = <div className="register_form_field"><input name="lastVal" value={this.state.lastVal} placeholder="Last Name" onChange={this.handleChange} /></div>
    var uname = <div className="register_form_field"><input name="usernameVal" value={this.state.usernameVal} placeholder="University User Name" onChange={this.handleChange} /></div>
    var email = <div className="register_form_field"><input name="emailVal" value={this.state.emailVal} placeholder="Account Email Address" onChange={this.handleChange} /></div>
    var pwd = <div className="register_form_field"><input name="passwordVal" type="password" value={this.state.passwordVal} placeholder="Account Password" onChange={this.handleChange} /></div>
    var university = <div className="register_form_field"><input name="universityVal" value={this.state.passwordVal} placeholder="What university do you attend?" onChange={this.handleChange} /></div>
    var img = <div className="register_form_field"><input name="profilePictureVal" value={this.state.profilePictureVal} onChange={this.handleChange} /></div>
    var finish = <button onClick={this.setDefaultImage} className="studentBtn"><i className="material-icons">&#xe147;</i>Sign Up as Student</button>

    var register_lhs = <div id="register_lhs">{profile_picture}</div>

    var register_form = <div id="register_form">{register_lhs}{first}{middle}{last}{uname}{email}{pwd}{university}{img}{finish}</div>
    var register_container = <div id="register_container"><div id="register_backdrop"/> {top_text}{register_form}</div>

    // let registerForm = <>
    // <div style={rowFlex}>
    //   <div style={somePadding}>Username:</div>
    //   <input name="usernameVal" style={somePadding} onChange={this.handleChange} />
    // </div>
    //
    // <div style={rowFlex}>
    //   <div style={somePadding}>Password:</div>
    //   <input name="passwordVal" type="password" style={somePadding} onChange={this.handleChange} />
    // </div>
    //
    // <div style={rowFlex}>
    //   <div style={somePadding}>Confirm:</div>
    //   <input name="passwordVal2" type="password" style={somePadding} onChange={this.handleChange} />
    // </div>
    return register_container;
  }
  getOrganizerRender() {
    var registerForm = <div></div>
    return registerForm;
  }
  getInstructorRender() {
    var registerForm = <div></div>
    return registerForm;
  }

  render() {
    switch (this.state.positionVal) {
      case "": {
        return this.getFirstStep();
      }
      case "Student": {
        return this.getStudentRender();
      }
      case "Instructor": {
        return this.getInstructorRender();
      }
      case "Organizer": {
        return this.getOrganizerRender();
      }
    }

  }
}

export default Register;
