import {Link, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import Navigation from "../Navigation";
import {findRecipeInLists} from "../services/listService";
import './index.css';
import {API_URL, API_KEY} from "../../consts";

const Index = () => {
    const profile = useSelector(state => state.profile);
    const dispatch = useDispatch();
    const [review, setReview] = useState('');
    const [writeReview, setWriteReview] = useState(false);
    const [add, setAdd] = useState(false);
    const [selectedList, setSelectedList] = useState('favourite');
    const [reviews, setReviews] = useState([]);
    const navigate = useNavigate();
    const params = useParams();
    const [recipeDetails, setRecipeDetails] = useState({dishTypes: [], cuisines: [], nutrition: {caloricBreakdown: {}}, extendedIngredients: []});
    const [edit, setEdit] = useState(false);
    const [editedReview, setEditedReview] = useState({});

    const findRecipeDetailsByID = () =>
        fetch(`https://api.spoonacular.com/recipes/${params.id}/information?apiKey=${API_KEY}&includeNutrition=true`)
            .then(res => res.json())
            .then(recipe => {
                setRecipeDetails(recipe);
                console.log(recipe)
            });

    const findReviewsByRecipeID = () =>
        fetch(`${API_URL}/recipes/${params.id}/reviews`)
            .then(res => res.json())
            .then(reviews => setReviews(reviews));

    const submitReview = () => {
        const newReview = {
            recipeID: params.id,
            recipeTitle: recipeDetails.title,
            userID: profile._id,
            username: profile.username,
            review
        }
        fetch(`${API_URL}/reviews`, {
            method: 'POST',
            body: JSON.stringify(newReview),
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(insertedReview =>
                setReviews([
                    insertedReview,
                    ...reviews
                ])
            )
    }
    const addList = () => {
        const newProfile = {
            ...profile,
            lists: profile.lists.map(list => {
                if(list.listname === selectedList) {
                    return {
                        ...list,
                        recipes: [
                            {
                                recipeID: params.id,
                                recipeTitle: recipeDetails.title,
                            },
                            ...list.recipes
                        ]
                    }
                } else {
                    return list
                }
            })
        }
        fetch(`${API_URL}/users`, {
            method: 'PUT',
            body: JSON.stringify(newProfile),
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(res => dispatch({
                type: 'update-profile',
                profile: newProfile
            }))
    }

    useEffect(() => {
        findRecipeDetailsByID();
        findReviewsByRecipeID();
    }, []);

    const createReviewHandler = () => {
        if(!profile._id) {
            navigate('/login');
        }
        if(!edit) {
            setWriteReview(true);
        }
    }
    const cancelWriteHandler = () => {
        setWriteReview(false);
        setReview('');
    }
    const submitReviewHandler = () => {
        submitReview();
        setWriteReview(false);
        setReview('');
    }
    const deleteReview = (review) => {
        fetch(`${API_URL}/reviews/${review._id}`, {
            method: 'DELETE'
        })
            .then(res => setReviews(reviews.filter(r => r._id !== review._id)))
    }
    const editReviewHandler = () => {
        setEdit(false);
        setReview('');
        const newReview = {
            ...editedReview,
            review
        }
        fetch(`${API_URL}/reviews`, {
            method: 'PUT',
            body: JSON.stringify(newReview),
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(res => setReviews(reviews.map(review =>
                review._id === newReview._id ? newReview : review
            )))
    }

    const addToList = () => {
        if(!profile._id) {
            navigate('/login');
        }
        setAdd(true);
    }
    const cancelAddHandler = () => {
        setAdd(false);
    }
    const addListHandler = () => {
        addList();
        setAdd(false);
    }

    return(
        <div className="container mt-5">
            <Navigation/>
            <h3 className="mt-5">{recipeDetails.title}</h3>
            <div className="row mt-4">
                <img className="col-6 col-sm-6 col-md-4 col-lg-3"
                     src={recipeDetails.image}/>
                <div className="col-6 col-sm-6 col-md-4 col-lg-5 ps-4">
                    <div>Dish types: {recipeDetails.dishTypes.join("/")}</div>
                    <div>Cuisines: {recipeDetails.cuisines.join("/")}</div>
                    <div>Cooking time: {recipeDetails.readyInMinutes} min</div>
                    <div>Servings: {recipeDetails.servings}</div>
                    <div>Health score: {recipeDetails.healthScore}</div>
                    <div>Vegan: {recipeDetails.vegan ? 'true' : 'false'}</div>
                    <div>Dairy free: {recipeDetails.dairyFree ? 'true' : 'false'}</div>
                    <div>Gluten free: {recipeDetails.glutenFree ? 'true' : 'false'}</div>
                </div>
                <div className="d-none d-sm-none d-md-block col-md-4 col-lg-4">
                    <h5>Nutrition</h5>
                    <div>Percent carbs: {recipeDetails.nutrition.caloricBreakdown.percentCarbs}</div>
                    <div>Percent fat: {recipeDetails.nutrition.caloricBreakdown.percentFat}</div>
                    <div>Percent protein: {recipeDetails.nutrition.caloricBreakdown.percentProtein}</div>

                    <div className="mt-3">
                        {findRecipeInLists(profile.lists, params.id) ?
                            <div className="text-white" style={{fontSize: '1.5em'}}>Saved in
                                <Link to='/profile' className="text-decoration-none ms-1">
                                    {findRecipeInLists(profile.lists, params.id)}
                                </Link>
                            </div> :
                            <div>
                                <div style={{fontSize: '1.5em', color: 'white'}}
                                     onClick={addToList}>
                                    <i className="fas fa-plus me-2"></i>
                                    Add to a list
                                </div>
                                {add &&
                                    <div>
                                        <select className="form-select"
                                                value={selectedList}
                                                onChange={e => setSelectedList(e.target.value)}>
                                            {profile.lists.map(list =>
                                                <option value={list.listname}>{list.listname}</option>)}
                                        </select>
                                        <button
                                            className="btn btn-primary rounded-pill mt-2 ms-3 float-end"
                                            onClick={addListHandler}>
                                            Add
                                        </button>
                                        <button
                                            className="btn btn-danger rounded-pill float-end mt-2"
                                            onClick={cancelAddHandler}>
                                            Cancel
                                        </button>
                                        <div style={{clear: 'both'}}></div>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h4>Summary</h4>
                <p dangerouslySetInnerHTML={{__html:recipeDetails.summary}} ></p>
            </div>

            <div className="mt-4">
                <h4>Ingredients</h4>
                <ul className="list-group">
                    {
                        recipeDetails.extendedIngredients.map(ingredient =>
                            <li key={ingredient.id} className="list-group-item" style={{width: "50%"}}>
                                {ingredient.original}
                            </li>
                        )
                    }
                </ul>
            </div>

            <div className="mt-4">
                <h4>Instructions</h4>
                <p dangerouslySetInnerHTML={{__html:recipeDetails.instructions}} ></p>
            </div>

            <div className="mt-4">
                <button
                    className="btn btn-success rounded-pill float-end"
                    onClick={createReviewHandler}>
                    Write a review
                </button>

                <a name="review"></a>
                <h4>Reviews</h4>
                {writeReview &&
                    <div>
                        <textarea className="form-control border"
                                  placeholder="Write your review"
                                  rows="3"
                                  style={{backgroundColor: "black", color: "white"}}
                                  value={review}
                                  onChange={(event) =>
                                      setReview(event.target.value)}>
                        </textarea>
                        <div className="mt-2">
                            <button
                                className="btn btn-primary rounded-pill ms-3 float-end"
                                onClick={submitReviewHandler}>
                                Submit
                            </button>
                            <button
                                className="btn btn-danger rounded-pill float-end"
                                onClick={cancelWriteHandler}>
                                Cancel
                            </button>
                        </div>
                        <div style={{clear: 'both'}}></div>
                    </div>
                }
                {edit &&
                <div>
                        <textarea className="form-control border"
                                  placeholder="Write your review"
                                  rows="3"
                                  style={{backgroundColor: "black", color: "white"}}
                                  value={review}
                                  onChange={(event) =>
                                      setReview(event.target.value)}>
                        </textarea>
                    <div className="mt-2">
                        <button
                            className="btn btn-primary rounded-pill ms-3 float-end"
                            onClick={() => editReviewHandler(review)}>
                            Edit
                        </button>
                        <button
                            className="btn btn-danger rounded-pill float-end"
                            onClick={() => {
                                setEdit(false);
                                setReview('');
                            }}>
                            Cancel
                        </button>
                    </div>
                    <div style={{clear: 'both'}}></div>
                </div>
                }
                {
                    reviews.length === 0 &&
                    <p>
                        There are no reviews about this recipe yet.
                        Become the first one to write a review.
                    </p>
                }
                <ul className="list-group mt-2">
                    {
                        reviews.sort((a, b) => b.createdAt > a.createdAt ? 1 : -1).map(review =>
                            <li key={review._id} className="list-group-item">
                                <Link to={`/profile/${review.userID}`}
                                    style={{"text-decoration": "none"}}>
                                    {review.username}
                                </Link>
                                <span className="ms-2 text-dark">{review.createdAt.split('T')[0]}</span>
                                <p>{review.review}</p>
                                {
                                    (profile.type === 'ADMIN' || profile._id === review.userID) &&
                                    <a href="#review"
                                       className="text-decoration-none float-end ms-4"
                                       onClick={() => deleteReview(review)}>delete</a>
                                }
                                {
                                    profile.type !== 'COMMON' && profile._id === review.userID &&
                                    <a href="#review"
                                       className="text-decoration-none float-end"
                                       onClick={() => {
                                           if(!writeReview) {
                                               setEdit(true);
                                               setEditedReview(review);
                                               setReview(review.review);
                                           }
                                       }}>edit</a>
                                }
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    );
};
export default Index;