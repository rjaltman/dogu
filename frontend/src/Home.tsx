import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/dash.css';

interface HomeProps {
    username? : string,
    password?: string,
    onAuth?: (username: string) => void,
    pageHandler?: (page: string, pid: number) => void
};

type State = Readonly<{
    /*usernameVal: string,
    passwordVal: string,
    passwordVal2: string,
    positionVal: "Instructor" | "Student" | "Organizer",
    deptVal: string,
    emailVal: string,
    error: string,
    registering: boolean,*/
    showingProjects: Project[],
    profilePictureVal: string,
    positionVal: "Instructor" | "Student" | "Organizer",
    nameVal: string
}>;

type Project = {
    description: string,
    id: number,
    name: string,
    organization_id: number,
    startdate: string,
    status: string,
    university_id: number
};

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
class Home extends Component<HomeProps, any> {
  readonly state: State = {showingProjects: [] as Project[], profilePictureVal: "", positionVal: "Student", nameVal: ""};
  constructor(props: HomeProps) {
      super(props);
      this.onCreateProject = this.onCreateProject.bind(this);
      this.onSearchProjectViaButton = this.onSearchProjectViaButton.bind(this);
      this.projectClick = this.projectClick.bind(this);
      this.setDefaultImage = this.setDefaultImage.bind(this);
      this.onEnrollCourse = this.onEnrollCourse.bind(this);
      this.onDropCourse = this.onDropCourse.bind(this);
  }

  onEnrollCourse() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("enroll", 0);
  }

  onDropCourse() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("drop", 0);
  }

  onCreateProject() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("create_project",0);
  }
  onSearchProjectViaButton() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("search_project",0);
  }
  setDefaultImage() {
    this.setState({
      profilePictureVal: "https://www.gravatar.com/avatar/?default=mm&size=160"
    });
  }

  render() {
      var welcome_img = <img src={this.state.profilePictureVal} onError={this.setDefaultImage} />
      var welcome_btn = <button onClick={this.onCreateProject} className="welcomeBtn"><i className="material-icons">&#xe147;</i>Create New Project</button>
      var welcome = <div id="dash_welcome">{welcome_img} <span>Welcome back, {this.state.nameVal}!</span> {welcome_btn}</div>;

      var dash_search_icon = <i className="material-icons large_icon">&#xe8b6;</i>;

      var dash_search_headline = <span className="highlight dash_headline">Find your next project.</span>;
      var dash_search_textBox = <input className="searchbox" name="searchBox" readOnly value="This textbox is a placeholder. Please use the Search page." />
      var dash_search_leftside = <div id="dash_search_left">{dash_search_headline} {dash_search_textBox}</div>

      var dash_search_rhs_headline = <span className="highlight dash_headline">Or, try our full Search tool:</span>;
      var dash_search_btn = <button onClick={this.onSearchProjectViaButton} className="searchBtn"><i className="material-icons">&#xe8b6;</i>Go to Search</button>
      var dash_search_rightside = <div id="dash_search_right">{dash_search_rhs_headline} {dash_search_btn}</div>

      var dash_search = <div id="dash_search">{dash_search_icon} {dash_search_leftside} {dash_search_rightside}</div>

      var enroll = <div id="enroll"><button onClick={this.onEnrollCourse} className="welcomeBtn">Enroll in Courses</button></div>
      var drop = <div id="drop"><button onClick={this.onDropCourse} className="welcomeBtn">Drop Courses</button></div>

      var dash_staytuned_icon = <i className="material-icons large_icon">&#xe03e;</i>;
      var dash_staytuned_subtitle = <span className="dash_staytuned_subtitle">This section
        is under construction for instructors and organizers. For instructors, this section will soon let you view all classes, make a new class,
        and form teams to work on projects. Organizers, you can keep track of your organization's information in this section. Thanks for being patient!</span>;
      var dash_staytuned_text = <div id="dash_staytuned_text"><span className="dash_staytuned_title dash_headline">Stay tuned.</span> {dash_staytuned_subtitle}</div>;
      var dash_staytuned = <div id="dash_staytuned">{dash_staytuned_icon} {dash_staytuned_text}</div>

      var projectList_intro =
        <div id="project_recommendations_intro">
          <div className="title">Recommendations for you</div>
          <div className="subtitle">We've picked a few projects you might like, based on your preferences list.</div>
        </div>
      var projectList = this.state.showingProjects.map((p: Project) => <div className="search_tile" key={p.id} onClick={() => this.projectClick(p.id)}>
                                                            <span className="title">{p.name}</span> <span className="subtitle">{p.description}</span></div>);

      var account_information_header = <span className="sidebar_header"><i className="material-icons">&#xe416;</i> Account Information</span>
      var account_information = <div id="account_information" className="sidebar_section">{account_information_header}</div>

      var course_enrollment_header = <span className="sidebar_header"><i className="material-icons">&#xe54b;</i> My Classes</span>
      var course_enrollment = <div id="course_enrollment" className="sidebar_section">{course_enrollment_header} {enroll} {drop}</div>

      var current_projects_header = <span className="sidebar_header"><i className="material-icons">&#xe431;</i> My Current Projects</span>
      var current_projects = <div id="current_projects" className="sidebar_section">{current_projects_header}</div>

      var current_preferences_header = <span className="sidebar_header"><i className="material-icons">&#xe85c;</i> Project Preferences</span>
      var current_preferences = <div id="current_preferences" className="sidebar_section">{current_preferences_header}</div>

      var sidebar = <div id="sidebar">{account_information}{course_enrollment}{current_projects}{current_preferences}</div>

      var recommendations_section = <div id="search_container"><div id="search_results">{projectList}</div></div>

      if (this.state.positionVal == "Student") {
        return <div id="dash_main">{sidebar}<div id="dash_container">{welcome} {dash_search} {recommendations_section}</div></div>;
      }
      else if (this.state.positionVal == "Instructor"){
        return <div><div id="dash_container">{welcome} {dash_staytuned} {enroll} {drop} </div></div>;
      }
      else {
        return <div><div id="dash_container">{welcome} {dash_staytuned} </div></div>;
      }


  }

  projectClick(id: number) {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("display_project",id);
  }
  componentDidMount() {
      this.loadProjects();
      this.loadProfileInformation();
  }

  async loadProjects() {
      let res = await get(`api/recommendations`);
      if(res["success"]) {
          this.setState({showingProjects: res["projects"]})
      } else {
          this.setState({showingProjects: []})
          console.log(res["error"])
      }
  }

  async loadProfileInformation() {
    let res = await post(`api/getProfileInfo`, {username: this.props.username});
    if(res["success"]) {
        this.setState({
          profilePictureVal: res["avatar"],
          positionVal: res["position"],
          nameVal: res["name"]
        })
    } else {
        console.log(res["error"])
    }
  }

}

export default Home;
