const meals= document.getElementById('meals');
const favMeals=document.getElementById('favMeals');
const searchTerm= document.getElementById('searchTerm');
const searchBtn=document.getElementById('search');
const mealPopup=document.getElementById('meal-popup');
const popupCloseBtn=document.getElementById('close-popup')
const mealInfoEl=document.getElementById('meal-info')

getRandomMeal();
fetchFavMeals();
async function getRandomMeal(){
    const resp=await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData=await resp.json();
    const randomMeal=respData.meals[0];
    console.log(randomMeal);
    addMeal(randomMeal,true);
}

async function getMealById(id){

    const resp=await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id);
    const respData=await resp.json();
    const meal=respData.meals[0];
    return meal;
}

async function getMealsBySearch(term){
    const resp=await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="+term);
    const respData=await resp.json();
    const meals= respData.meals;
    return meals;
}
function addMeal(mealData,random=false){
    const meal=document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML=`
    <div class="mealHeader">
    ${random?`
    <h4 class="random">
        Random Recipe
    </h4>`:''}
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="mealBody">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn" >
            <i class="fas fa-heart"></i>
        </button>
    </div>
        `;
    
    const btn=meal.querySelector('.mealBody .fav-btn');
        btn.addEventListener("click",()=>{
            if (btn.classList.contains('active')) {
                
                removeMealFromLS(mealData.idMeal);
                btn.classList.remove("active");

            }
            else{
                addMealToLS(mealData.idMeal)
                btn.classList.add("active");
            }
            
            fetchFavMeals();
        });
        meal.addEventListener('click',()=>{
            showMealInfo(mealData);
        });
        meals.appendChild(meal);
        
        

}

function removeMealFromLS(mealId){
    const mealIds=getMealFromLS();
    localStorage.setItem('mealIds',JSON.stringify(mealIds.filter(id=>id!==mealId)));

}

function addMealToLS(mealId){
    const mealIds=getMealFromLS();
    localStorage.setItem('mealIds',JSON.stringify([...mealIds,mealId]));
}

function getMealFromLS(){
    const mealIds=JSON.parse(localStorage.getItem("mealIds"));
    // console.log(meal)
    return mealIds===null?[]:mealIds;
}

async function fetchFavMeals(){
    favMeals.innerHTML='';
    const mealIds=getMealFromLS();
    // const meals=[];

    for(let i=0;i<mealIds.length;i++){
        const mealId=mealIds[i];
        const meal=await getMealById(mealId);
        addMealToFav(meal);
    }
    // console.log(meals);
    //add them to the screen
}

function addMealToFav(mealData){
    const favMeal=document.createElement('li');
    favMeal.classList.add("textWidth");
    let nameMeal=mealData.strMeal;
    // nameMeal=nameMeal.split(" ").join("");
    favMeal.innerHTML=`
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="textWidth"><span >${nameMeal}</span>
    <button class="clear">
    <i class="fa-solid fa-rectangle-xmark" style="color:#274046; cursor:pointer"></i></button>`;
        const btn=favMeal.querySelector('.clear');
        btn.addEventListener('click',()=>{
            removeMealFromLS(mealData.idMeal);
            fetchFavMeals();
        });
        favMeal.addEventListener('click',()=>{
            showMealInfo(mealData);
        });
        favMeals.appendChild(favMeal);

}

function showMealInfo(mealData){
// clean it up
    mealInfoEl.innerHTML=``;

    // update the meal info
    const mealEl=document.createElement('div');

    const ingredients=[];
    // get ingredients and measures
    for (let i = 1; i <=20 ; i++) {
        if (mealData['strIngredient'+i]) {

            ingredients.push(`${mealData['strIngredient'+i]}/${mealData['strMeasure'+i]}`)
            
        }
        else{
            break;
        }    
    }

    mealEl.innerHTML=
        `
         <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="" class="center">

        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients/Measures</h3>
        <ul>
            ${ingredients.map((ing)=>`<li>${ing}</li>`).join("")}
        </ul>
        `;
        mealInfoEl.appendChild(mealEl);
    // show the popup
    mealPopup.classList.remove('hidden');

}


searchBtn.addEventListener('click',async()=>{
    meals.innerHTML='';
    const search=searchTerm.value;
    // console.log(await getMealsBySearch(search));
    const Meals=await getMealsBySearch(search);
    if (Meals) {
        
    
        Meals.forEach(meal=>{
            addMeal(meal);

        })
    }
    else{
        meals.innerHTML=`<div style="padding-top:6rem;font-size:2rem;height:18rem;background: -webkit-linear-gradient(to right, #E2E2E2, #C9D6FF);background: linear-gradient(to right, #E2E2E2, #C9D6FF);">No such meals found..😔😔</div>`;

    }

});

popupCloseBtn.addEventListener('click',()=>{
    mealPopup.classList.add("hidden");

});
