import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/register.css';

interface Props {
  pageHandler?: (page: string, pid: number) => void
};

type Listing = {
  studentname: string,
  studentid: number,
  projectname: string,
  projectid: number
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
    let groupListing = this.state.showingListings.map(l => <p>{l.studentname}, {l.projectname}</p>);

    return <p>{university} <br /> {matchGroups} <br /> {groupListing}</p>;
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
