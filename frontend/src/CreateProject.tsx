import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import TagEditor from './TagEditor';

interface Props {
  id: number,
  pageHandler?: (page: string, pid: number) => void
}

type State = Readonly<{
  nameVal: string,
  descriptionVal: string,
  tags: string[],
  newProject: boolean,
  error: string,
}>;

class CreateProject extends Component<Props, any> {
  readonly state: State;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  constructor(props: Props) {
    super(props);

    this.state = {
        nameVal: "",
        descriptionVal: "",
        newProject: true,
        tags: [],
        error: ""
    }

    this.handleChange = handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onTagChange = this.onTagChange.bind(this);
  }

  componentDidMount() {
    if (this.props.id != 0) {
      this.setState({newProject: false});
      console.log("new project is false");
      this.getProject(this.props.id);
    }
    console.log("id is:");
    console.log(this.props.id);
  }

  render() {
    const somePadding: React.CSSProperties = { margin: "2px",
    padding: "0.6em 0",
    flex: "0 100%",
    paddingRight: "20px" };

    const errorStyle: React.CSSProperties = {
      color: "red",
      textDecoration: "italic",
      fontSize: "1.2em",
    };

    const rowFlex: React.CSSProperties = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      paddingBottom: "1em",
      textAlign: "left"
    };

    const columnFlex: React.CSSProperties = {
      display: "flex",
      flexDirection: "column"
    };

    const buttonStyle: React.CSSProperties = Object.assign({}, somePadding, {width: "max-content"});

    var create_project_leadin = <div></div>
    if (this.state.newProject) {
      create_project_leadin = <div id="create_project_leadin">
                                <i className="material-icons">&#xe3e4;</i>
                                <span className="title">Let's start something new.</span>
                              </div>;
    }
    else {
      create_project_leadin = <div id="create_project_leadin">
                                <i className="material-icons">&#xe3c9;</i>
                                <span className="title">Editing project <i>{this.state.nameVal}</i></span>
                              </div>;
    }

      return (
      <div className="App">
        <div id="create_project_background">
          <i className="material-icons">&#xeb3f;</i>
        </div>
        <div id="create_project_container">
          {create_project_leadin}
          <div id="create_project_form">
            <div style={rowFlex}>
              <div style={somePadding}>Project Name:</div>
              <input className="name" name="nameVal" value={this.state.nameVal} onChange={this.handleChange} />
            </div>

            <div style={rowFlex}>
              <div style={somePadding}>Project Description:</div>
              <input className="description" name="descriptionVal" value={this.state.descriptionVal} onChange={this.handleChange} />
            </div>
            <div style={rowFlex}>
                <p style={{paddingRight: 10}}>Tags: </p>
                <TagEditor tags={this.state.tags} onTagChange={this.onTagChange} />
            </div>
            <button onClick={this.onSubmit}>Submit</button>
          </div>
        </div>
      </div>
      );
  }

  async getProject(id: number) {
      let res = await get(`api/project/${id}`);

      if(!res["success"]) {
          console.error(res["error"])
          return;
      }

      this.setState({nameVal: res["project"]["name"], descriptionVal: res["project"]["description"]});
      console.log(res["project"]["name"]);
      console.log(this.state.nameVal);

  }

  async onSubmit() {
    if (this.state.nameVal === "" || this.state.descriptionVal === "") {
      this.setState({error: "You must include a name and description"});
    } else {
      const name = this.state.nameVal;
      const description = this.state.descriptionVal;
      const tags = this.state.tags;
      const id = this.props.id;

      if (this.state.newProject) {
        let data = {name, description, tags};
        await this.addProject(data);
      } else {
        let data = {id, name, description, tags};
        await this.editProject(data);
      }
    }
  }

  async addProject({name, description, tags}: {name: string, description: string, tags: string[]}) {
    let res: any = await post("api/createproject", {name, description, tags});

    if(res["success"]) {
        this.setState({error: ""});
        console.log("Project added");
        if (this.props.pageHandler !== undefined)
          this.props.pageHandler("search_project",0);
    } else {
        this.setState({error: res["error"]});
    }
  }

  async editProject({id, description, tags}: {id: number, description: string, tags: string[]}) {
    let res: any = await post("api/editProject", {id, description, tags});

    if(res["success"]) {
        console.log("Project edited");
        this.setState({editingProject: false});
        if (this.props.pageHandler !== undefined)
          this.props.pageHandler("display_project",id);
    } else {
        this.setState({error: res["error"]});
    }
  }

  async onTagChange(tags: string[]) {
      this.setState({tags});
  }
}

export default CreateProject;
