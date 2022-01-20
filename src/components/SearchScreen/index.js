import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import "./index.css"
import {useSelector} from "react-redux";
import Navigation from "../Navigation";
import {API_KEY} from "../../consts";

const Index = () => {
    const params = useParams();
    const navigate = useNavigate();
    const keyword = params.searchTerm || ''
    const [searchTerm, setSearchTerm] = useState(keyword);
    const [recipes, setRecipes] = useState([]);
    const findRecipes = () =>
    {
        navigate(`/search/${searchTerm}`);
        searchTerm &&
        fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${searchTerm}&apiKey=${API_KEY}&addRecipeInformation=true`)
            .then(res => res.json())
            .then(result => {
                setRecipes(result.results)
            })
    }
    useEffect(findRecipes, []);

    const profile = useSelector(state => state.profile);

    return(
        <div className="container mt-5">
            <Navigation active='search'/>
            <img src="/images/recipe.jpeg" className="mx-auto d-block bg-pic mt-5"/>
            <div className="mt-4 input-group mx-auto width-70">
                <input
                    className="form-control rounded-pill me-3"
                    onChange={(e) =>
                        setSearchTerm(e.target.value)}
                    value={searchTerm}
                    placeholder="Search recipes"/>
                <button
                    className="btn btn-primary rounded-pill float-end"
                    onClick={findRecipes}>
                    Search
                </button>
            </div>

            <ul className="list-group mt-4 width-70 mx-auto">
                {
                    recipes &&
                    recipes.map(recipe =>
                        <li key={recipe.id} className="list-group-item">
                            <Link to={`/details/${recipe.id}`}
                                  className="no-underline">
                                <div className="row">
                                    <img className="col-6 col-sm-4 col-md-3 col-lg-2"
                                         src={recipe.image} style={{width: "156px", height: "115px"}}/>
                                    <div className="col-6 col-sm-6 col-md-8 col-lg-8 align-self-center ps-5">
                                        {recipe.title} ({recipe.readyInMinutes} min)
                                    </div>
                                </div>
                            </Link>
                        </li>
                    )
                }
            </ul>
            {
                params.searchTerm && !recipes &&
                <p className="text-danger text-center">
                    Sorry! Cannot find result for <b><i>{keyword}.</i></b>
                </p>
            }
        </div>
    )
};
export default Index;