const quizData = [

{
    question:"大谷翔平の出身高校は？(What is Shohei Ohtani's high school?)",

    choices:[
        "花巻東高校(hanamaki east highschool)",
        "盛岡第一高校(morioka daiichi highschool)",
        "仙台育英高校(sendai ikuei highschool)",
        "麗澤高校(reitaku highschool)"
    ],

    answer:0,

    wiki:"https://ja.wikipedia.org/wiki/花巻東高等学校",

    description:""
},

{
    question:"エンゼルスの本拠地は？(What is the home stadium of the Angels)",

    choices:[
        "Angel Stadium",
        "Dodger Stadium",
        "Yankee Stadium",
        "Fenway Park"
    ],

    answer:0,

    wiki:"https://ja.wikipedia.org/wiki/エンゼル・スタジアム・オブ・アナハイム",

    description:""
}

];

let current = 0;
let score = 0;

const quizPanel = document.getElementById("quizPanel");
const question = document.getElementById("question");
const choicesArea = document.getElementById("choices");
const explanation = document.getElementById("explanation");
const nextButton = document.getElementById("nextButton");

document.getElementById("quizButton").addEventListener("click",()=>{

    current = 0;
    score = 0;

    quizPanel.style.display="block";

    showQuestion();

});

document.getElementById("closeQuiz").addEventListener("click",()=>{

    quizPanel.style.display="none";

});

function showQuestion(){

    explanation.innerHTML="";

    nextButton.style.display="none";

    const q = quizData[current];

    question.innerHTML="Q"+(current+1)+". "+q.question;

    choicesArea.innerHTML="";

    q.choices.forEach((choice,index)=>{

        const button=document.createElement("button");

        button.className="choice";

        button.innerHTML=choice;

        button.addEventListener("click",()=>{

            checkAnswer(index);

        });

        choicesArea.appendChild(button);

    });

}

function checkAnswer(selected){

    const q=quizData[current];

    const buttons=document.querySelectorAll(".choice");

    buttons.forEach(button=>button.disabled=true);

    buttons[q.answer].classList.add("correct");
    buttons[q.answer].innerHTML="⭕ "+buttons[q.answer].innerHTML;

    if(selected===q.answer){

        score++;

    }else{

        buttons[selected].classList.add("wrong");
        buttons[selected].innerHTML="❌ "+buttons[selected].innerHTML;

        if(q.wiki!=""){

            explanation.innerHTML=
            `<a href="${q.wiki}" target="_blank">
            Wikipediaを見る
            </a>`;

        }else{

            explanation.innerHTML=q.description;

        }

    }

    nextButton.style.display="inline-block";

}

nextButton.addEventListener("click",()=>{

    current++;

    if(current>=quizData.length){

        question.innerHTML=
        `終了！<br><br>${score} / ${quizData.length}問正解`;

        choicesArea.innerHTML="";

        explanation.innerHTML="";

        nextButton.style.display="none";

        return;

    }

    showQuestion();

});
