// ./assets/js/components/Home.js

import React, {Component} from 'react';
import {Route, Redirect, Switch, Link} from 'react-router-dom';
// import SetupCheck from "./SetupCheck";
import RatesDashboard from "./RatesDashboard";
import RateDetails from "./RateDetails";
import CantorQuote from "./CantorQuote";
import { ToastProvider } from "./ToastManager";

class Home extends Component {

    render() {
        return (
            <ToastProvider>
                <div>
                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                        <Link className={"navbar-brand"} to={"#"}> Telemedi Zadanko </Link>
                        <div id="navbarText">
                            <ul className="navbar-nav mr-auto">
                                {/* <li className="nav-item">
                                    <Link className={"nav-link"} to={"/setup-check"}> React Setup Check </Link>
                                </li> */}
                                <li className="nav-item">
                                    <Link className="nav-link" to="/"> Dashboard </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/history"> History </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/cantor"> Exchange </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    <Switch>
                        <Route exact path="/" component={RatesDashboard} />
                        {/* <Route path="/setup-check" component={SetupCheck} /> */}
                        <Route path="/rates" component={RatesDashboard} />
                        <Route path="/history" component={RateDetails} />
                        <Route path="/cantor" component={CantorQuote} />
                    </Switch>
                </div>
            </ToastProvider>
        )
    }
}

export default Home;
