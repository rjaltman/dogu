import React, { Component, SyntheticEvent } from 'react';
import { post, get, handleChange } from './utils';
import './css/register.css';

interface RegisterProps {
    onAuth?: (username: string) => void,
    pageHandler?: (page: string, pid: number) => void,
    onLogin?: (username: string) => void,
    utype? : "Instructor" | "Student" | "Organizer" | "";
};

type State = Readonly<{
    usernameVal: string,
    passwordVal: string,
    positionVal: "Instructor" | "Student" | "Organizer" | "",
    deptVal: string,
    emailVal: string,
    profilePictureVal: string,
    error: string,
    firstVal: string,
    middleVal: string,
    lastVal: string,
    universityVal: number,
    orgVal: number,
    universityList: {[key: number]: string}
    orgsList: {[key: number]: string}
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
      this.handleSelectChange = this.handleSelectChange.bind(this);
      this.getUniversityOptions = this.getUniversityOptions.bind(this);

      // Borrowed from the old login code here
      let defaultUsername: string = "";
      let defaultPassword: string = "";

      let defaultPosition: "Instructor" | "Student" | "Organizer" | "" = "";

      if (this.props.utype !== undefined) {
        defaultPosition = this.props.utype;
      }

      this.state = {
          usernameVal: defaultUsername,
          passwordVal: defaultPassword,
          error: "",
          positionVal: defaultPosition,
          deptVal: "",
          emailVal: "",
          profilePictureVal: "https://www.gravatar.com/avatar/?default=mm&size=160", 
          firstVal: "",
          middleVal: "",
          lastVal: "",
          universityVal: -1,
          orgVal: -1,
          universityList: [],
          orgsList: []
      };
  }

  componentDidMount() {
      this.loadAllUniversities();
      this.loadAllOrgs();
  }
  handleSelectChange(event: React.FormEvent<HTMLSelectElement>) {
    this.setState({universityVal: event.currentTarget.value});
  }
  onCreateAccount() {
    this.register();
  }
  onChooseUserType() {
    // Nothing for now, TODO
  }
  getUniversityOptions() {
    var universities:JSX.Element[] = [];
    for (var key in this.state.universityList) {
      // I have done this before, but I used this as a refresher, so
      // if things look similar to an online solution, this was the reference used:
      // https://stackoverflow.com/questions/36205673/how-do-i-create-a-dynamic-drop-down-list-with-react-bootstrap

      // var key:number = this.state.universityList[i]['id']
      // var value:number = this.state.universityList[i]['id']
      // var name:string = this.state.universityList[i]['name']

      universities.push(<option key={key} value={key}>{this.state.universityList[key]}</option>);
    }
    return universities;
  }
  getOrgsOptions() {
    var universities:JSX.Element[] = [];
    for (var key in this.state.orgsList) {
      // I have done this before, but I used this as a refresher, so
      // if things look similar to an online solution, this was the reference used:
      // https://stackoverflow.com/questions/36205673/how-do-i-create-a-dynamic-drop-down-list-with-react-bootstrap

      // var key:number = this.state.universityList[i]['id']
      // var value:number = this.state.universityList[i]['id']
      // var name:string = this.state.universityList[i]['name']
      universities.push(<option key={key} value={key}>{this.state.orgsList[key]}</option>);
    }
    return universities;
  }
  getFirstStep() {
    var getStarted = <div id="firstThingsFirst"></div>
    return getStarted;
  }
  getStudentRender() {
    var top_icon = <i className="material-icons large_icon student-back">&#xe7fe;</i>;
    var top_text = <div id="top_text">{top_icon} <span className="title">Hey there!</span><span className="subtitle">Let's get you signed up as a student.</span></div>
    var profile_picture = <img src={this.state.profilePictureVal} />
    var first = <div className="register_form_field"><input name="firstVal" value={this.state.firstVal} placeholder="First Name" onChange={this.handleChange} /></div>
    var middle = <div className="register_form_field"><input name="middleVal" value={this.state.middleVal} placeholder="Middle Name" onChange={this.handleChange} /></div>
    var last = <div className="register_form_field"><input name="lastVal" value={this.state.lastVal} placeholder="Last Name" onChange={this.handleChange} /></div>
    var uname = <div className="register_form_field"><input name="usernameVal" value={this.state.usernameVal} placeholder="Account User Name" onChange={this.handleChange} /></div>
    var email = <div className="register_form_field"><input name="emailVal" value={this.state.emailVal} placeholder="Account Email Address" onChange={this.handleChange} /></div>
    var pwd = <div className="register_form_field"><input name="passwordVal" type="password" value={this.state.passwordVal} placeholder="Account Password" onChange={this.handleChange} /></div>
    var university = <div className="register_form_field">
        <select name="universityVal" onChange={this.handleSelectChange} value={this.state.universityVal}>
          {this.getUniversityOptions()}
        </select>
      </div>
    var img = <div className="register_form_field"><input name="profilePictureVal" value={this.state.profilePictureVal} onChange={this.handleChange} /></div>
    var dept = <div className="register_form_field"><input name="deptVal" value={this.state.deptVal} placeholder="Enter Department Name (e.g. Computer Science)" onChange={this.handleChange} /></div>
    var finish = <button onClick={this.onCreateAccount} className="studentBtn"><i className="material-icons">&#xe147;</i>Sign Up as Student</button>

    var register_lhs = <div id="register_lhs">{profile_picture}</div>

    var intro_name = <div id="register_student_name_intro"><i className="material-icons">&#xe85e;</i><span className="register_student_name_intro title">What is your name?</span></div>
    var intro_account = <div id="register_student_name_intro"><i className="material-icons">&#xe2c9;</i><span className="register_student_name_intro title">Next, we need some account information.</span></div>
    var intro_university = <div id="register_student_name_intro"><i className="material-icons">&#xe7f1;</i><span className="register_student_name_intro title">What school do you attend?</span></div>
    var intro_dept = <div id="register_student_name_intro"><i className="material-icons">&#xe80c;</i><span className="register_student_name_intro title">What do you study?</span></div>
    var intro_img = <div id="register_student_name_intro"><i className="material-icons">&#xe439;</i><span className="register_student_name_intro title">Finally, a URL to a profile photo.</span></div>

    var your_name = <div id="register_student_name">{intro_name}<div className="register_student_name_ind">{first}{middle}{last}</div></div>
    var your_acc = <div id="register_student_acc">{intro_account}<div className="register_student_name_ind">{uname}{email}{pwd}</div></div>
    var your_university = <div id="register_student_university">{intro_university}{university}</div>
    var your_dept = <div id="register_student_university">{intro_dept}{dept}</div>
    var your_img = <div id="register_student_university">{intro_img}{img}</div>

    var register_form = <div id="register_form_parent">{register_lhs}<div id="register_form">{your_name}{your_acc}{your_university}{your_dept}{your_img}{finish}</div></div>
    var register_container = <div id="register_container"><div id="register_backdrop"/> {top_text}{register_form}</div>

    return register_container;
  }
  getOrganizerRender() {
    var top_icon = <i className="material-icons large_icon organizer-back">&#xe7fe;</i>;
    var top_text = <div id="top_text">{top_icon} <span className="title organizer">Hey there!</span><span className="subtitle organizer">Let's get you signed up as an organizer.</span></div>
    var profile_picture = <img src={this.state.profilePictureVal} />
    var first = <div className="register_form_field"><input name="firstVal" value={this.state.firstVal} placeholder="First Name" onChange={this.handleChange} /></div>
    var middle = <div className="register_form_field"><input name="middleVal" value={this.state.middleVal} placeholder="Middle Name" onChange={this.handleChange} /></div>
    var last = <div className="register_form_field"><input name="lastVal" value={this.state.lastVal} placeholder="Last Name" onChange={this.handleChange} /></div>
    var uname = <div className="register_form_field"><input name="usernameVal" value={this.state.usernameVal} placeholder="Account User Name" onChange={this.handleChange} /></div>
    var email = <div className="register_form_field"><input name="emailVal" value={this.state.emailVal} placeholder="Account Email Address" onChange={this.handleChange} /></div>
    var pwd = <div className="register_form_field"><input name="passwordVal" type="password" value={this.state.passwordVal} placeholder="Account Password" onChange={this.handleChange} /></div>
    var university = <div className="register_form_field">
        <select name="universityVal" onChange={this.handleSelectChange} value={this.state.universityVal}>
          {this.getOrgsOptions()}
        </select>
      </div>
    var img = <div className="register_form_field"><input name="profilePictureVal" value={this.state.profilePictureVal} onChange={this.handleChange} /></div>
    var dept = <div className="register_form_field"><input name="deptVal" value={this.state.deptVal} placeholder="Enter Department Name (e.g. Computer Science)" onChange={this.handleChange} /></div>
    var finish = <button onClick={this.onCreateAccount} className="organizerBtn"><i className="material-icons">&#xe147;</i>Sign Up as Organizer</button>

    var register_lhs = <div id="register_lhs">{profile_picture}</div>

    var intro_name = <div id="register_student_name_intro"><i className="material-icons">&#xe85e;</i><span className="register_student_name_intro title">What is your name?</span></div>
    var intro_account = <div id="register_student_name_intro"><i className="material-icons">&#xe2c9;</i><span className="register_student_name_intro title">Next, we need some account information.</span></div>
    var intro_university = <div id="register_student_name_intro"><i className="material-icons">&#xe886;</i><span className="register_student_name_intro title">Whom do you represent?</span></div>
    var intro_dept = <div id="register_student_name_intro"><i className="material-icons">&#xeb3f;</i><span className="register_student_name_intro title">What department do you work for?</span></div>
    var intro_img = <div id="register_student_name_intro"><i className="material-icons">&#xe439;</i><span className="register_student_name_intro title">Finally, a URL to a profile photo.</span></div>

    var your_name = <div id="register_student_name">{intro_name}<div className="register_student_name_ind">{first}{middle}{last}</div></div>
    var your_acc = <div id="register_student_acc">{intro_account}<div className="register_student_name_ind">{uname}{email}{pwd}</div></div>
    var your_university = <div id="register_student_university">{intro_university}{university}</div>
    var your_dept = <div id="register_student_university">{intro_dept}{dept}</div>
    var your_img = <div id="register_student_university">{intro_img}{img}</div>

    var register_form = <div id="register_form_parent">{register_lhs}<div id="register_form">{your_name}{your_acc}{your_university}{your_dept}{your_img}{finish}</div></div>
    var register_container = <div id="register_container"><div id="register_backdrop"/> {top_text}{register_form}</div>

    return register_container;
  }
  getInstructorRender() {
    var top_icon = <i className="material-icons large_icon instructor-back">&#xe7fe;</i>;
    var top_text = <div id="top_text">{top_icon} <span className="title instructor">Hey there!</span><span className="subtitle instructor">Let's get you signed up as an instructor.</span></div>
    var profile_picture = <img src={this.state.profilePictureVal} />
    var first = <div className="register_form_field"><input name="firstVal" value={this.state.firstVal} placeholder="First Name" onChange={this.handleChange} /></div>
    var middle = <div className="register_form_field"><input name="middleVal" value={this.state.middleVal} placeholder="Middle Name" onChange={this.handleChange} /></div>
    var last = <div className="register_form_field"><input name="lastVal" value={this.state.lastVal} placeholder="Last Name" onChange={this.handleChange} /></div>
    var uname = <div className="register_form_field"><input name="usernameVal" value={this.state.usernameVal} placeholder="Account User Name" onChange={this.handleChange} /></div>
    var email = <div className="register_form_field"><input name="emailVal" value={this.state.emailVal} placeholder="Account Email Address" onChange={this.handleChange} /></div>
    var pwd = <div className="register_form_field"><input name="passwordVal" type="password" value={this.state.passwordVal} placeholder="Account Password" onChange={this.handleChange} /></div>
    var university = <div className="register_form_field">
        <select name="universityVal" onChange={this.handleSelectChange} value={this.state.universityVal}>
          {this.getUniversityOptions()}
        </select>
      </div>
    var img = <div className="register_form_field"><input name="profilePictureVal" value={this.state.profilePictureVal} onChange={this.handleChange} /></div>
    var dept = <div className="register_form_field"><input name="deptVal" value={this.state.deptVal} placeholder="Enter Department Name (e.g. Computer Science)" onChange={this.handleChange} /></div>
    var finish = <button onClick={this.onCreateAccount} className="instructorBtn"><i className="material-icons">&#xe147;</i>Sign Up as Instructor</button>

    var register_lhs = <div id="register_lhs">{profile_picture}</div>

    var intro_name = <div id="register_student_name_intro"><i className="material-icons">&#xe85e;</i><span className="register_student_name_intro title">What is your name?</span></div>
    var intro_account = <div id="register_student_name_intro"><i className="material-icons">&#xe2c9;</i><span className="register_student_name_intro title">Next, we need some account information.</span></div>
    var intro_university = <div id="register_student_name_intro"><i className="material-icons">&#xe7f1;</i><span className="register_student_name_intro title">Where are you teaching?</span></div>
    var intro_dept = <div id="register_student_name_intro"><i className="material-icons">&#xe80c;</i><span className="register_student_name_intro title">What department do you work for?</span></div>
    var intro_img = <div id="register_student_name_intro"><i className="material-icons">&#xe439;</i><span className="register_student_name_intro title">Finally, a URL to a profile photo.</span></div>

    var your_name = <div id="register_student_name">{intro_name}<div className="register_student_name_ind">{first}{middle}{last}</div></div>
    var your_acc = <div id="register_student_acc">{intro_account}<div className="register_student_name_ind">{uname}{email}{pwd}</div></div>
    var your_university = <div id="register_student_university">{intro_university}{university}</div>
    var your_dept = <div id="register_student_university">{intro_dept}{dept}</div>
    var your_img = <div id="register_student_university">{intro_img}{img}</div>

    var register_form = <div id="register_form_parent">{register_lhs}<div id="register_form">{your_name}{your_acc}{your_university}{your_dept}{your_img}{finish}</div></div>
    var register_container = <div id="register_container"><div id="register_backdrop"/> {top_text}{register_form}</div>

    return register_container;
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

  async loadAllUniversities() {
      let res = await get(`api/listUniversities`);
      if(res["success"]) {
          this.setState({ universityList: res["universities"] })
          if (this.state.universityList != {}) {
              // Object.keys approach as found at
              // https://stackoverflow.com/questions/3298477/get-first-key-from-javascript-object
              this.setState({ universityVal: Object.keys(res["universities"])[0] })
          }
      } else {
          this.setState({universityList: []})
          console.log(res["error"])
      }
  }

  async loadAllOrgs() {
      let res = await get(`api/listOrgs`);
      if(res["success"]) {
          this.setState({orgsList: res["organizations"]})
          if (this.state.orgsList != {}) {
              // Object.keys approach as found at
              // https://stackoverflow.com/questions/3298477/get-first-key-from-javascript-object
              this.setState({ orgVal: Object.keys(res["organizations"])[0] })
          }
      } else {
          this.setState({orgsList: []})
          console.log(res["error"])
      }
  }

  async register() {
    let data = {username: this.state.usernameVal,
      password: this.state.passwordVal,
      name: this.state.firstVal + " " + this.state.lastVal,
      dept: this.state.deptVal,
      contactemail: this.state.emailVal,
      position: this.state.positionVal,
      university_id: this.state.universityVal, 
      org_id: this.state.orgVal, // We can have both of these because the server just won't look if it doesn't need to
      avatar: this.state.profilePictureVal}
      // Note that university_id doubles as organization_id given the storage mechanism in state here
    if (this.state.positionVal == "Organizer") {
      let res: any = await post("api/auth/registerRep", data);
      if(res["success"]) {
          console.log("You registered");

          // Recognize success, set user as logged in
          if (this.props.onLogin !== undefined)
            this.props.onLogin(this.state.usernameVal);

      } else {
          this.setState({error: res["error"]});
      }
    }
    else {
      let res: any = await post("api/auth/registerStudent", data);
      if(res["success"]) {
          console.log("You registered");

          // Recognize success, set user as logged in
          if (this.props.onLogin !== undefined)
            this.props.onLogin(this.state.usernameVal);

      } else {
          this.setState({error: res["error"]});
      }
    }
  }

}

export default Register;
