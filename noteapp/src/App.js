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

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.getActiveNote = this.getActiveNote.bind(this)
    
    this.createNote = this.createNote.bind(this)
    this.updateNote = this.updateNote.bind(this)
    this.deleteNote = this.deleteNote.bind(this)
    
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
          this.handleLogin(result)
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

  createNote(title, content, timestamp) {
    alert("Create Note on backend");
    alert(`Note created! title: ${title} Content: ${content}  Timestamp: ${timestamp}`);

  }

  updateNote(title, content, timestamp) {
    alert("Update note on backend");
    alert(`Note updated! title: ${title} Content: ${content}  Timestamp: ${timestamp}`);
  }

  deleteNote(noteId) {
    alert(`Note ${noteId} is deleted`);
  }

  
  handleLogin(serverReponse) {
    console.log(serverReponse)
    if (serverReponse.user) {
      this.setState({
        user: serverReponse.user,
        notes: serverReponse.notes,
        loggedIn: true,
      })
    } else {
      alert("Login failure");
    }
 
  }

  handleLogout() {
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
          <Header icon={this.state.user.icon} name={this.state.user.name} handleLogout={this.handleLogout}/>
          <Sidebar notes={this.state.notes} getActiveNote={this.getActiveNote}/>
          <Dashboard activeNote={this.state.activeNote} deleteNote={this.deleteNote} createNote={this.createNote} updateNote={this.updateNote} />
        </div>
      )
    } else {
      return <LoginForm handleLogin={this.handleLogin} />
    }
  }
}

class Sidebar extends React.Component {
  // TODO sort notes in reverse chronological order
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
      addNoteMode: false,
      editNoteMode: false,
    }
    this.changeToAddMode = this.changeToAddMode.bind(this)
    this.changeToEditMode = this.changeToEditMode.bind(this)
    this.saveClicked = this.saveClicked.bind(this)
    this.deleteClicked = this.deleteClicked.bind(this)
    this.cancelClicked = this.cancelClicked.bind(this)
  }


  changeToAddMode() {
    console.log("New note button clicked");
    this.setState({addNoteMode: true})
  }

  changeToEditMode() {
    console.log("Change to edit mode");
    this.setState({editNoteMode: true})
  }

  saveClicked(title, content, timestamp, mode) {
    alert(`Note saved! title: ${title} Content: ${content}  Timestamp: ${timestamp}`);
    this.setState({addNoteMode: false,editNoteMode: false})
    if (mode === "NEW") {
      this.props.createNote(title, content, timestamp);
    } else if (mode === "UPDATE") {
      this.props.updateNote(title, content, timestamp);
    }
  }

  deleteClicked(noteId) {
    if (window.confirm("Confirm to delete this note?")) {
      this.props.deleteNote(noteId);
    }
  }

  cancelClicked() {
    if (window.confirm("Are you sure you want to cancel?")) {
      this.setState({addNoteMode: false, editNoteMode: false})
    }
  }

  render() {
    if (this.state.addNoteMode) {
      return (
        <div>
          <p>When new note is clicked</p>
          <NewNotePage saveClicked={this.saveClicked} cancelClicked={this.cancelClicked}/>
        </div>
      )
    } else if (this.state.editNoteMode) {
      return (
        <EditNotePage activeNote={this.props.activeNote} saveClicked={this.saveClicked} cancelClicked={this.cancelClicked} />
      )
    } 
    else if (this.props.activeNote.length > 0) {
      return(
        <div>
          <p>When a note is clicked</p>
          <button type="button" onClick={()=>this.deleteClicked(this.props.activeNote[0]._id)}>Delete</button>
          <p onClick={this.changeToEditMode}>Title: {this.props.activeNote[0].title}</p>
          <p onClick={this.changeToEditMode}>Content: {this.props.activeNote[0].content}</p>
          <button type="button" onClick={this.changeToAddMode}>New Note</button>
        </div>
      ) 
    } else {
      return (
        <div>
          <p>When user first logged in</p>
          <button type="button" onClick={this.changeToAddMode}>New Note</button>
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
    this.handleInputChange = this.handleInputChange.bind(this)

  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }


  render() {
    return (
    <div>
      <label>Title</label>
      <input type="text" name="title" placeholder='Note title' onChange={this.handleInputChange}/>
      <label>Content </label>
      <textarea name="content" value={this.state.value} placeholder="Note content" onChange={this.handleInputChange} />
      <button type="button" onClick={()=>{this.props.saveClicked(this.state.title, this.state.content, Date.now(), "NEW")}}>Save</button>
      <button type="button" onClick={this.props.cancelClicked}>Cancel</button>
    </div>
    )
  }
}


class EditNotePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: props.activeNote[0].title,
      content: props.activeNote[0].content,
    }
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }


  render() {
    return (
      <div>
      <p>Edit Mode</p>
      <input type="text" name="title" defaultValue={this.state.title} placeholder="Note title"/>
      <textarea name='content' defaultValue={this.state.content} placeholder="Note content" />
      <button type="button" onClick={()=>{this.props.saveClicked(this.state.title, this.state.content, Date.now(), "UPDATE")}}>Save</button>
      <button type="button" onClick={this.props.cancelClicked}>Cancel</button>
    </div>
    )
  }

}
  

function Header(props) {
  return (
    <div>
      <h1>iNotes</h1>
      <img src={"http://localhost:3001/" + props.icon} alt="user-icon"/>
      <p>{props.name}</p>
      <button type='button' onClick={props.handleLogout}>Logout</button>
    </div>
  )
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
      success: (result) => {this.props.handleLogin(result)},
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