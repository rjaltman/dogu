import React, { Component } from 'react';
import './css/project.css';
import { get, post } from './utils';
import TagEditor from './TagEditor';
import PreferenceEditor from './PreferenceEditor';

interface Props {
  id: number,
  pageHandler?: (page: string, pid: number) => void
};

type State = Readonly<typeof initialState>;

export type Project = {
    description: string,
    id: number,
    name: string,
    organization_id: number,
    startdate: Date,
    status: string,
    university_id: number,
    tags: string[],
    ranking: null | number
};

const initialState = {
    project: null as Project | null,
    // Whether the preference editor should appear
    changingPreferences: false
};

class ProjectDisplay extends Component<Props, any> {
    readonly state: State = initialState;
    constructor(props: Props) {
        super(props);
        this.onEditProject = this.onEditProject.bind(this);
        this.onBackToSearch = this.onBackToSearch.bind(this);
        this.onTagChange = this.onTagChange.bind(this);
        this.changePreferences = this.changePreferences.bind(this);
        this.removePreference = this.removePreference.bind(this);
    }

    componentDidMount() {
        if(this.props.id === undefined) {
            console.error("You have to give an id for me to show a project!")
        } else {
            this.getProject(this.props.id);
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if(prevProps.id !== this.props.id)
            this.getProject(this.props.id);
    }

    render() {
      if(this.state.project === null) {
          let no_project_out = <div id="no_project_container">
              <i className="material-icons delete_icon">&#xe92b;</i>
              <span className="no_project_title">This project has been deleted.</span>
              <span className="no_project_subtitle">If you believe you reached this page in error, <a href="mailto:rjaltman04@gmail.com">let one of our developers know</a>.</span>
              <button onClick={this.onBackToSearch}>Back to Search</button>
            </div>;
          return no_project_out;
      }
        let preferenceDisplay;
        if(this.state.project.ranking === null) {
            // TODO: This could use some design...
            preferenceDisplay = <div className="set_pref_area" onClick={() => this.addPreference()}>
                <span className="set_pref_intro">Interested in this project?</span>
                <span className="set_pref_subintro">You can add it to your list of preferred projects.</span>
                <button onClick={() => this.addPreference()}>Add this project</button>
                </div>
        } else if(this.state.changingPreferences) {
            let projectId = this.state.project.id;
            preferenceDisplay = <div>
            <div id="overlay_black"> </div>
              <div id="preference_overlay">
                <div className="preference_intro">
                  <i className="material-icons">&#xe8d6;</i>
                  <span className="preference_intro_title">Change Project Preferences</span>
                  <span className="preference_how_to_use">
                    Use the arrows on the cards below to change the order of your preferences.
                  </span>
                </div>
                <PreferenceEditor />
                <button onClick={() => this.setState({changingPreferences: false}, () => this.getProject(projectId))}>
                    Done
                </button>
              </div>
            </div>
        } else {
            preferenceDisplay = <div className="project_pref_display">
                <span className="project_pref_ranking">
                  <i className="material-icons">&#xe801;</i>
                  #{this.state.project.ranking}
                </span>
                <span className="project_pref_ranking_text">This project is ranked #{this.state.project.ranking} on your list.</span>
                <div className="prefActions">
                <div onClick={this.changePreferences}>
                Change preferences
                </div>

                <div onClick={this.removePreference}>
                Remove preference
                </div>
                </div>
                </div>
        }

      let p = this.state.project;
      let out = <div id="project_container">
          <div id="project_top">
            <i className="material-icons project_icon">&#xe54b;</i>
            <span id="project_title">{p.name}</span>
          </div>
          <div id="project_body">
            <p>Description: {p.description}</p>
            <p>Status: {p.status}</p>
            <div>Tags: <br />
            <TagEditor tags={this.state.project.tags} onTagChange={this.onTagChange} /></div>
            { preferenceDisplay }
            </div>
            <div id="project_actions">
              <div id="intro_tile">
                <i className="material-icons project_actions_title_icon">&#xe90e;</i>
                <span className="project_actions_title">Take action</span>
              </div>
              <div id="edit_project_tile">
                <i className="material-icons">&#xe3c9;</i>
                <span className="title">Edit this project</span>
                <span className="subtitle">Modify the description associated with this project. (To change tags, use the tool above.)</span>
                <button onClick={this.onEditProject}>Edit Project</button>
              </div>
              <div id="delete_project_tile">
                <i className="material-icons">&#xe92b;</i>
                <span className="title">Delete this project</span>
                <span className="subtitle">Note that this removes all records attributed to the project. Only do this if you are not closing the project or testing functionality.</span>
                <button onClick={this.deleteProject.bind(this)}>Delete Project</button>
              </div>

            </div>
          </div>

      return out;
  }

  async getProject(id: number) {
      let res = await get(`api/project/${id}`);
      if(!res["success"]) {
          console.error(res["error"])
          return;
      }
      this.setState({tags: res["tags"], project: res["project"], descriptionVal: res["description"]});
  }

  onEditProject() {
    if (this.props.pageHandler !== undefined) {
      this.props.pageHandler("create_project", this.props.id);
    }
  }

  onBackToSearch() {
    if (this.props.pageHandler !== undefined) {
      this.props.pageHandler("search_project", 0);
    }
  }

  async onTagChange(tags: string[]) {
      let project = this.state.project;
      if(project !== null) {
          project.tags = tags;
          this.setState({project});
          let res = await post("api/project/setTags", {id: (this.state.project as Project).id, tags});
          if(!res["success"]) {
              console.log("Something bad happened");
              console.error(res["error"]);
          } else {
              this.getProject((this.state.project as Project).id);
          }
      } else {
          console.error("I have no idea how this happened");
      }
  }

  async deleteProject() {
    let res: any = await post("api/deleteproject", {id: this.props.id});

    if(res["success"]) {
        console.log("Project deleted");
        this.setState({project: null});
    } else {
        console.error(res["error"]);
    }
  }

  async addPreference(rank?: number) {
      if(this.state.project !== null) {
          let data: any = {id: this.state.project.id};
          if(rank !== undefined && rank > 0) {
              data.rank = rank;
          } else if(rank !== undefined && rank <= 0) {
              console.error("You can't give a negative ranking");
              return;
          }
          let res: any = await post("api/project/preference/set", data);
          if(res["success"]) {
              let newProject = Object.assign({}, this.state.project);
              newProject.ranking =  res["newRank"];
              this.setState({project: newProject}, () => this.getProject(newProject.id));
          } else if(!res["success"]) {
              console.log(res["error"]);
          }
      } else {
          console.error("The project is null? I'm confused.");
      }
  }

  changePreferences() {
      this.setState({changingPreferences: true});
  }

  async removePreference() {
      if(this.state.project !== null) {
          let data: any = {id: this.state.project.id};
          let res: any = await post("api/project/preference/delete", data);
          if(res["success"]) {
              let newProject = Object.assign({}, this.state.project);
              newProject.ranking = null;
              this.setState({project: newProject}, () => this.getProject(newProject.id));
          } else if(!res["success"]) {
              console.log(res["error"]);
          }
      } else {
          console.error("The project is null? I'm confused.");
      }
  }

}

export default ProjectDisplay;
