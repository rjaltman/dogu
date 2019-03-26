import React, { Component } from 'react';
import { post, get, handleChange } from './utils';
interface HomeProps {
    username? : string,
    password?: string,
    onAuth?: (username: string) => void
};

type State = Readonly<{
    usernameVal: string,
    passwordVal: string,
    passwordVal2: string,
    positionVal: "Instructor" | "Student" | "Organizer",
    deptVal: string,
    emailVal: string,
    error: string,
    registering: boolean,
}>;

/*
 * This is the Component that handles logging into
 * the app. For the time being, it also handles registration,
 * but that should probably change soon. (cf. #7).
 * It's prop inputs are the default username, the default
 * password (which I suspect will never be used), and a function
 * taking the username as its input that will be called when the user
 * successfully logs in. Presumably, this function will change the
 * state of the caller so as to go to the next logical state of the
 * application.
 */
class Home extends Component {
  constructor(props: HomeProps) {
      super(props);
  }
  render() {
      return <div id="no_id">Hello, world!</div>;
  }
}

export default Home;
