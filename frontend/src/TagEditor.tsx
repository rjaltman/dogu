import React, { Component } from 'react';
import './css/project.css';
import { handleChange } from './utils';

interface Props {
  tags: string[],
  onTagChange: (tags: string[]) => void
};
type State = Readonly<typeof initialState>;

const initialState = {
    newTag: "",
    makingNewTag: false,
};

export default class TagEditor extends Component<Props, any> {
    readonly state: State = initialState;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    newTagBox: React.RefObject<HTMLInputElement> = React.createRef();
    constructor(props: Props) {
        super(props);
        this.handleChange = handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if(this.state.makingNewTag && !prevState.makingNewTag && this.newTagBox.current !== null)
            this.newTagBox.current.focus();
    }
    render() {
      let deleteFunction = (name: string) => {
          return (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              this.removeTag(name);
          };
      };

      let deleteButton = <div className="deleteButton">x</div>;
      let tags = this.props.tags.map((t) => <div key={t} onClick={deleteFunction(t)} className="tag">{t}{deleteButton}</div>);

      if (this.state.makingNewTag) {
          let tagBox = <div key="saldkfjioqwejhfoiasf809vuqwer90fua9sdfjoijalskdfj" className="tag"><input name="newTag" value={this.state.newTag} ref={this.newTagBox} onKeyDown={this.checkEnterKey.bind(this)} onChange={this.handleChange} /></div>;
          tags.push(tagBox);
      } else {
          let plusButton = <div key="saldkfj9u40r9uqdjflaksjf04if0ifsadofi49it09iasdwjfoij5oifjaowijf" onClick={() => this.setState({makingNewTag: true})} className="plusButton"> + </div>;
          tags.push(plusButton);
      }

      let tagDiv = <div className="tagDiv">{tags}</div>;
      return tagDiv;
    }

  checkEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
      const ENTER_KEY: number = 13;
      if(e.which === ENTER_KEY) {
          let newTag = this.state.newTag;
          this.addTag(newTag);
          this.setState({newTag: "", makingNewTag: false});
      }
  }

  removeTag(tag: string) {
      let tags = this.props.tags.slice();
      if(tags === null) {
          console.error("God help us all");
          return;
      }
      let index = tags.indexOf(tag)
      console.assert(index !== -1);
      tags.splice(index, 1);
      this.props.onTagChange(tags);
  }

  addTag(tag: string) {
      let tags = this.props.tags.slice();
      if(tags === null) {
          console.error("God help us all again");
          return;
      }
      if(tags.indexOf(tag) !== -1) {
          return;
      }
      tags.push(tag);
      this.props.onTagChange(tags);
  }
}
