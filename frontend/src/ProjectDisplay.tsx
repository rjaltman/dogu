import React, { Component } from 'react';
// import './ProjectDisplay.css';
import './css/project.css';
import { get, post, handleChange } from './utils';

interface Props {
  id: number,
  pageHandler?: (page: string, pid: number) => void
};
type State = Readonly<typeof initialState>;

type Project = {
    description: string,
    id: number,
    name: string,
    organization_id: number,
    startdate: Date,
    status: string,
    university_id: number

};

const initialState = {tags: null as string[] | null,
    project: null as Project | null,
    newTag: "",
    makingNewTag: false,
};

class ProjectDisplay extends Component<Props, any> {
    readonly state: State = initialState;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    newTagBox: React.RefObject<HTMLInputElement> = React.createRef();

    constructor(props: Props) {
        super(props);
        this.handleChange = handleChange.bind(this);
        this.onEditProject = this.onEditProject.bind(this);
    }

    componentDidMount() {
        if(this.props.id === undefined) {
            console.error("You have to give an id for me to show a project!")
        } else {
            this.getProject(this.props.id);
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if(this.state.makingNewTag && !prevState.makingNewTag && this.newTagBox.current !== null)
            this.newTagBox.current.focus();
        if(prevProps.id !== this.props.id)
            this.getProject(this.props.id);
    }

    render() {
      if(this.state.project === null || this.state.tags === null) {
          return <img src="https://media.giphy.com/media/3ornk9OsgudyjgjS8M/giphy.gif" />
      }

      let deleteFunction = (name: string) => {
          return (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              this.removeTag(name);
          };
      };

      let deleteButton = <div className="deleteButton">x</div>;
      let tags = this.state.tags.map((t) => <div key={t} onClick={deleteFunction(t)} className="tag">{t}{deleteButton}</div>);

      if (this.state.makingNewTag) {
          let tagBox = <div key="55" className="tag"><input name="newTag" value={this.state.newTag} ref={this.newTagBox} onKeyDown={this.checkEnterKey.bind(this)} onChange={this.handleChange} /></div>;
          tags.push(tagBox);
      } else {
          let plusButton = <div key="56" onClick={() => this.setState({makingNewTag: true})} className="plusButton"> + </div>;
          tags.push(plusButton);
      }

      let tagDiv = <div className="tagDiv">{tags}</div>;
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
            {tagDiv}</div>
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

  async removeTag(tag: string) {
      console.log(`Removed ${tag}`);
      let tags = this.state.tags;
      if(tags === null) {
          console.error("God help us all");
          return;
      }
      let index = tags.indexOf(tag)
      console.assert(index !== -1);
      tags.splice(index, 1);
      this.setState({tags});
      let res = await post("api/project/deleteTag", {id: this.props.id, tag});
      await this.getProject(this.props.id)
      if(!res["success"])
          console.error(res["error"]);
  }

  async addTag(tag: string) {
      let tags = this.state.tags;
      if(tags === null) {
          console.error("God help us all again");
          return;
      }
      if(tags.indexOf(tag) !== -1) {
          return;
      }
      tags.push(tag);
      this.setState({tags});

      let res = await post("api/project/addTag", {id: this.props.id, tag});
      await this.getProject(this.props.id)
      if(!res["success"])
          console.error(res["error"]);
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

  checkEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
      const ENTER_KEY: number = 13;
      if(e.which === ENTER_KEY) {
          let newTag = this.state.newTag;
          this.addTag(newTag);
          this.setState({newTag: "", makingNewTag: false});
      }
  }
}

export default ProjectDisplay;
