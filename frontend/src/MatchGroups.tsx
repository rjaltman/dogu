import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/register.css';

interface Props {
  pageHandler?: (page: string, pid: number) => void
};

type Listing = {
  studentName: string,
  studentId: number,
  projectName: string,
  projectId: number
}

type State = Readonly<{
  courseId: number,
  courseList: {[key: number]: string},
  showingListings: Listing[]
}>;

const initialState = {
  courseId: -1,
  courseList: [],
  showingListings: [] as Listing[]
}

class MatchGroups extends Component<Props, any> {
  readonly state: State = initialState;

  constructor(props: Props) {
    super(props);

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.getCourseOptions = this.getCourseOptions.bind(this);
    this.onMatchGroups = this.onMatchGroups.bind(this);
  }

  render() {
    // drop down of courses
    let university =
        <select name="courseId" onChange={this.handleSelectChange} value={this.state.courseId}>
          {this.getCourseOptions()}
        </select>

    // match groups button
    let matchGroups = <button onClick={this.onMatchGroups}>Create Project Groups for Course</button>

    // list groups
    let groupListing = this.state.showingListings.map(l => <p>{l.studentName}, {l.projectName}</p>);

    // Arrow function from blank with the help of StackOverflow, see: https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
    let classTitle = <div id="enroll_leadin">
                        <i className="material-icons blue">&#xe3e4;</i>
                        <span className="title blue">Match Students to Groups</span>
                        <span className="subtitle">Below are the courses currently eligible for student assignment to projects. The process is based on the
                        Freiheit-Wood paper cited in the application's documentation. To start the process, select a project from the dropdown and run
                        with the "Create Project Groups for Course" button.</span>
                        </div>

      let courseBg = <div id="add_course_background">
                          <i className="material-icons">&#xe80c;</i>
                        </div>

    return <div id="search_container">{courseBg}{classTitle}<div id="match_groups_container"><p>{university} <br /> {matchGroups} <br /> {groupListing}</p></div></div>;
  }

  componentDidMount() {
    this.loadGroups(this.state.courseId);
    this.loadAllCourses();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
      if (this.state.courseId !== prevState.courseId) {
          this.loadGroups(this.state.courseId);
      }
  }

  handleSelectChange(event: React.FormEvent<HTMLSelectElement>) {
    this.setState({courseId: event.currentTarget.value});
  }

  getCourseOptions() {
    var courses:JSX.Element[] = [];
    for (var key in this.state.courseList) {
      courses.push(<option key={key} value={key}>{this.state.courseList[key]}</option>);
    }
    return courses;
  }

  async loadAllCourses() {
      let res = await get("api/listCourses");
      if(res["success"]) {
          this.setState({ courseList: res["courses"] })
          if (this.state.courseList != {}) {
            this.setState({ courseId: Object.keys(res["courses"])[0] })
          }

      } else {
          this.setState({courseList: []})
          console.log(res["error"])
      }
  }

  async loadGroups(courseid: number) {
    if (courseid != -1) {
      let res = await get(`api/group/studentGroupListing/${courseid}`);

      if(res["success"]) {
        this.setState({showingListings: res["listing"]});
      } else {
        this.setState({showingListings: []});
        console.log(res["error"]);
      }
    }
  }

  onMatchGroups() {
    if (this.state.courseId != -1) {
      this.matchGroups();
    } else {
      console.log("You must provide a valid course");
    }
  }

  async matchGroups() {
    let res = await post("api/group/runGroupMatch", {courseid: this.state.courseId});

    if(res["success"]) {
      this.loadGroups(this.state.courseId);
    } else {
      console.log(res["error"]);
    }
  }
}

export default MatchGroups;
