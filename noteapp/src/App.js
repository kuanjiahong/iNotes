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
    }

    this.onLoggedIn = this.onLoggedIn.bind(this)
    this.onLogout = this.onLogout.bind(this)
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
      success: () => this.setState({loggedIn: false}),
      error: (err) => alert("Error: " + err),
    });
  }

  render() {
    if (this.state.loggedIn) {
      return (
        <div>
          <h1>iNotes</h1>
          <h2>HomePage</h2>
          <LogoutButton onLogout={this.onLogout} />
          <img src={"http://localhost:3001/" + this.state.user.icon} alt="user icon" />
          <p>{this.state.user.name}</p>
          <ul>
            {
              this.state.notes.map((note) => <li key={note._id}>{note.title}</li>)
            }
          </ul>
        </div>
      )
    } else {
      return <LoginForm onLogin={this.onLoggedIn} />
    }
  }
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
            <input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} />
          <label>
            Password:
          </label>
            <input type="password" name="password" value={this.state.password} onChange={this.handleInputChange} />
          <input type="submit" value="Sign in"/>
        </form>
      </div>
    )
  }
}



export default iNotes;