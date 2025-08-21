import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Identifier from './Components/Pages/identifier';
import Start from './Components/Pages/start';
import Insightor from './Components/Pages/insightor';
import Suggestor from './Components/Pages/suggestor'
import Chatbot from './Components/Pages/chatbot';
import Report from './Components/Pages/report';
import Side from './Components/Pages/sidebar';
import Goal from './Components/Pages/goal';
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Start} />
        <Route path="/home" component={Identifier} />
        <Route path = "/insight" component={Insightor}/>
         <Route path = "/suggest" component={Suggestor}/>
        <Route path="/bot" component={Chatbot} />
        <Route path="/report" component={Report} />
        <Route path="/sidebar" component={Side} />
        <Route path="/goal" component={Goal}/>
      </Switch>
    </Router>
  );
}

export default App;
