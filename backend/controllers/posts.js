// import

const models = require('../models');
const fs = require('fs');

exports.createPost = async (req, res) => {
	try {
		// attachment
		const attachmentURL = `${req.protocol}://${req.get('host')}/images/${req.file.filename
			}`;

		if (!attachmentURL) {
			throw new Error(' Désolé, paramètres manquants');
		}

		// user
		const findUser = await models.User.findOne({
			attributes: ['username', 'role'],
			where: { id: req.user.id },
		});

		if (!findUser) {
			throw new Error("Désolé, nous ne pouvons pas trouver votre compte");
		}
		// post
		const newPost = await models.Post.create({
			title: req.body.title,
			content: req.body.content,
			attachment: attachmentURL,
			UserId: req.user.id,
			isModerate: 0,
		});

		if (!newPost) {
			throw new Error('Désolé, paramètres manquants ');
		}

		res.status(200).json({ newPost });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.getAllPosts = async (req, res) => {
	try {
		const fields = req.query.fields;
		const order = req.query.order;

		const posts = await models.Post.findAll({
			order: [order != null ? order.split(':') : ['createdAt', 'DESC']],
			attributes: fields != '*' && fields != null ? fields.split(',') : null,
			include: [
				{
					model: models.User,
					attributes: ['username', 'isAdmin'],
				},
			],
		});
		if (!posts) {
			throw new Error('Désolé , rien à récupérer ');
		}
		res.status(200).send(posts);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.getPostProfile = async (req, res) => {
	try {
		const order = req.query.order;
		const fields = req.query.fields;

		const postProfile = await models.Post.findAll({
			order: [order != null ? order.split(':') : ['createdAt', 'DESC']],
			attributes: fields != '*' && fields != null ? fields.split(',') : null,
			include: [
				{
					model: models.User,
					attributes: ['username'],
					where: { id: req.params.id },
				},
			],
		});
		if (!postProfile) {
			throw new Error(' Cet utilisateur n’a rien posté ');
		}

		res.status(200).json(postProfile);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.moderatePost = async (req, res) => {
	try {
		const postToModerate = await models.Post.findOne({
			where: { id: req.params.id },
		});

		if (!postToModerate) {
			throw new Error("Impossible de trouver votre message ");
		}

		const moderatedPost = (await postToModerate.isModerate)
			? postToModerate.update({
				isModerate: 0,
			})
			: postToModerate.update({
				isModerate: 1,
			});

		if (!moderatedPost) {
			throw new Error('Désolé, quelque chose a mal tourné, s’il vous plaît réessayer plus tard');
		} else {
			res.status(200).json({
				message: 'Ce poste est maintenant modéré',
				postModerate: postToModerate,
			});
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deletePost = async (req, res) => {
	try {
		const post = await models.Post.findOne({
			where: { id: req.params.id },
		});

		// attachment
		if (post.attachment !== null) {
			const filename = post.attachment.split('/images')[1];
			fs.unlink(`images/${filename}`, (error) => {
				error ? console.log(error) : console.log('le fichier a été supprimé');
			});
		}

		if (!post) {
			throw new Error(" Désolé, votre message n’existe pas ");
		}

		// post
		const destroyedPost = await models.Post.destroy({
			where: { id: req.params.id },
		});

		if (!destroyedPost) {
			throw new Error('Désolé, quelque chose a mal tourné, s’il vous plaît réessayer plus tard');
		} else {
			res.status(200).json({ message: ' La publication a été supprimé ' });
		}

		// comment
		const destroyedComment = await models.Comment.destroy({
			where: { id: req.params.id },
		});

		if (!destroyedComment) {
			throw new Error('Désolé, quelque chose a mal tourné, s’il vous plaît réessayer plus tard');
		} else {
			res.status(200).json({ message: 'Votre commentaire a été supprimé' });
		}
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};

//AMELIORATION DU PROJET
exports.updatePost = async (req, res) => {
	try {
		const attachmentURL = `${req.protocol}://${req.get('host')}/images/${
			req.file.filename
		}`;

		if (!attachmentURL) {
			throw new Error('Sorry,something gone wrong , please try aagain later');
		}

		const postFound = await models.Post.findOne({
			where: { id: req.params.id },
		});

		if (!postFound) {
			throw new Error("Sorry,can't find your post");
		}

		if (postFound && postFound.UserId !== req.user.id) {
			res.status(400).json({ error: error.message });
		}

		await postFound.update({
			title: req.body.title,
			content: req.body.content,
			attachment: attachmentURL,
			userId: req.user.id,
		});

		res.status(201).json({
			message: ' Your post has been updated',
			PostUpdated: postFound,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};