import React, { useState, useEffect, useContext } from "react";
import { withRouter } from "react-router-dom";
import ChatBubbleOutlineIconRounded from "@material-ui/icons/ChatBubbleOutlineRounded";
import PanToolIcon from "@material-ui/icons/PanTool";
import Comment from "../../components/Comment";
import { UserContext } from "../../components/Context";
import { handleNewCom, handleComs } from "../../api/comment";
import Loading from "../../components/utils/loading";
import DeleteIcon from "@material-ui/icons/Delete";
import StarRateIcon from "@material-ui/icons/StarRate";

const PostComponent = ({
	post,
	handlePostsByUserId,
	moderatePost,
	handleDeletePost,
	match,
	history
}) => {
	const date = new Date(post.createdAt).toLocaleString();
	const [commentInput, setCommentInput] = useState(false);
	const [comments, setComments] = useState(null);
	const [newComment, setNewComment] = useState("");
	const postProfileId = post.UserId;
	const { profile, handleAlert } = useContext(UserContext);

	const handleNewComment = e => {
		handleNewCom(post, newComment)
			.then(response => {
				setNewComment("");
				handleComments();
				handleAlert("success", response.data.message);
			})
			.catch(error => handleAlert("danger", error.response.data.error));
	};

	const handleComment = e => {
		setNewComment({ comments: e.target.value });
	};

	const handleComments = () => {
		handleComs(post)
			.then(response => {
				setComments(response.data.message);
			})
			.catch(error => handleAlert("danger", error.response.data.error));
	};

	useEffect(() => {
		if (match.params.UserId) {
			handlePostsByUserId(match.params.UserId);
		}
	}, [match.params.UserId, handlePostsByUserId]);

	return (
		<>
			{profile ? (
				<div className="col-md-12 ">
					<div className="card flex-md-row   box-shadow h-md-250">
						<div className="card-body d-flex flex-column align-items-center">
							{profile.isAdmin || profile.id === post.UserId ? (
								<DeleteIcon
									aria-label="Delete this post"
									className="icon delete infobulle"
									style={{ fontSize: 30 }}
									onClick={() => handleDeletePost(post.id)}
								/>
							) : null}

							<div className="d-flex mb-2 text-primary">
								{post.User.isAdmin ? <StarRateIcon /> : null}

								<span
									onClick={() => history.push(`/wall/${postProfileId}`)}
									className="badge rounded-pill bg-light seePost "
									autoFocus
								>
									{post.User.username}
								</span>

								{profile.isAdmin ? (
									<PanToolIcon
										color="action"
										style={{ fontSize: 30 }}
										onClick={() => moderatePost(post.id)}
										className="icon"
										autoFocus
									/>
								) : null}
							</div>
							<h3 className="mb-0">{post.title}</h3>
							<span className="mb-1 text-muted">{date}</span>
							<p className="card-text mb-auto">{post.content}</p>
						</div>
						<img
							src={post.attachment}
							className="card-img-right mx-auto d-block p-1 "
							alt="post-capture"
							autoFocus
						/>
					</div>

					<div className="card-footer">
						{!post.isModerate ? (
							<ChatBubbleOutlineIconRounded
								className="icon"
								color="primary"
								fontSize="large"
								onClick={() =>
									commentInput
										? setCommentInput(false)
										: setCommentInput(true) + handleComments(post.id)
								}
							/>
						) : (
							<p style={{ color: "red" }}>
								Post mod??r?? , vous ne pouvez pas commenter !!
							</p>
						)}

						{commentInput && comments ? (
							<>
								<div className="input-group mb-3">
									<label htmlFor="comments"></label>
									<input
										type="text"
										className="form-control"
										placeholder="Comments..."
										aria-label="comments"
										aria-describedby="basic-addon2"
										name="comments"
										onChange={e => handleComment(e)}
										autoFocus
									/>
									<div className="input-group-append">
										{newComment === "" ? (
											<button
												className="btn btn-info "
												disabled
												type="submit"
												onClick={e => handleNewComment(e)}
												autoFocus
											>
												Envoyer-le
											</button>
										) : (
											<button
												className="btn btn-info "
												type="submit"
												onClick={e => handleNewComment(e)}
												autoFocus
											>
												Envoyer-le
											</button>
										)}
									</div>
								</div>

								{comments.map(comment => (
									<Comment key={comment.id} comment={comment} />
								))}
							</>
						) : null}
					</div>
				</div>
			) : (
				<Loading />
			)}
		</>
	);
};
export default withRouter(PostComponent);
