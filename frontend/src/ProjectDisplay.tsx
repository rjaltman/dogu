import React, { Component } from 'react';
import './ProjectDisplay.css';
import { get, post, handleChange } from './utils';

interface Props {id: number};
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
    makingNewTag: false
};
class ProjectDisplay extends Component<Props, any> {
    readonly state: State = initialState;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    newTagBox: React.RefObject<HTMLInputElement> = React.createRef();
    constructor(props: Props) {
        super(props);
        this.handleChange = handleChange.bind(this);
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
      if(this.state.makingNewTag) {
          let tagBox = <div key="55" className="tag"><input name="newTag" value={this.state.newTag} ref={this.newTagBox} onKeyDown={this.checkEnterKey.bind(this)} onChange={this.handleChange} /></div>;
          tags.push(tagBox);
      } else {
          let plusButton = <div key="56" onClick={() => this.setState({makingNewTag: true})} className="plusButton"> + </div>;
          tags.push(plusButton);
      }
      let tagDiv = <div className="tagDiv">{tags}</div>;
      let p = this.state.project;
      let out = <div>
          <p>Name: {p.name}</p>
          <p>Description: {p.description}</p>
          <p>Status: {p.status}</p>
          <div>Tags: <br />
          {tagDiv}</div>
          </div>;
      return out;
  }

  async getProject(id: number) {
      let res = await get(`api/project/${id}`);
      if(!res["success"]) {
          console.error(res["error"])
          return;
      }
      this.setState({tags: res["tags"], project: res["project"]});
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
