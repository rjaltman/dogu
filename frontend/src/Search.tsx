import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
import './css/dash.css';

type State = Readonly<typeof initialState>;
interface Props {
  pageHandler?: (page: string, pid: number) => void
};
type Project = {
      description: string,
      id: number,
      name: string,
      organization_id: number,
      startdate: string,
      status: string,
      university_id: number
    };
const initialState = {searchBox: "", showingProjects: [] as Project[]}
class Search extends Component<Props, any> {
    readonly state: State = initialState;
    constructor(props: Props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.projectClick = this.projectClick.bind(this);
    }
  render() {
      // Arrow function from blank with the help of StackOverflow, see: https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
      let projectList = this.state.showingProjects.map(p => <p key={p.id} onClick={() => this.projectClick(p.id)}>{p.name}: {p.description}</p>);
      let textBox = <input className="searchbox" onChange={this.handleChange} name="searchBox" />
      return <div>{textBox}<br /> {projectList}</div>;
  }
  projectClick(id: number) {
    if (this.props.pageHandler !== undefined)
      this.props.pageHandler("display_project",id);
  }
  componentDidMount() {
      this.loadNewProjects();
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      handleChange.bind(this)(e);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
      if(this.state.searchBox !== prevState.searchBox) {
          this.loadNewProjects();
      }
  }

  async loadNewProjects() {
      let searchTerms = this.state.searchBox.split(/\s+/);
      let qString = new URLSearchParams();
      for(let term of searchTerms) {
          if(term !== '')
            qString.append('q', term);
      }

      let res = await get(`api/search?${qString.toString()}`);
      if(res["success"]) {
          this.setState({showingProjects: res["projects"]})
      } else {
          this.setState({showingProjects: []})
          console.log(res["error"])
      }
  }

}


export default Search;
