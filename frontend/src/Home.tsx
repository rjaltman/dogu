import React, { Component } from 'react';
import { Project as PreferredProject } from './ProjectDisplay';
import { post, get, handleChange } from './utils';
import './css/dash.css';

interface HomeProps {
    username? : string,
    password?: string,
    onAuth?: (username: string) => void,
    pageHandler?: (page: string, pid: number) => void
};

type Course = {
    id: number,
    crn: string,
    university_id: number,
    term: string,
    title: string,
    groupsizelimit: number
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
    showingCourses: Course[],
    profilePictureVal: string,
    positionVal: "Instructor" | "Student" | "Organizer",
    nameVal: string,
    preferredProjects: PreferredProject[]
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
  readonly state: State = {showingProjects: [] as Project[], showingCourses: [] as Course[], preferredProjects: [] as PreferredProject[],
     profilePictureVal: "", positionVal: "Student", nameVal: ""};
  constructor(props: HomeProps) {
      super(props);
      this.onCreateProject = this.onCreateProject.bind(this);
      this.onSearchProjectViaButton = this.onSearchProjectViaButton.bind(this);
      this.projectClick = this.projectClick.bind(this);
      this.setDefaultImage = this.setDefaultImage.bind(this);
      this.onEnrollCourse = this.onEnrollCourse.bind(this);
      this.onDropCourse = this.onDropCourse.bind(this);
      this.onCreateCourse = this.onCreateCourse.bind(this);
      this.onMatchGroups = this.onMatchGroups.bind(this);
  }

  onEnrollCourse() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("enroll", 0);
  }

  onDropCourse() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("drop", 0);
  }

  onCreateCourse() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("create_course",0);
  }

  onCreateProject() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("create_project",0);
  }

  onMatchGroups() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("match_groups",0);
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

      var enroll = <span onClick={this.onEnrollCourse} className="sidebar_element pointer green"><i className="material-icons">&#xe148;</i>Enroll in Courses</span>
      var drop = <span onClick={this.onDropCourse} className="sidebar_element pointer orange"><i className="material-icons">&#xe15d;</i>Drop Courses</span>
      var formProjectGroups = <span onClick={this.onMatchGroups} className="sidebar_element pointer blue"><i className="material-icons">&#xe3e4;</i>Form Project Groups</span>
      var courseCreate = <span onClick={this.onCreateCourse} className="sidebar_element pointer green"><i className="material-icons">&#xe148;</i>Create a Course</span>

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

      var account_name = <span className="sidebar_element"><i className="material-icons">&#xe420;</i> {this.state.nameVal}</span>
      var account_type = <span className="sidebar_element"><i className="material-icons">&#xe7ee;</i> {this.state.positionVal}</span>
      var account_information_header = <span className="sidebar_header"><i className="material-icons">&#xe416;</i> Account Information</span>
      var account_information = <div id="account_information" className="sidebar_section">{account_information_header}{account_name}{account_type}</div>

      var courseList = this.state.showingCourses.map((c: Course) => <span className="sidebar_element" key={c.id}><i className="material-icons">&#xe153;</i>{c.title}</span>);
      var course_enrollment_header = <span className="sidebar_header"><i className="material-icons">&#xe54b;</i> My Courses</span>
      var course_enrollment = <div id="course_enrollment" className="sidebar_section">{course_enrollment_header} {courseList} {enroll} {drop}</div>

      var courseList_instructor = this.state.showingCourses.map((c: Course) => <span className="sidebar_element" key={c.id}><i className="material-icons">&#xe153;</i>{c.title}</span>);

      var course_enrollment_instructor = <div id="course_enrollment" className="sidebar_section">{course_enrollment_header} {courseList} {formProjectGroups} {courseCreate} </div>

      var no_current_projects = <span className="sidebar_element"><i className="material-icons">&#xe0cc;</i> No current projects.</span>
      var current_projects_header = <span className="sidebar_header"><i className="material-icons">&#xe431;</i> My Current Projects</span>
      var current_projects = <div id="current_projects" className="sidebar_section">{current_projects_header}{no_current_projects}</div>

      var prefList = this.state.preferredProjects.map((pp: PreferredProject) => <span className="sidebar_element pointer" key={pp.id} onClick={() => this.projectClick(pp.id)}><i className="material-icons">&#xe886;</i>{pp.name}</span>);
      var current_preferences_header = <span className="sidebar_header"><i className="material-icons">&#xe85c;</i> Project Preferences</span>
      var current_preferences = <div id="current_preferences" className="sidebar_section">{current_preferences_header}{prefList}</div>



      var recommendations_section = <div id="search_container"><div id="search_results">{projectList}</div></div>

      if (this.state.positionVal == "Student") {
        var sidebar = <div id="sidebar">{account_information}{course_enrollment}{current_projects}{current_preferences}</div>
        return <div id="dash_main">{sidebar}<div id="dash_container">{welcome} {dash_search} {recommendations_section}</div></div>;
      }
      else if (this.state.positionVal == "Instructor"){
        var sidebar = <div id="sidebar">{account_information}{course_enrollment_instructor}{current_projects}</div>
        return <div id="dash_main">{sidebar}<div id="dash_container">{welcome} {dash_staytuned} </div></div>;
      }
      else {
        var sidebar = <div id="sidebar">{account_information}{current_projects}</div>
        return <div id="dash_main">{sidebar}<div id="dash_container">{welcome} {dash_staytuned} </div></div>;
      }


  }

  projectClick(id: number) {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("display_project",id);
  }
  componentDidMount() {
      this.loadProjects();
      this.loadProfileInformation();
      this.loadCourses();
      this.getPreferredProjects();
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

  // Borrowed from the "drop" code and merged with instructors, which lists all of the courses a user is enrolled in.
  async loadCourses() {
      // We can run both calls, since an instructor will never be enrolled in a class,
      // and a student will never be in the instructor table of a class. 
      let res = await get(`api/courses_of_instructors`);
      let res1 = await get(`api/courses_to_drop`);
      if(res["success"] && res1["success"]) {
          this.setState({showingCourses: res["courses"].concat(res1["courses"])})
      } else {
          this.setState({showingCourses: []})
          console.log(res["error"])
      }
  }

  async getPreferredProjects() {
      let res: any = await get("api/project/preference");
      if(res["success"]) {
          this.setState({preferredProjects: res["projects"]});
      } else {
          console.error(res["error"]);
      }
  }

}

export default Home;
