import React, { useState, useEffect, useContext } from 'react';
import './Post.scss';
import PostComponent from './PostComponent';
import Loading from '../../components/utils/loading';
import {
	addPost,
	deletePost,
	getPost,
	getPosts,
	moderate,
}
 from '../../api/posts';
import { UserContext } from '../../components/Context';

const Post = () => {
	const [posts, setPosts] = useState(null);
	const [active, setActive] = useState(false);
	const { handleAlert } = useContext(UserContext);
	const [newPost, setNewPost] = useState({
		title: '',
		content: '',
		attachment: '',
	});

	//récupération de toutes les posts 
	const handlePosts = () => {
		getPosts()
			.then((response) => {
				setPosts(response.data);
			})
			.catch((error) => handleAlert('danger', error.response.data.error));
	};

	//déclencher la fonction de manière asynchrone lorsque l'état du composant change
	useEffect(() => {
		if (!posts) {
			handlePosts();
		}
	}, [posts]);

	
	useEffect(() => {
		if (newPost.title !== '' && newPost.content !== '' && newPost.attachment) {
			setActive(true);
		}
	}, [newPost]);


	//Récupération des toutes les publications d'un utilisateur
	const handlePostsByUserId = (UserId) => {
		getPost(UserId)
			.then((response) => {
				setPosts(response.data);
			})
			.catch((error) => handleAlert('danger', error.response.data.error));
	};


	//envoyer la publication
	const submitHandler = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('title', newPost.title);
		formData.append('content', newPost.content);
		formData.append('attachment', newPost.attachment, newPost.attachment.name);

		addPost(formData)
			.then((response) => {
				handlePosts();
			})
			.catch((error) => handleAlert('danger', error.response.data.error));
	};
	
    
	const handlePost = (e) => {
		// acceder o target 
		if (e.target.name !== 'attachment') {
			setNewPost({ ...newPost, [e.target.name]: e.target.value });
		} else {
			setNewPost({
				...newPost,
				attachment: e.target.files[0],
			});
		}
	};

	//supprimer
	const handleDeletePost = (id) => {
		deletePost(id)
			.then((response) => {
				const data = posts.filter((post) => post.id !== id);
				setPosts(data);
				handleAlert('success', response.data.message);
			})

			.catch((error) => handleAlert('danger', error.response.data.error));
	};

	//modéré
	const moderatePost = (id) => {
		moderate(id)
			.then((response) => {
				handlePosts();
				handleAlert('success', response.data.message);
			})
			.catch((error) => handleAlert('danger', error.response.data.error));
	};

	return (
		<>
			{posts ? (
				<>
					<div className='card postform'>
						<form
							onSubmit={submitHandler}
							method='post'
							encType='multipart/form-data'
							className='postForm'
						>
							<div className='card-header'>
								<label htmlFor='title'>Titre</label>
								<input
									type='text'
									className='form-control title'
									value={newPost.title}
									onChange={(e) => handlePost(e)}
									id='title'
									name='title'
									placeholder='Your title'
									aria-label='Your title'
									aria-describedby='basic-addon1'
								/>
							</div>

							<div className='card-body'>
								<label htmlFor='content'>Votre message</label>
								<textarea
									className='form-control formInput'
									value={newPost.content}
									onChange={(e) => handlePost(e)}
									placeholder='Tell us something...'
									id='content'
									name='content'
								/>
								<label className='' htmlFor='attachment'></label>
								<input
									className='form-control attachment'
									onChange={(e) => handlePost(e)}
									id='attachment'
									name='attachment'
									type='file'
									width='30%'
								/>

								{active ? (
									<button className='btn btn-primary ' type='submit'>
										Poster 🤨
									</button>
								) : (
									<button disabled className='btn btn-primary ' type='submit'>
										Poster 🤨
									</button>
								)}
							</div>
						</form>
					</div>

					<div className='post'>
						{posts && (
							<>
								{posts.map((post) => (
									<PostComponent
										key={post.id}
										post={post}
										handlePostsByUserId={handlePostsByUserId}
										moderatePost={moderatePost}
										handleDeletePost={handleDeletePost}
									/>
								))}
							</>
						)}
					</div>
				</>
			) : (
				<Loading />
			)}
		</>
	);
};
export default Post;
