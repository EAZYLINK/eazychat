import bot from './assets/bot.svg'
import user from './assets/user.svg'
import speaker_url from './assets/speaker-50.png'
import speakercsl_url from './assets/cancel_speaker.png'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const input = document.querySelector("#input")
const field = document.querySelector('#textarea')
const submitBtn = document.querySelector('#submit')
const voice = document.querySelector('#voice')
const icon = document.querySelector('.speaker')
function speaker(Data){
    let speakData = new SpeechSynthesisUtterance(Data);
    console.log(speakData)
    speakData.voice = speechSynthesis.getVoices()[0];
    speakData.rate = 1;
    speechSynthesis.speak(speakData)
}



let loadInterval

function loader(element) {
    element.textContent = ''
    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async () => {
    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch("https://eazychat-nt30.onrender.com/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok && response.length !=0) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
        speaker(parsedData)
        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}


function inputVoices(){
    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = async function(event) {
    var transcript = event.results[0][0].transcript;
    field.textContent = transcript
    if (field.textContent !== ''){
        await handleSubmit()
        field.textContent = ''
    }
    }
}

voice.addEventListener('click', function (){
    if(icon.getAttribute('src') === speaker_url) {
        icon.setAttribute('src', speakercsl_url)
        speechSynthesis.pause(); 
    } else
    {
        icon.setAttribute('src', speaker_url)
        speechSynthesis.resume();
    }
    console.log(icon.getAttribute('src') === speaker_url)
})

input.addEventListener('click', inputVoices)
field.addEventListener('keypress', function (event){
    if(event.key == 'enter'){
        event.preventDefault()
        handleSubmit
    }
})
submitBtn.addEventListener('click', handleSubmit)
form.addEventListener('audioend', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})