import React, { Component } from 'react';
import { post, get, handleChange } from './utils';

type State = Readonly<{
  nameVal: string,
  descriptionVal: string,
  error: string,
}>;
type Props = Readonly<{}>;

class CreateProject extends Component {
  readonly state: State;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  constructor(props: Props) {
    super(props);

    this.state = {
      nameVal: "",
      descriptionVal: "",
      error: ""
    }

    this.handleChange = handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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
          <input name="nameVal" style={somePadding} onChange={this.handleChange} />
        </div>

        <div style={rowFlex}>
          <div style={somePadding}>Project Description:</div>
          <input name="descriptionVal" style={somePadding} onChange={this.handleChange} />
        </div>

        <button onClick={this.onSubmit} style={buttonStyle}>Submit Project</button>
      </div>
      );
  }

  async onSubmit() {
    if (this.state.nameVal === "" || this.state.descriptionVal === "") {
      this.setState({error: "You must include a name and description"});
    } else {
      const name = this.state.nameVal;
      const description = this.state.descriptionVal;

      let data = {name, description};

      await this.addProject(data);
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
}

export default CreateProject;
