import React, { Component } from 'react';
import { post, get, handleChange } from './utils';

interface Props {
  id: number,
  pageHandler?: (page: string, pid: number) => void
}

type State = Readonly<{
  showingCourses: Course[]
}>;

type Course = {
    id: number,
    crn: string,
    university_id: number,
    term: string,
    groupsizelimit: number
};

class Enroll extends Component<Props, any> {
  readonly state: State = {showingCourses: [] as Course[]}
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  constructor(props: Props) {
    super(props);

    this.handleChange = handleChange.bind(this);
  }

  componentDidMount() {
    this.loadCourses();
  }

  render() {
    return <div></div>
  }

  async addCourse(cid: number) {
    let res: any = await post('api/add_course/${cid}', {});

    if(res["success"]) {
        console.log("Course added");
        //show course has been added
    } else {
        console.log("error")
    }
  }

  async dropCourse(cid: number) {
    let res: any = await post('api/drop_course/${cid}', {});

    if(res["success"]) {
        console.log("Course dropped");
        //show course has been dropped
    } else {
        console.log("error")
    }
  }

  async loadCourses() {
    let res = await get(`api/courses`);
    if(res["success"]) {
        this.setState({showingCourses: res["courses"]})
    } else {
        this.setState({showingCourses: []})
        console.log(res["error"])
    }
}
}

export default Enroll;
