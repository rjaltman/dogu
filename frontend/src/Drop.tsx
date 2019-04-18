import React, { Component } from 'react';
import { post, get, handleChange } from './utils';

interface Props {
  id: number,
  pageHandler?: (page: string, pid: number) => void
}

type State = Readonly<{
  showingCourses: Course[],
  nameOfCourse: string
}>;

type Course = {
    id: number,
    crn: string,
    university_id: number,
    term: string,
    title: string,
    groupsizelimit: number
};

class Drop extends Component<Props, any> {
    readonly state: State = {showingCourses: [] as Course[], nameOfCourse: ""}
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

    constructor(props: Props) {
        super(props);

        this.handleChange = handleChange.bind(this);
    }

    componentDidMount() {
        this.loadCourses();
    }

    render() {
      let classTitle = <div id="enroll_leadin">
                          <i className="material-icons orange">&#xe15c;</i>
                          <span className="title orange">Drop a course</span>
                          <span className="subtitle">Below are the courses you are currently enrolled in. To remove a course, simply click
                          on its tile, or use the "Drop Course" button below.</span>
                          </div>

        let courseBg = <div id="add_course_background">
                            <i className="material-icons">&#xe80c;</i>
                          </div>

        let courseInfo = <span></span>
        if (this.state.nameOfCourse != "") {
          courseInfo = <div id="change_processed_notification"><i className="material-icons">&#xe877;</i> Successfully dropped course <i>{this.state.nameOfCourse}</i>.</div>
        }

        let courseList = this.state.showingCourses.map((p: Course) => <div className="search_tile" key={p.id} onClick={() => this.courseClick(p.id, p.title)}>
                                                            <span className="title">{p.title}</span> <span className="subtitle">{p.crn}</span><button>Drop Course</button></div>);
        return <div id="search_container">{courseBg}{classTitle}{courseInfo}<div id="search_results">{courseList}</div></div>
    }

    async courseClick(cid: number, title: string) {
        await this.dropCourse(cid, title)
        this.loadCourses()
    }

    async dropCourse(cid: number, title: string) {
        let res: any = await post('api/drop_course', {cid});

        if(res["success"]) {
            console.log("Course dropped");
            //show course has been dropped
            this.setState({nameOfCourse: title});
        } else {
            console.log("error")
            alert("Failed to drop " + cid)
        }
    }

    async loadCourses() {
        let res = await get(`api/courses_to_drop`);
        if(res["success"]) {
            this.setState({showingCourses: res["courses"]})
        } else {
            this.setState({showingCourses: []})
            console.log(res["error"])
        }
    }
}

export default Drop;
