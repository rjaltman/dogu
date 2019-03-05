import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

type State = Readonly<{people: Array<[string, number]>}>;
type AppProps = Readonly<{}>;
const initialState: State = {people: []};
class App extends Component {
    state: State = initialState;
    constructor(props: AppProps) {
        super(props);
        fetch("/api/")
            .then((resp) => resp.json())
            .then((jsonObj: Array<[string, number]>) => {
                this.setState({people: jsonObj});
            });
    }
  render() {
      let peoplePart: React.ReactElement[] | null;
      if(this.state["people"].length === 0) {
          peoplePart = null; ;
      } else {
          peoplePart = this.state.people.map(([k, v]) => <p key={k}>{k}: {v}</p>);
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
