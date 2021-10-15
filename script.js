// TODO(you): Write the JavaScript necessary to complete the assignment.
const attempt_url = "https://wpr-quiz-api.herokuapp.com/attempts";
const questionContainer = document.querySelector("#question-box");
const resultContainer = document.querySelector("#result-box");
const submitBtn = document.querySelector("#submitBtn");
const retryBtn = document.querySelector("#retryBtn");
const startBtn = document.querySelector("#startBtn");
const body = document.querySelector("body");


async function fetchData() {
  const response = await fetch(attempt_url, { method: "POST" });
  const data = await response.json();
  console.log(data);
  return data;
}

async function fetchSubmit(submitId, answer){
  const url = `https://wpr-quiz-api.herokuapp.com/attempts/${submitId}/submit`;
  const defaultParam = {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json',
    },
    body: JSON.stringify({answers: answer}),
  }
  const myResponse = await fetch(url, defaultParam);
  const json = await myResponse.json();
  return json;
}

// QUESTION SCREEN
function createQuestion(questionsObj, index, length) {
  const question = document.createElement("div");
  question.classList.add("question");
  question.setAttribute("any", questionsObj._id);

  const h1 = document.createElement("h1");
  h1.textContent = "Question " + (index + 1) + " of " + length;

  const form = document.createElement("form");
  form.classList.add("choice-list");

  const p = document.createElement("p");
  p.textContent = questionsObj.text;
  form.appendChild(p);

  for (let i = 0; i < questionsObj.answers.length; i++) {
    const choice = createOption(questionsObj, i, index);
    form.appendChild(choice);
  }
  question.appendChild(h1);
  question.appendChild(form);

  return question;
}

function createOption(questionObj, choiceIndex, index) {
  const choice = document.createElement("div");
  choice.classList.add("choice");

  const input = document.createElement("input");
  input.classList.add("radio-input");
  input.type = "radio";
  input.id = `${index}.${choiceIndex}`;
  input.name = questionObj._id;
  input.value = choiceIndex;

  choice.appendChild(input);

  const label = document.createElement("label");
  label.classList.add("radio-label");
  label.textContent = questionObj.answers[choiceIndex];
  label.setAttribute("for", input.id);
  choice.appendChild(label);

  return choice;
}
async function renderQuestion(questionContainer) {
  const data = await fetchData();

  questionContainer.setAttribute("any", data._id);

  for (let i = 0; i < data.questions.length; i++) {
    const quiz = createQuestion(data.questions[i], i, data.questions.length);

    questionContainer.appendChild(quiz);
  }
}

// RESULT SCREEN
function createResult(data, index) {
  const questionsObj = data.questions[index];
  const length = data.questions.length;
  const result = document.createElement("div");
  result.classList.add("result");

  const h1 = document.createElement("h1");
  h1.textContent = "Question " + (index + 1) + " of " + length;

  const form = document.createElement("form");
  form.classList.add("choice-list");

  const p = document.createElement("p");
  p.textContent = questionsObj.text;
  form.appendChild(p);

  for (let i = 0; i < questionsObj.answers.length; i++) {
    const choice = createResultChoice(data, i, index);
    form.appendChild(choice);
  }
  result.appendChild(h1);
  result.appendChild(form);

  return result;
}

function createResultChoice(data, choiceIndex, index) {
  const questionObj = data.questions[index];
  const userAnswer = data.answers[`${questionObj._id}`];
  const correctAnswer = data.correctAnswers[`${questionObj._id}`];

  const choice = document.createElement("div");
  choice.classList.add("answer");

  const input = document.createElement("input");
  input.disabled = true;
  input.classList.add("radio-input");
  input.type = "radio";
  input.id = `${index}.${choiceIndex}`;
  input.name = questionObj._id;
  input.value = choiceIndex;
  if(choiceIndex == userAnswer){
    input.checked = true;
  }

  choice.appendChild(input);

  const label = document.createElement("label");
  label.classList.add("radio-label");
  label.textContent = questionObj.answers[choiceIndex];
  label.setAttribute("for", input.id);
  
  //render correct answer with green bg
  if(choiceIndex == userAnswer && userAnswer == correctAnswer){
    choice.classList.remove("answer");
    choice.classList.add('checked-correct-answer');

    const detail = document.createElement('span');
    detail.textContent = 'Correct Answer';
    detail.classList.add('answer-detail');
    label.appendChild(detail);
  }
  //render wrong answer with red bg
  if(choiceIndex == userAnswer && userAnswer != correctAnswer){
    choice.classList.remove("answer");
    choice.classList.add('wrong-answer');
    const detail = document.createElement('span');
    detail.textContent = 'Your Answer';
    detail.classList.add('answer-detail');
    label.appendChild(detail);
  }
  //render unchecked correct answer with gray bg
  if(choiceIndex != userAnswer && choiceIndex == correctAnswer){
    choice.classList.remove("answer");
    choice.classList.add('uncheck-correct-answer');
    const detail = document.createElement('span');
    detail.textContent = 'Correct Answer';
    detail.classList.add('answer-detail');
    label.appendChild(detail);
  }
  choice.appendChild(label);
  return choice;
}

async function renderResultScreen(resultContainer, submitId, answer){
  const data = await fetchSubmit(submitId, answer);
  console.log(data);

  for (let i = 0; i < data.questions.length; i++) {
    const result = createResult(data, i);

    resultContainer.appendChild(result);
  }
  document.querySelector('#ten').textContent = `${data.score}/${data.questions.length}`;
  document.querySelector('#percent').textContent = `${(data.score/data.questions.length)*10}%`;
  document.querySelector('#scoreText').textContent =`${data.scoreText}`;
}

//button control
/**
 * @param {Event} event
 */
//from intro to attempt
async function start(event) {
  await renderQuestion(questionContainer);

  // toggle view
  const introSection = document.querySelector("#introduction");
  const attemptSection = document.querySelector("#attempt-quiz");
  const imageSection = document.querySelector("#quiz-name");

  imageSection.classList.toggle("hidden");
  introSection.classList.toggle("hidden");
  attemptSection.classList.toggle("hidden");
  body.scrollIntoView();
}

async function retry(event) {
  // toggle view
  const introSection = document.querySelector("#introduction");
  const reviewSection = document.querySelector("#review-quiz");
  const imageSection = document.querySelector("#quiz-name");

  while (questionContainer.firstChild) {
    resultContainer.removeChild(resultContainer.lastChild);
    questionContainer.removeChild(questionContainer.lastChild);
  }

  imageSection.classList.toggle("hidden");
  introSection.classList.toggle("hidden");
  reviewSection.classList.toggle("hidden");
  body.scrollIntoView();
}

function submit(event){
  if(!confirm("Do you really want to do this?")) {
    return false;
  }
  onSubmit();
}

async function onSubmit() {
  const submitId = questionContainer.getAttribute("any");
  const childList = questionContainer.getElementsByClassName("question");

  //create answer object for submit
  let answer = {};
  for (i = 0; i < childList.length; i++) {
    const questionId = childList[i].getAttribute("any");
    let selectedValue = document
    .querySelector(`input[name="${questionId}"]:checked`);
    if(selectedValue !== null){
      selectedValue = selectedValue.getAttribute("value");
    }

    answer[`${questionId}`] = selectedValue;
  }

  await renderResultScreen(resultContainer, submitId, answer);
  
  // toggle view
  const attemptSection = document.querySelector("#attempt-quiz");
  const reviewSection = document.querySelector("#review-quiz");

  attemptSection.classList.toggle("hidden");
  reviewSection.classList.toggle("hidden");
  body.scrollIntoView();
}
startBtn.addEventListener("click", start);
submitBtn.addEventListener("click", submit);
retryBtn.addEventListener("click", retry);
