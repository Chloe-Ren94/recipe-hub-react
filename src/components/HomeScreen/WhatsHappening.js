import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {API_URL} from "../../consts";

const WhatsHappening = () => {
    const [reviews, setReviews] = useState([]);

    const findAllReviews = () => {
        fetch(`${API_URL}/reviews`)
            .then(res => res.json())
            .then(reviews =>
                setReviews(reviews
                    .sort((a, b) => b.createdAt > a.createdAt ? 1 : -1)
                    .slice(0, 10)));
    }

    useEffect(findAllReviews, []);

    return(
        <div className="mt-5">
            <h2>What's happening in Recipe Hub</h2>
            {
                reviews.map(review =>
                    <li key={review._id} className="list-group-item">
                        <Link to={`/profile/${review.userID}`}
                              className="text-decoration-none me-1">
                            {review.username}
                        </Link>
                        reviewed to
                        <Link to={`/details/${review.recipeID}`}
                              className="text-decoration-none ms-1">
                            {review.recipeTitle}
                        </Link>
                        <span className="ms-2 text-dark">{review.createdAt.split('T')[0]}</span>
                        <p>{review.review}</p>
                    </li>
                )
            }
        </div>
    )
}
export default WhatsHappening;