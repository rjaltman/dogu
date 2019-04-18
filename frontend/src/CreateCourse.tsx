import React, { Component } from 'react';
import { post, get, handleChange } from './utils';

interface Props {
  id: number,
  pageHandler?: (page: string, pid: number) => void
}

type State = Readonly<{
  nameVal: string,
  descriptionVal: string,
  semesterVal: string,
  courseCodeVal: string,
  groupsizemin: number,
  groupsizemax: number,
  maxrankings: number,
  newProject: boolean,
  error: string,
}>;

type Course = {
    id: number,
    crn: string,
    university_id: number,
    term: string,
    title: string,
    groupsizelimit: number
};

class CreateCourse extends Component<Props, any> {
  readonly state: State;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  constructor(props: Props) {
    super(props);

    this.state = {
        nameVal: "",
        descriptionVal: "",
        semesterVal: "",
        courseCodeVal: "",
        groupsizemin: 0,
        groupsizemax: 0,
        maxrankings: 1,
        newProject: true,
        error: ""
    }

    this.handleChange = handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {

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
                                <span className="title">Let's start a new course.</span>
                              </div>;
    }

      return (
      <div className="App">
        <div id="create_project_background">
          <i className="material-icons">&#xe886;</i>
        </div>
        <div id="create_project_container">
          {create_project_leadin}
          <div id="create_project_form">
            <div style={rowFlex}>
              <div style={somePadding}>What is the name of the course?</div>
              <input className="name" name="nameVal" value={this.state.nameVal} placeholder="e.g. 'Database Systems'" onChange={this.handleChange} />
            </div>

            <div style={rowFlex}>
              <div style={somePadding}>Give a brief description for other students.</div>
              <input className="description" name="descriptionVal" value={this.state.descriptionVal} placeholder="Enter your description here." onChange={this.handleChange} />
            </div>

            <div style={rowFlex}>
              <div style={somePadding}>What semester is this course being offered in?</div>
              <input className="name" name="semesterVal" value={this.state.semesterVal} placeholder="e.g. 'SP19'" onChange={this.handleChange} />
            </div>

            <div style={rowFlex}>
              <div style={somePadding}>What course code is associated with this course?</div>
              <input className="name" name="courseCodeVal" value={this.state.courseCodeVal} placeholder="e.g. 'CS411'" onChange={this.handleChange} />
            </div>

            <div style={rowFlex}>
              <div style={somePadding}>How small to large can groups be in this course?</div>
              <input type="number" className="number" name="groupsizemin" value={this.state.groupsizemin} onChange={this.handleChange} /> <span className="to">to</span> 
              <input type="number" className="number" name="groupsizemax" value={this.state.groupsizemax} onChange={this.handleChange} />
            </div>

            <div style={rowFlex}>
              <div style={somePadding}>For group matching, how many project preferences can a student provide?</div>
              <input type="number" className="number" name="maxrankings" value={this.state.maxrankings} onChange={this.handleChange} />
            </div>

            <button onClick={this.onSubmit}>Submit</button>
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
      const semester = this.state.semesterVal;
      const crn = this.state.courseCodeVal;
      const groupsizemin = this.state.groupsizemin;
      const groupsizemax = this.state.groupsizemax;
      const maxrankings = this.state.maxrankings;

      let data = {name, description, semester, crn, groupsizemin, groupsizemax, maxrankings};
      await this.addCourse(data);

    }
  }

  async addCourse({name, description, semester, crn, groupsizemin, groupsizemax, maxrankings}: {name: string, description: string, semester: string, crn: string, groupsizemin: number, groupsizemax: number, maxrankings: number}) {
    let res: any = await post("api/createcourse", {name, description, semester, crn, groupsizemin, groupsizemax, maxrankings});

    if(res["success"]) {
        this.setState({error: ""});
        console.log("Project added");
        if (this.props.pageHandler !== undefined)
          this.props.pageHandler("display_project", res["project"]["id"]);
    } else {
        this.setState({error: res["error"]});
    }
  }

}

export default CreateCourse;
