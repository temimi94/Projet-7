import React, { useState, useContext } from "react";
import "./Profile.scss";
import Alert from "../../components/Alert";
import { handleDelete } from "../../api/users";
import { withRouter } from "react-router-dom";
import { UserContext } from "../../components/Context";
import Loading from "../../components/utils/loading";

const Profile = ({ history }) => {
	const [success] = useState(false);

	const { profile, handleAlert } = useContext(UserContext);

	const handleDeleteUser = () => {
		handleDelete()
			.then(response => {
				handleAlert(
					"success",
					"Votre compte a été supprimé, vous ne pourrez plus vous connecter tant que vous n’aurez pas créé un nouveau compte"
				);
				setTimeout(() => {
					history.push("/");
				}, 5000);
				localStorage.clear();
			})
			.catch(error => handleAlert("danger", error.response.data.error));
	};
    
	return (
		<>
			{profile ? (
				<div className="card welcome">
					{success ? <Alert /> : null}
					<div className="card-body">
						<h5 className="card-title text-primary">Bonjour! 🙋 {profile.username}</h5>
						<p className="card-text">
						Bienvenue dans votre espace privé Groupomania 
						</p>
					</div>
					<ul className="list-group list-group-flush">
						<li className="list-group-item">Email : {profile.email}</li>
						<li className="list-group-item">Nom : {profile.username}</li>
						<li className="list-group-item">Role: {profile.role}</li>

						<li className="list-group-item">
							Administrateur :{JSON.stringify(profile.isAdmin)}
						</li>
					</ul>
					<div className="card-body">
						<button
							type="button"
							onClick={handleDeleteUser}
							className="btn btn-danger"
						>
							Supprimer votre compte
						</button>
					</div>
				</div> 
			) : (
				<Loading />
			)}
		</>
	);
};

export default withRouter(Profile);
