import React, { Component } from 'react';
import { post, get, handleChange } from './utils';

type State = Readonly<typeof initialState>;
type Props = Readonly<{}>;
type Project = {
      description: string, 
      id: string, 
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
    }
  render() {
      let projectList = this.state.showingProjects.map(p => <p>{p.name}: {p.description}</p>);
      let textBox = <input onChange={this.handleChange} name="searchBox" />
      return <div>{textBox}<br /> {projectList}</div>;
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
