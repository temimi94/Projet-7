import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import LogIn from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Post from "./pages/Posts";
import Alert from "./components/Alert";
import jwt_decode from "jwt-decode";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { UserContext } from "./components/Context";
import { handleProfile } from "./api/users";

const dotenv = require("dotenv");
dotenv.config();

//vérification du Token
const isMyTokenValid = () => {
	if (localStorage.getItem("token")) {
		const decodedToken = jwt_decode(localStorage.getItem("token"));
		const dateNow = new Date();
		if (decodedToken.exp > dateNow / 1000) {
			return true;
		} else {
			localStorage.clear();
			window.location = "/";
		}
	}
};

//gérer les routes
const PrivateRoute = ({ component: Component, path }) => {
	return (
		<Route
			exact
			path={path}
			render={() =>
				isMyTokenValid() ? <Component /> : <Redirect to="/login" />
			}
		></Route>
	);
};

//gérer les alertes
const App = () => {
	const [profile, setProfile] = useState(null);
	const [alert, setAlert] = useState(null);

	const handleAlert = (status, text) => {
		setAlert({ status, text });
		setTimeout(() => {
			setAlert(null);
		}, 3000);
	};

	//a voir 
	useEffect(() => {
		if (!profile && isMyTokenValid()) {
			handleProfile()
				.then(res => {
					setProfile(res.data.user);
				})
				.catch(error => handleAlert(" danger ", " Quelque chose a mal tourné "));
		}
	}, [profile]);

	//les routes
	return (
		<Router>
			<div className="App">
				<UserContext.Provider
					value={{ profile, setProfile, handleAlert, alert, isMyTokenValid }}
				>
					<Header />
					{alert && <Alert status={alert.status} text={alert.text} />}
					<Route exact path="/" component={SignUp} />
					<Route exact path="/login" component={LogIn} />
					<PrivateRoute exact path="/myprofile/" component={Profile} />
					<PrivateRoute exact path="/wall" component={Post} />
					<PrivateRoute exact path="/wall/:UserId" component={Post} />
				</UserContext.Provider>
			</div>
		</Router>
	);
};

export default App;
