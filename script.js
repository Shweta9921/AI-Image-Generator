const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");

const promptInput = document.querySelector(".prompt-input");
const promptbtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select")
const gridGallery=document.querySelector(".gallery-grid")
const API_KEY ="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";//hugging face API key
const examplePrompts = [
    "Shweta under a tree with flower",
    "A Dog riding bicycle",
    "A cat in space",
    "A robot as a teacher",
    "Kids playing in a garden",
    "A man on  moon",
    "A cat in space",
    "A robot as a teacher",
    "Kids playing in a garden",
    "A man on  moon",
];
//set theme based on saved preference or system default
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkTheme=savedTheme=== "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className= isDarkTheme ?"fa-solid fa-sun" : "fa-solid fa-moon"
})();
//switch between light and dark themes
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark": "light")
    themeToggle.querySelector("i").className= isDarkTheme ?"fa-solid fa-sun" : "fa-solid fa-moon"
};
const getImageDimensions=(aspectRatio)=>{
    const[width,height]=aspectRatio.split("/").map(Numbers);
    const scaleFactor =baseSize /Math.sqrt(width* height);
    let calculateWidth=Math.round(width*scaleFactor);
    let calculateHeight=Math.round(height*scaleFactor);
    calculateWidth=Math.floor(calculateWidth/16)*16;
    calculateHeight=Math.floor(calculateHeight/16)*16;
    return {width: calculateWidth, height: calculateHeight};
}
const generateImages= async(selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL=`https://api-inference.huggingface.co/models/${selectedModel}`;
    const {width, height}= getImageDimensions(aspectRatio);
    const imagePromises=Array.from({length: imageCount}, async(_,i)=>{
        try{
        const response= await fetch(MODEL_URL,{
            headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
                "x-use-cache":"false",
			},
			method: "POST",
			body: JSON.stringify({
                inputs: promptText,
                parameters:{width, height},
                
            }),
        });
        if(!response.ok) throw new Error((await response.json())?.error);
        const result = await response.blob();
        console.log(result);
        }catch(error){
            console.log(error);
        }
        
    })
    await Promise.allSettled(imagePromises)
}
const createImageCards=(selectedModel, imageCount, aspectRatio, promptText)=>{
    gridGallery.innerHTML ="";
    for(let i=0; i<imageCount; i++){
        gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}>
                        <div class="status-container">
                            <div class="spinner">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                               <p class="status-text">
                                Generating...
                               </p> 
                            </div>
                        </div>
                        <img src="image.png" class="result-img" />
                        
                    </div>`;
    }
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
}

const handleFormSubmit = (e) => {
    e.preventDefault();

    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

   createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

//Fill promot input with random example
promptbtn.addEventListener("click", () => {
    const prompt =examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value=prompt;
    promptInput.focus();
});
promptForm.addEventListener("submit",handleFormSubmit);
themeToggle.addEventListener("click",toggleTheme);
