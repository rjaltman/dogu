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
    title: string,
    groupsizelimit: number
};

class Drop extends Component<Props, any> {
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
        let courseList = this.state.showingCourses.map((p: Course) => <div className="search_tile" key={p.id} onClick={() => this.courseClick(p.id)}>
                                                            <span className="title">{p.title}</span> <span className="subtitle">{p.crn}</span></div>);
        return <div id="search_container"><div id="search_results">{courseList}</div></div>
    }

    courseClick(cid: number) {
        this.dropCourse(cid)
        this.loadCourses()
    }

    async dropCourse(cid: number) {
        let res: any = await post('api/drop_course', {cid});

        if(res["success"]) {
            console.log("Course dropped");
            //show course has been dropped
            alert("Successfully added " + cid)
        } else {
            console.log("error")
            alert("Failed to add " + cid)
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
