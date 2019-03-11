import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

type State = Readonly<{nameValue: string, ageValue: string, people: Array<[string, number]>}>;
type AppProps = Readonly<{}>;
const initialState: State = {people: [], nameValue: "", ageValue: ""};
class App extends Component {
    state: State = initialState;
    constructor(props: AppProps) {
        super(props);
        this.refreshPeople();
    }
  render() {
      let peoplePart: React.ReactElement[] | null;
      if(this.state["people"].length === 0) {
          peoplePart = null; ;
      } else {
          peoplePart = this.state.people.map(([k, v]) => <p onClick={this.deletePerson.bind(this, k)} key={k}>{k}: {v}</p>);
      }
    return (
      <div className="App">
          <h1>
              DOGU
          </h1>
          <h2>
              How can dogs be real if our eyes aren't real?
          </h2>
          Name: <input value={this.state.nameValue} onChange={(e) => this.setState({nameValue: e.target.value})} />
          <br />
          Age: <input value={this.state.ageValue} onChange={(e) => this.setState({ageValue: e.target.value})} />
          <div onClick={this.sendNewName.bind(this)}>
              Make a person!
          </div>
          {peoplePart === null ? <img src="https://media.giphy.com/media/3o7bu8sRnYpTOG1p8k/source.gif" height="20" width="20"/> : peoplePart}
      </div>
    );
  }

  refreshPeople() {
      fetch("/api/")
        .then((resp) => resp.json())
        .then((jsonObj: Array<[string, number]>) => {
            this.setState({people: jsonObj});
        });
  }

    mapOverMap<K, V, O>(m: Map<K, V>, f: (key: K, value: V) => O): O[] {
        let out: O[] = [];
        for(let pair of m) {
            let key = pair[0];
            let value = pair[1];
            out.push(f(key, value));
        }
        return out;
    }

  sendNewName() {
      let name = this.state.nameValue;
      let age = parseInt(this.state.ageValue);
      let payload = {name, age};
      let headers = {"Content-Type": "application/json"};
      fetch("api/insert", {method: "POST", body: JSON.stringify(payload), headers})
          .then(res => res.json())
          .then(jsonObj => { 
              if(jsonObj["status"] !== "success") {
                  console.log("That didn't work");
              } else {
                  this.refreshPeople();
              }
          });
  }

  deletePerson(name: string) {
      let headers = {"Content-Type": "application/json"};
      let body = {name};
      fetch("api/delete", {method: "POST", body: JSON.stringify(body), headers})
          .then(res => res.json()) 
          .then(jsonObj => {
              if(jsonObj["status"] === "success")
                  this.refreshPeople();
          });
  }
}

export default App;
