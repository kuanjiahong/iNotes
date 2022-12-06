import logo from './logo.svg';
import './App.css';
import $ from 'jquery';
import React from 'react';


class iNotes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false,
      userId: "",
      user:"",
      notes:"",
      activeNote: [],
    }

    this.onLoggedIn = this.onLoggedIn.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.getActiveNote = this.getActiveNote.bind(this)
    
  }

  componentDidMount() {
    $.ajax({
      method: "GET",
      url: "http://localhost:3001/load",
      xhrFields: { withCredentials: true },
      success: (result) => {
        if (result === "") {
          return null;
        } else {
          this.onLoggedIn(result)
        }
      },
      error: (err) => console.error(err)
    });
  }

  getActiveNote(noteId) {
    console.log(`Note clicked: ${noteId}`);
    $.ajax({
      method: "GET",
      data:{
        noteid: noteId
      },
      url: "http://localhost:3001/getnote",
      xhrFields: { withCredentials: true },
      success: (result) => {
        console.log(`getActiveNote: ${result}`);
        this.setState({activeNote: result.note})
      },
      error: (err) => alert("Error: " + err),
    });
  }

  onLoggedIn(serverReponse) {
    console.log(serverReponse)
    this.setState({
      user: serverReponse.user,
      notes: serverReponse.notes,
      loggedIn: true,
    })
  }

  onLogout() {
    $.ajax({
      method: "GET",
      url: "http://localhost:3001/logout",
      xhrFields: { withCredentials: true },
      success: () => this.setState({
        loggedIn: false,
        userId: "",
        user:"",
        note:"",
        activeNote: []
      }),
      error: (err) => alert("Error: " + err),
    });
  }

  render() {
    if (this.state.loggedIn) {
      return (
        <div>
          <Header icon={this.state.user.icon} name={this.state.user.name} onLogout={this.onLogout}/>
          <Sidebar notes={this.state.notes} getActiveNote={this.getActiveNote}/>
          <Dashboard activeNote={this.state.activeNote}/>
        </div>
      )
    } else {
      return <LoginForm onLogin={this.onLoggedIn} />
    }
  }
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      notes: props.notes,
      searchString: "",
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }

  
  handleSubmit(event) {
    event.preventDefault();
    $.ajax({
      method: "GET",
      data: {
        searchstr: this.state.searchString,
      },
      xhrFields: { withCredentials: true },
      url: "http://localhost:3001/searchnotes",
      success: (result) => {console.log(result)},
      error: (err) => {alert("Error: " + err)},
    });
  }

  render() {
    const length = this.state.notes.length;
    const notes = this.state.notes;
    if (length > 0) {
      return (
      <menu>
        <form onSubmit={this.handleSubmit}>
          <input type="text" onChange={this.handleInputChange} name="searchString" placeholder='Search Notes' />
        </form>
        <p>Notes ({length})</p>
        <ul>
          {
           notes.map(note => <li key={note._id} onClick={()=>{this.props.getActiveNote(note._id)}}>{note.title}</li>)
          }
        </ul>
      </menu>

      )
    } else {
      return <p>No notes</p>
    }
  }



}


class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addNote: false
    }
    this.handleNewNoteClicked = this.handleNewNoteClicked.bind(this)
    this.saveClicked = this.saveClicked.bind(this)
    this.cancelClicked = this.cancelClicked.bind(this)
  }

  handleNewNoteClicked() {
    this.setState({addNote: true})
  }

  saveClicked() {
    this.setState({addNote: false})
  }

  cancelClicked() {
    this.setState({addNote: false})
  }

  render() {
    if (this.state.addNote) {
      return (
        <div>
          <p>When new note is clicked</p>
          <NewNotePage saveClicked={this.saveClicked} cancelClicked={this.cancelClicked}/>
        </div>
      )
    } else if (this.props.activeNote.length > 0) {
      return(
        <div>
          <p>When a note is clicked</p>
          <p>Last saved time: {this.props.activeNote[0].lastsavedtime}</p>
          <p>Title: {this.props.activeNote[0].title}</p>
          <p>Content: {this.props.activeNote[0].content}</p>
          <AddNote onNewNoteClicked={this.handleNewNoteClicked}/>
        </div>
      ) 
    } else {
      return (
        <div>
          <p>When user first logged in</p>
          <AddNote onNewNoteClicked={this.handleNewNoteClicked} />
        </div>
      )
    }
  }
}

class NewNotePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: "",
      content: "",
      lastsavedtime: ""
    }
  }


  render() {
    return (
    <div>
      <button type="button" onClick={this.props.saveClicked}>Save</button>
      <button type="button" onClick={this.props.cancelClicked}>Cancel</button>
    </div>
    )
  }
}

function AddNote(props) {
  return <button type="button" onClick={props.onNewNoteClicked}>New Note</button>
}

function Header(props) {
  return (
    <div>
      <h1>iNotes</h1>
      <img src={"http://localhost:3001/" + props.icon} alt="user-icon"/>
      <p>{props.name}</p>
      <LogoutButton onLogout={props.onLogout} />
    </div>
  )
}

function LogoutButton(props) {
  return <button type="button" onClick={props.onLogout}>Logout</button>
}


class LoginForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: "",
      password: "",
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }


  handleSubmit(event) {
    event.preventDefault();
    $.ajax({
      method: "POST",
      data: {
        name: this.state.name,
        password: this.state.password,
      },
      xhrFields: { withCredentials: true },
      url: "http://localhost:3001/signin",
      success: (result) => {this.props.onLogin(result)},
      error: (err) => {alert("Error: " + err)},
    });
  }

  render() {
    return (
      <div>
        <h1>iNotes</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
          </label>
            <input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} placeholder="Name" />
          <label>
            Password:
          </label>
            <input type="password" name="password" value={this.state.password} onChange={this.handleInputChange} placeholder="Password" />
          <input type="submit" value="Sign in"/>
        </form>
      </div>
    )
  }
}



export default iNotes;