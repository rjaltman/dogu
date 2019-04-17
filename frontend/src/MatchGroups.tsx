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

const initialState = {
  courseId: -1,
  courseList: {[key: number]: string},
  showingListings: [] as Listing[]
}

type State = Readonly<typeof initialState>;

class MatchGroups extends Component<Props, any> {
  readonly state: State = initialState;

  constructor(props: Props) {
    super(props);

    this.handleChange = handleChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.getCourseOptions = this.getCourseOptions.bind(this);
    this.onMatchGroups = this.onMatchGroups.bind(this);
  }

  render() {
    // drop down of courses
    // match groups button
    // display group listing of current course
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

  async loadGroups() {
    let res = await get ("api/group/studentGroupListing", {courseid: this.state.courseId});

    if(res["success"]) {
      this.setState({showingListings: res["listing"]});
    } else {
      this.setState({showingListings: []});
      console.log(res["error"]);
    }
  }

  async onMatchGroups() {
    let res = await post ("api/group/runGroupMatch", {courseid: this.state.courseId});

    if(res["success"]) {
      // uhhhhhhh
    } else {
      console.log(res["error"]);
    }
  }
}

export default MatchGroups;
