import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

type State = Readonly<typeof initialState>
type AppProps = Readonly<{}>;
const initialState = {people: new Map<string, number>()};
class App extends Component {
    readonly state: State = initialState;
    constructor(props: AppProps) {
        super(props);
        fetch("/api/")
            .then((resp) => resp.json())
            .then((jsonObj: Object) => {
                this.setState({people: new Map(Object.entries(jsonObj))});
            });
    }
  render() {
      let peoplePart: React.ReactElement[] | null;
      if(this.state["people"].size === 0) {
          peoplePart = null; ;
      } else {
          peoplePart = this.mapOverMap(this.state["people"], (k, v) => <p key={k}>{k}: {v}</p>);
      }
    return (
      <div className="App">
          <h1>
              DOGU
          </h1>
          <h2>
              How can dogs be real if our eyes aren't real?
          </h2>
          {peoplePart === null ? <img src="https://media.giphy.com/media/3o7bu8sRnYpTOG1p8k/source.gif" height="20" width="20"/> : peoplePart}
      </div>
    );
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
}

export default App;
