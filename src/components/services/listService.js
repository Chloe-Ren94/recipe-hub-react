export const findRecipeInLists = (lists, recipeID) => {
    for (const list of lists) {
        for (const recipe of list.recipes) {
            if(recipe.recipeID === recipeID) {
                return list.listname;
            }
        }
    }
    return false;
}