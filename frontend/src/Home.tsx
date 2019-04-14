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
    showingProjects: Project[]
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
  readonly state: State = {showingProjects: [] as Project[]};
  constructor(props: HomeProps) {
      super(props);
      this.onCreateProject = this.onCreateProject.bind(this);
      this.onSearchProjectViaButton = this.onSearchProjectViaButton.bind(this);
      this.projectClick = this.projectClick.bind(this);

  }
  onCreateProject() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("create_project",0);
  }
  onSearchProjectViaButton() {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("search_project",0);
  }
  
  render() {
      var welcome_img = <img src="https://www.gravatar.com/avatar/?default=mm&size=160" />
      var welcome_btn = <button onClick={this.onCreateProject} className="welcomeBtn"><i className="material-icons">&#xe147;</i>Create New Project</button>
      var welcome = <div id="dash_welcome">{welcome_img} <span>Welcome back, {this.props.username}!</span> {welcome_btn}</div>;

      var dash_search_icon = <i className="material-icons large_icon">&#xe8b6;</i>;

      var dash_search_headline = <span className="highlight dash_headline">Find your next project.</span>;
      var dash_search_textBox = <input className="searchbox" name="searchBox" readOnly value="This textbox is a placeholder. Please use the Search page." />
      var dash_search_leftside = <div id="dash_search_left">{dash_search_headline} {dash_search_textBox}</div>

      var dash_search_rhs_headline = <span className="highlight dash_headline">Or, try our full Search tool:</span>;
      var dash_search_btn = <button onClick={this.onSearchProjectViaButton} className="searchBtn"><i className="material-icons">&#xe8b6;</i>Go to Search</button>
      var dash_search_rightside = <div id="dash_search_right">{dash_search_rhs_headline} {dash_search_btn}</div>

      var dash_search = <div id="dash_search">{dash_search_icon} {dash_search_leftside} {dash_search_rightside}</div>

      var dash_staytuned_icon = <i className="material-icons large_icon">&#xe03e;</i>;
      var dash_staytuned_subtitle = <span className="dash_staytuned_subtitle">This section will soon list your current projects, and allow you to jump back in to what you worked on last. Thanks for being patient!</span>;
      var dash_staytuned_text = <div id="dash_staytuned_text"><span className="dash_staytuned_title dash_headline">Stay tuned.</span> {dash_staytuned_subtitle}</div>;
      var dash_staytuned = <div id="dash_staytuned">{dash_staytuned_icon} {dash_staytuned_text}</div>

      let projectList = this.state.showingProjects.map((p: Project) => <div className="search_tile" key={p.id} onClick={() => this.projectClick(p.id)}>
                                                            <span className="title">{p.name}</span> <span className="subtitle">{p.description}</span></div>);

      return <div><div id="dash_container">{welcome} {dash_search} {dash_staytuned}</div><br /><div id="search_container"><div id="search_results">{projectList}</div></div></div>;
  }

  projectClick(id: number) {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("display_project",id);
  }
  componentDidMount() {
      this.loadProjects();
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

}

export default Home;
