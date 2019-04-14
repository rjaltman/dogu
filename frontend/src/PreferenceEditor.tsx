import React, { Component } from 'react';
import './css/preferences.css';
import { get, post } from './utils';
import { Project } from './ProjectDisplay';

interface Props {
};

type State = Readonly<typeof initialState>;

const initialState = {
    projects: null as null | Project[]
};

export default class PreferenceEditor extends Component<Props, any> {
    readonly state: State = initialState;
    constructor(props: Props) {
        super(props);
    }
    componentDidMount() {
        this.getProjects();
    }
    render() {
        if(this.state.projects === null) {
            return <img width="100" src="https://media.giphy.com/media/3o7bu8sRnYpTOG1p8k/source.gif" />
        } else {
            let projectDivs = this.state.projects.map((p, idx) =>
                <div style={{display: "flex", alignItems: "center"}} key={idx}>
                    <div style={{margin: "10px"}}>
                            { p.name }
                </div>
                <div style={{display: "flex-vertical"}}>
                    <div onClick={this.increaseRank.bind(this, idx)}>&#x25B2;</div>
                    <div onClick={this.decreaseRank.bind(this, idx)}>&#x25BC;</div>
                </div>
                </div>
            );
            return projectDivs;
        }
    }
    async getProjects() {
        let res: any = await get("api/project/preference");
        if(res["success"]) {
            this.setState({projects: res["projects"]});
        } else {
            console.error(res["error"]);
        }
    }

    async increaseRank(index: number) {
        if(this.state.projects !== null) {
            if(index === 0)
                return;
            let newProjects = this.state.projects.slice();
            // Swap the project at index with the one above it
            let temp = newProjects[index];
            newProjects[index] = newProjects[index - 1];
            newProjects[index - 1] = temp;
            this.setState({projects: newProjects});
                                                                                                    // minus to increase rank
                                                                                                    // plus one because it's 1-indexed
                                                                                                    // on the server
            let res: any = await post("api/project/preference/set", {id: newProjects[index - 1].id, rank: index - 1 + 1});
            if(res["success"]) {
                await this.getProjects();
                return;
            } else {
                console.error(res["error"]);
            }
        } else {
            console.error("WELP");
        }
    }

    async decreaseRank(index: number) {
        if(this.state.projects !== null) {
            if(index === this.state.projects.length - 1)
                return;
            let newProjects = this.state.projects.slice();
            // Swap the project at index with the project below it
            let temp = newProjects[index];
            newProjects[index] = newProjects[index + 1];
            newProjects[index + 1] = temp;
            this.setState({projects: newProjects});
                                                                                                    // plus to decrease rank
                                                                                                    // plus one because it's 1-indexed
                                                                                                    // on the server
            let res: any = await post("api/project/preference/set", {id: newProjects[index + 1].id, rank: index + 1 + 1});
            if(res["success"]) {
                await this.getProjects();
                return;
            } else {
                console.error(res["error"]);
            }
        } else {
            console.error("WELP");
        }
    }
}
