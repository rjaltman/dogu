import React, { Component } from 'react';
import { post, get, handleChange } from './utils';

interface Props {
  id: number
}

type State = Readonly<{
  nameVal: string,
  descriptionVal: string,
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
        error: ""
    }

    this.handleChange = handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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
    const somePadding: React.CSSProperties = { margin: 2 };

    const errorStyle: React.CSSProperties = {
      color: "red",
      textDecoration: "italic",
      fontSize: "1.2em",
    };

    const rowFlex: React.CSSProperties = {
      display: "flex",
      flexDirection: "row"
    };

    const columnFlex: React.CSSProperties = {
      display: "flex",
      flexDirection: "column"
    };

    const buttonStyle: React.CSSProperties = Object.assign({}, somePadding, {display: "inline-block", width: "max-content"});

      return (
      <div className="App">
        <div style={rowFlex}>
          <div style={somePadding}>Project Name:</div>
          <input name="nameVal" value={this.state.nameVal} style={somePadding} onChange={this.handleChange} />
        </div>

        <div style={rowFlex}>
          <div style={somePadding}>Project Description:</div>
          <input name="descriptionVal" value={this.state.descriptionVal} style={somePadding} onChange={this.handleChange} />
        </div>

        <button onClick={this.onSubmit} style={buttonStyle}>Submit</button>
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
      const id = this.props.id;

      if (this.state.newProject) {
        let data = {name, description};
        await this.addProject(data);
      } else {
        let data = {id, description};
        await this.editProject(data);
      }
    }
  }

  async addProject({name, description}: {name: string, description: string}) {
    let res: any = await post("api/createproject", {name, description});

    if(res["success"]) {
        this.setState({error: ""});
        console.log("Project added");
    } else {
        this.setState({error: res["error"]});
    }
  }

  async editProject({id, description}: {id: number, description: string}) {
    let res: any = await post("api/editproject", {id, description});

    if(res["success"]) {
        console.log("Project edited");
        this.setState({editingProject: false});
    } else {
        this.setState({error: res["error"]});
    }
  }
}

export default CreateProject;
