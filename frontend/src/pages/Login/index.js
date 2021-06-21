import React, { useState, useContext } from "react";
import "../SignUp/SignUp.scss";
import { handleLogin } from "../../api/users";
import { NavLink, Redirect } from "react-router-dom";
import { UserContext } from "../../components/Context";

const LogIn = () => {
	const [login, setLogin] = useState({ email: "", password: "" });
	const { setProfile, handleAlert } = useContext(UserContext);
	const [redirect, setRedirect] = useState(false);

	const submitHandler = e => {
		e.preventDefault();
		handleLogin(login)
			.then(res => {
				localStorage.setItem("token", res.data.token);
				setProfile(res.data.user);
				setRedirect(true);
			})
			.catch(error => {
				handleAlert("danger", error.response.data.error);
			});
	};

	return (
		<>
			<form className="login" onSubmit={submitHandler}>
				<div className="form-group">
					<h2>Veuillez vous connecter</h2>
					<label htmlFor="email">Email</label>
					<input
						type="email"
						className="form-control"
						name="email"
						id="email"
						value={login.email}
						onChange={e => setLogin({ ...login, email: e.target.value })}
						aria-describedby="emailHelp"
						placeholder="Enter email"
						autoFocus
					/>
				</div>
				<div className="form-group">
					<label htmlFor="exampleInputPassword1">Password</label>
					<input
						type="password"
						className="form-control"
						name="password"
						id="password"
						value={login.password}
						onChange={e => setLogin({ ...login, password: e.target.value })}
						placeholder="Password"
						autoFocus
					/>
				</div>{" "}
				<h2 id="emailHelp" className="form-text" aria-hidden="true"></h2>
				<button type="submit" className="btn btn-danger">
				connectez-vous
				</button>
				<p>Vous n’avez pas encore de compte ?</p>
				<NavLink to="/"> Cliquez ici 👉</NavLink>
			</form>
			{redirect && <Redirect to="/myprofile" />}
		</>
	);
};

export default LogIn;
