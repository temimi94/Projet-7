import React, { useContext } from "react";
import "./comments.scss";
import { UserContext } from "../Context";

const Comment = comment => {
	const date = new Date(comment.comment.createdAt).toLocaleString();
	const { profile } = useContext(UserContext);

	return (
		<>
			{profile ? (
				<div
					aria-live="polite"
					aria-atomic="true"
					className="d-flex justify-content-center align-items-center w-100 mt-4"
				>
					{console.log(comment)}
					<div className="toast">
						<div className="m-1  d-flex justify-content-between border-bottom">
							<p>{comment.comment.User.username}</p>
							<span>{date}</span>
						</div>
						<div className="toast-body">{comment.comment.comments}</div>
					</div>
				</div>
			) : null}
		</>
	);
};
export default Comment;
