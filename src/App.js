import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      issues: [],
      username: localStorage.getItem('username'),
      apiToken: localStorage.getItem('apiToken'),
      server: localStorage.getItem('server'),
    };
  }

  componentDidMount() {
    if (this.state.server && this.state.username && this.state.apiToken) {
      this.loadIssues();
    }
  }

  loadIssues() {
    console.log('loading issues');
    fetch(this.genURL('/rest/api/2/search?jql=' + encodeURIComponent('assignee = currentUser() and statusCategory != Done order by created DESC')), {
      method: 'GET',
      headers: this.genBasicAuth(),
      mode: 'cors',
      // body: JSON.stringify({jql: "assignee = currentUser()"}),
    })
      .then(response => {
        if (!response.ok) {
          console.log('Error code:', response.status, response.statusText, response.headers);
          throw new Error(response.statusText);
        }
        return response;
      })
      .then(response => {
        console.log('got response:', response);
        return response.json();
      })
      .then(response => {
        console.log('res:', response);
        this.setState({issues: response.issues})
      })
      .catch(err => console.error('error doing things:', err.toString()));
  }

  basicFetch(endpoint) {
    return fetch(this.genURL(endpoint), this.genDefaultFetchObj());
  }

  genURL(endpoint) {
    return 'https://cors-anywhere.herokuapp.com/https://' + this.state.server + endpoint;
  }
  
  genDefaultFetchObj() {
    return { headers: this.genBasicAuth(this.state.username, this.state.apiToken) };
  }

  genBasicAuth(username = this.state.username, password = this.state.apiToken) {
    return new Headers({
      'Authorization': 'Basic ' + btoa(username + ":" + password),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  saveConfig({server, username, apiToken}) {
    localStorage.setItem('server', server);
    localStorage.setItem('username', username);
    localStorage.setItem('apiToken', apiToken);

    this.setState({server, username, apiToken}, () => this.loadIssues);
  }

  render() {
    const now = new Date();

    const pastDue = this.state.issues.filter(issue => compareDates(issueDueDate(issue), now) < 0);
    const dueToday = this.state.issues.filter(issue => compareDates(issueDueDate(issue), now) === 0);
    const dueThisWeek = this.state.issues.filter(issue => sameWeek(issueDueDate(issue), now));
    const other = this.state.issues.filter(issue => compareDates(issueDueDate(issue), now) > 0 && !sameWeek(issueDueDate(issue), now));

    return (
      <div>
        <Config
          server={this.state.server}
          username={this.state.username}
          apiToken={this.state.apiToken}
          saveConfig={o => this.saveConfig(o)} />

        <br />

        <label>Total Issues: {this.state.issues.length}</label>

        <br />
        <br />

        <label>Past Due ({pastDue.length}):</label>
        <IssueList issues={pastDue} />

        <label>Due Today ({dueToday.length}):</label>
        <IssueList issues={dueToday} />

        <label>Due This Week ({dueThisWeek.length}):</label>
        <IssueList issues={dueThisWeek} />

        <label>Other ({other.length}):</label>
        <IssueList issues={other} />
      </div>
    );
  }
}

const issueDueDate = issue => issue.fields.duedate && new Date(issue.fields.duedate);
const compareDates = (d1, d2) => {
  if (!d1) {
    return 1;
  }

  const yearDiff = d1.getFullYear() - d2.getFullYear();
  if (yearDiff !== 0) {
    return yearDiff;
  }
  const monthDiff = d1.getMonth() - d2.getMonth();
  if (monthDiff !== 0) {
    return monthDiff;
  }
  return d1.getDate() - d2.getDate();
};

// returns true iff d1 comes after d2 in the same week
const sameWeek = (d1, d2) => {
  if (!d1) {
    return false;
  }

  if (compareDates(d1, d2) <= 0) {
    return false;
  }

  if (d1 - d2 > secondsInWeek) {
    return false;
  }

  return d1.getDay() > d2.getDay();
};

class Config extends React.Component {
  constructor(props) {
    super();

    this.state = {
      server: props.server || '',
      username: props.username || '',
      apiToken: props.apiToken || '',
    };
  }

  render() {
    return (
      <div>
        <label style={{marginRight: '5px'}}>Server:</label>
        <input
          id='server'
          value={this.state.server}
          required
          placeholder='your.jira.server.com'
          onChange={(e) => this.setState({server: e.target.value})} />

        <br />

        <label style={{marginRight: '5px'}}>Username:</label>
        <input
          id='username'
          value={this.state.username}
          required
          placeholder='user@domain.com'
          onChange={(e) => this.setState({username: e.target.value})} />

        <br />

        <label style={{marginRight: '5px'}}>API Token:</label>
        <input
          id='api-token'
          value={this.state.apiToken}
          required
          placeholder='12345abcde'
          onChange={(e) => this.setState({apiToken: e.target.value})} />

        <br />

        <button onClick={() => this.props.saveConfig(this.state)}>Save</button>
      </div>
    );
  }
}

class IssueList extends React.Component {
  render() {
    return (
      <ol style={{marginLeft: '10px'}}>
        {this.props.issues.map(issue => <Issue key={issue.id} val={issue} />)}
      </ol>
    );
  }
}

const workHoursPerDay = 8;
const workdaysPerWeek = 5;

const secondsInMinute = 60;
const secondsInHour = secondsInMinute * 60;
const secondsInDay = secondsInHour * workHoursPerDay;
const secondsInWeek = secondsInDay * workdaysPerWeek;

const formatTime = (seconds) => {
  if (!seconds) {
    // in case it's null, undefined, etc
    seconds = 0;
  }

  let weeks = Math.floor(seconds / secondsInWeek);
  seconds %= secondsInWeek;
  let days = Math.floor(seconds / secondsInDay);
  seconds %= secondsInDay;
  let hours = Math.floor(seconds / secondsInHour);
  seconds %= secondsInHour;
  let minutes = Math.floor(seconds / secondsInMinute);
  seconds %= secondsInMinute;

  let str = '';
  if (weeks > 0) {
    str += ' ' + weeks + 'w';
  }
  if (days > 0) {
    str += ' ' + days + 'd';
  }
  if (hours > 0) {
    str += ' ' + hours + 'h';
  }
  if (minutes > 0) {
    str += ' ' + minutes + 'm';
  }

  if (seconds > 0) {
    str += ' ' + seconds + 's';
  }

  return str.replace(/^ /, '') || 'no time est';
}

class Issue extends React.Component {
  render() {
    return (
      <li style={{margin: '10px 0px'}}>
          <a href={(new URL('/browse/' + this.props.val.key, this.props.val.self)).href}>{this.props.val.key}</a>:  - {this.props.val.fields.summary} | <span style={{border: '1px solid'}}>{this.props.val.fields.status.name}</span> 
          <div>
            <label>Estimate:</label> <span>{formatTime(this.props.val.fields.timeestimate)}</span>
            <br />
            <label>Due:</label> <span>{this.props.val.fields.duedate}</span>
          </div>
      </li>
    );
  }
}

export default App;
