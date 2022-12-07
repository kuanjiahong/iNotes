// import logo from './logo.svg';
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
      addNoteMode: false,
      editNoteMode: false,
    }

    this.changeToAddMode = this.changeToAddMode.bind(this)
    this.changeToEditMode = this.changeToEditMode.bind(this)
    
    this.resetModeState = this.resetModeState.bind(this)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.getActiveNote = this.getActiveNote.bind(this)

    this.getAllData = this.getAllData.bind(this)
    this.createNote = this.createNote.bind(this)
    this.updateNote = this.updateNote.bind(this)
    this.deleteNote = this.deleteNote.bind(this)
    
  }

  componentDidMount() {
    this.getAllData();
  }

  changeToAddMode() {
    console.log("New note button clicked");
    this.setState({addNoteMode: true})
  }

  changeToEditMode() {
    console.log("Change to edit mode");
    this.setState({editNoteMode: true})
  }

  resetModeState() {
    console.log("Reset add note mode and edit note mode");
    this.setState({addNoteMode: false,editNoteMode: false})
  }

  getAllData() {
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
    this.resetModeState();
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

  createNote(title, content) {
    alert("Create Note on backend");
    alert(`Note created! title: ${title} Content: ${content}`);
    $.ajax({
      method: "POST",
      data:{
        title: title,
        content: content,
      },
      url: "http://localhost:3001/addnote",
      xhrFields: { withCredentials: true },
      success: (result) => {
        this.getAllData();
        this.getActiveNote(result.inserted_note_id);
      },
      error: (err) => alert("Error: " + err),
    });

    this.setState({addNoteMode: false,editNoteMode: false})

  }

  updateNote(noteId, title, content) {
    alert("Update note on backend");
    alert(`Note updated! id: ${noteId}  title: ${title} Content: ${content}`);
    $.ajax({
      method: "PUT",
      data: {
        title: title,
        content: content,
      },
      url: "http://localhost:3001/savenote/" + noteId,
      xhrFields: { withCredentials: true },
      success: (result) => {
        console.log(result)
        this.getAllData();
        this.getActiveNote(noteId);
      },
      error: (err) => alert("Error: " + err),
    });

    this.setState({addNoteMode: false,editNoteMode: false})

  }

  deleteNote(noteId) {
    alert(`Note ${noteId} will be deleted`);
    $.ajax({
      method: "DELETE",
      url: "http://localhost:3001/deletenote/" + noteId,
      xhrFields: { withCredentials: true },
      success: (result) => {
        console.log(result)
        this.getAllData();
        this.getActiveNote(noteId);
      },
      error: (err) => alert("Error: " + err),
    });
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
          <div className='main-container'>
            <Sidebar 
              notes={this.state.notes} 
              activeNote={this.state.activeNote}
              addNoteMode={this.state.addNoteMode} 
              editNoteMode={this.state.editNoteMode}
              getActiveNote={this.getActiveNote} 
               />
            <Dashboard 
              activeNote={this.state.activeNote} 
              addNoteMode={this.state.addNoteMode} 
              editNoteMode={this.state.editNoteMode}
              deleteNote={this.deleteNote} 
              createNote={this.createNote} 
              updateNote={this.updateNote} 
              resetModeState={this.resetModeState}
              changeToAddMode={this.changeToAddMode}
              changeToEditMode={this.changeToEditMode}
              />
          </div>
        </div>
      )
    } else {
      return <LoginForm handleLogin={this.handleLogin} />
    }
  }
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchString: "",
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getEpochTime = this.getEpochTime.bind(this)

  }

  getEpochTime(dateString) {
    let arr = dateString.split(" ");
    const year = arr[4];
    const month = arr[2];
    const day = arr[3];
    const time = arr[0];
    let formatString = year + " " + month + " " + day + " " + time
    return Date.parse(formatString);
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
    const length = this.props.notes.length;
    let notes = this.props.notes;
    const sortedNotes = notes.sort((a, b) =>  this.getEpochTime(b.lastsavedtime) - this.getEpochTime(a.lastsavedtime))
    const activeNoteId = this.props.activeNote.length > 0  && (!this.props.addNoteMode && !this.props.editNoteMode) 
              ? this.props.activeNote[0]._id 
              : -1;
    if (length > 0) {
      return (
      <div className='menu-container'>
        <menu>
          <form onSubmit={this.handleSubmit}>
            <input type="text" onChange={this.handleInputChange} name="searchString" placeholder='Search Notes' />
          </form>
          <p className='mb-0'>Notes ({length})</p>
          <ul className='note-list'>
            {
             sortedNotes.map((note) => 
             {
              let noteClass = "individual-note ";
              if (note._id === activeNoteId) {
                noteClass += "active";
              }
              return <li className={noteClass} key={note._id} onClick={()=>{this.props.getActiveNote(note._id)}}>{note.title}</li>
             })
            }
          </ul>
        </menu>
      </div>

      )
    } else {
      return <p>No notes</p>
    }
  }



}


class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.saveClicked = this.saveClicked.bind(this)
    this.deleteClicked = this.deleteClicked.bind(this)
    this.cancelClicked = this.cancelClicked.bind(this)
  }


  saveClicked(noteid, title, content, mode) {
    if (title === "" && content === "") {
      alert("Please input title and content");
      return false;
    } else {
      alert(`Note saved! title: ${title} Content: ${content}`);
      if (mode === "NEW") {
        this.props.createNote(title, content);
      } else if (mode === "UPDATE") {
        this.props.updateNote(noteid, title, content);
      }
    }
  }

  deleteClicked(noteId) {
    if (window.confirm("Confirm to delete this note?")) {
      this.props.deleteNote(noteId);
    }
  }

  cancelClicked() {
    if (window.confirm("Are you sure you want to cancel?")) {
      this.props.resetModeState();
    }
  }

  render() {
    if (this.props.addNoteMode) {
      return (
          <NewNotePage saveClicked={this.saveClicked} cancelClicked={this.cancelClicked}/>
      )
    } else if (this.props.editNoteMode) {
      return (
        <EditNotePage activeNote={this.props.activeNote} saveClicked={this.saveClicked} cancelClicked={this.cancelClicked} />
      )
    } 
    else if (this.props.activeNote.length > 0) {
      return(
        <div className='dashboard-container'>
          <div className='delete-button-container'>
            <button type="button" onClick={()=>this.deleteClicked(this.props.activeNote[0]._id)}>Delete</button>
          </div>
          <div className='note-container'>
            <p>Last saved: {this.props.activeNote[0].lastsavedtime}</p>
            <p className='editable' onClick={this.props.changeToEditMode}>Title: {this.props.activeNote[0].title}</p>
            <p>Content:</p>
            <p className='editable' onClick={this.props.changeToEditMode}>{this.props.activeNote[0].content}</p>
          </div>
          <div className='new-button-container'>
            <button type="button" onClick={this.props.changeToAddMode}>New Note</button>
          </div>
        </div>
      ) 
    } else {
      return (
        <div className='dashboard-container'>
          <div className='empty-container'></div>
          <div className='new-button-container'>
            <button type="button" onClick={this.props.changeToAddMode}>New Note</button>
          </div>
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
    <div className='dashboard-container'>
      <div className='save-cancel-button-container'>
        <button type="button" onClick={()=>{this.props.saveClicked(0, this.state.title, this.state.content, "NEW")}}>Save</button>
        <button className='ml-1' type="button" onClick={this.props.cancelClicked}>Cancel</button>
      </div>
      <div className='add-note-mode-container'>
        <div className='input-container'>
          <label className='mb-1'>Title</label>
          <input type="text" name="title" placeholder='Note title' onChange={this.handleInputChange}/>
        </div>
        <div className='input-container'>
          <label className='mb-1'>Content </label>
          <textarea name="content" value={this.state.value} placeholder="Note content" onChange={this.handleInputChange} />
        </div>
      </div>
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
      <div className='dashboard-container'>
        <div className='save-cancel-button-container'>
          <button
            type="button" 
            onClick={()=>{this.props.saveClicked(this.props.activeNote[0]._id, this.state.title, this.state.content, "UPDATE")}}>
            Save
          </button>
          <button className='ml-1' 
            type="button" 
            onClick={this.props.cancelClicked}>
              Cancel
            </button>
        </div>
        <div className='edit-note-mode-container'>
          <div className='input-container'>
            <label className='mb-1'>Title:</label>
            <input type="text" name="title" defaultValue={this.state.title} placeholder="Note title" onChange={this.handleInputChange}/>
          </div>
          <div className='input-container'>
            <label className='mb-1'>Content:</label>
            <textarea name='content' defaultValue={this.state.content} placeholder="Note content" onChange={this.handleInputChange} />
          </div>
        </div>
      </div>
    )
  }

}
  

function Header(props) {
  return (
    <div>
      <h1 className='text-center'>iNotes</h1>
      <div className='header-container'>
        <div className='profile-container'>
          <img className='icon-size' src={"http://localhost:3001/" + props.icon} alt="user-icon"/>
          <p className='pl-1 mb-0'>{props.name}</p>
        </div>
        <div className='logout-container'>
          <button type='button' onClick={props.handleLogout}>Logout</button>
        </div>
      </div>
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
      <div className='login-form'>
        <h1>iNotes</h1>
        <form onSubmit={this.handleSubmit}>
          <div className='input-container'>
            <label>Name:</label>
            <input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} placeholder="Name" />
          </div>
          <div className='input-container'>
            <label>Password:</label>
            <input type="password" name="password" value={this.state.password} onChange={this.handleInputChange} placeholder="Password" />
          </div>
          <input type="submit" value="Sign in"/>
        </form>
      </div>
    )
  }
}



export default iNotes;