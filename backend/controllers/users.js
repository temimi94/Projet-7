const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../models");

exports.signup = async (req, res) => {
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const role = req.body.role;

	const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const password_regex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;

	// On cherche l'utilisateur dans la bdd

	try {
		if (!email || !username || !password || !role) {
			throw new Error("Paramètres manquants");
		}

		if (!email_regex.test(email)) {
			throw new Error("Format d’e-mail incorrect");
		}

		if (!password_regex.test(password)) {
			throw new Error(
				"-Au moins 8 caractères - Inclure au moins 1 lettre minuscule - 1 lettre majuscule - 1 chiffre - 1 caractère spécial = !@#$%^&*"
			);
		}
		
		const oldUser = await models.User.findOne({
			attributes: ["email"],
			where: { email: email }
		});
		if (oldUser) {
			throw new Error("Vous avez déjà un compte");
		}

		const newUser = await models.User.create({
			email: email,
			username: username,
			password: await bcrypt.hash(password, 10),
			role: role,
			isAdmin: 0,
			latent: 1
		});

		if (!newUser) {
			throw new Error("Désolé, quelque chose a mal tourné, s’il vous plaît réessayer plus tard");
		}

		const token =
			"Bearer " +
			jwt.sign({ id: newUser.id }, "SECRET_KEY", { expiresIn: "2H" });

		if (!token) {
			throw new Error("Désolé, quelque chose a mal tourné, s’il vous plaît réessayer plus tard");
		}

		res.status(201).json({
			user_id: newUser.id,
			email: newUser.email,
			username: newUser.username,
			isAdmin: newUser.isAdmin,
			role: newUser.role,
			latent: newUser.latent,
			token
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const user = await models.User.findOne({
			where: {
				email: req.body.email,
				latent: 1
			}
		});

		if (!user) {
			throw new Error("Désolé, impossible de trouver votre compte");
		}

		const isMatch = await bcrypt.compare(req.body.password, user.password);

		if (!isMatch) {
			throw new Error("Mot de passe incorrect");
		}

		const token =
			"Bearer " + jwt.sign({ id: user.id }, "SECRET_KEY", { expiresIn: "2h" });
		res.status(200).json({
			user: user,
			token
		});

		if (!token) {
			throw new Error("Quelque chose qui a mal tourné réessayer plus tard");
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.userProfile = async (req, res) => {
	try {
		const user = await models.User.findOne({
			attributes: ["id", "email", "username", "role", "isAdmin", "latent"],
			where: {
				id: req.user.id
			}
		});

		if (!user) {
			throw new Error("Désolé, impossible de trouver votre compte");
		}
		res.status(200).json({ user });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deleteProfile = async (req, res) => {
	try {
		const userToFind = await models.User.findOne({
			where: { id: req.user.id }
		});
		if (!userToFind) {
			throw new Error("Désolé, impossible de trouver votre compte");
		}

		const notLatent = userToFind.update({
			latent: 0
		});

		if (!notLatent) {
			throw new Error("Désolé, quelque chose a mal tourné , s’il vous plaît réessayer plus tard");
		}

		res.status(200).json({
			message: "Votre compte a été supprimé avec succès"
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

//AMELIORATION DU PROJET
 exports.updateProfile = async (req, res) => {
	try {
		const userToFind = await models.User.findOne({
			attributes: ["role", "id", "isAdmin", "username"],
			where: { id: req.user.id }
		});

		if (!userToFind) {
			throw new Error("Désolé, nous ne pouvons pas trouver votre compte");
		}

		const userToUpdate = await models.User.update(
			{
				username: req.body.username,
				role: req.body.role,
				isAdmin: req.body.isAdmin
			},
			{
				where: { id: req.user.id }
			}
		);

		if (!userToUpdate) {
			throw new Error("Désolé, quelque chose a mal tourné, s’il vous plaît réessayer plus tard");
		}
		res.status(200).json({
			user: userToUpdate.isAdmin,
			message: "Votre compte a été mis à jour"
		});

		if (!userToUpdate) {
			throw new Error("Désolé, nous ne pouvons pas mettre à jour votre compte");
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
 