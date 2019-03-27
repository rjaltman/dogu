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
    let gridStyle: (row: number, column: number) => React.CSSProperties = (row, column) => ({
          gridColumnStart: column,
          grodColumnEnd: "span 1",
          gridRowStart: row,
          gridRowEnd: "span 1",
    });

    return (
      <div className="App">
        <div style={{display: "inline-grid", gridTemplateRows: "repeat(3, auto)", gridTemplateColumns: "repeat(2,auto)", width: "auto"}}>
        <input style={gridStyle(1,2)} value={this.state.nameVal} onChange={(e) => this.setState({nameVal: e.target.value})} />

        <br />

        <input style={gridStyle(2,2)} value={this.state.descriptionVal} onChange={(e) => this.setState({descriptionVal: e.target.value})} />
          <div onClick={this.onSubmit.bind(this)}>
              Submit Project
          </div>
        </div>
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
