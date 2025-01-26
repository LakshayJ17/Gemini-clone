import { useState, createContext } from "react";
import run from '../config/gemini'

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState('')
    const [recentPrompt, setRecentPrompt] = useState('')
    const [prevPrompts, setPrevPrompts] = useState([])
    const [showResult, setShowResult] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resultData, setResultData] = useState("")

    // Typing effect - This will add a delay of 75ms for each word
    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord)
        }, 75 * index);
    }

    const newChat = () =>{
        setLoading(false)
        setShowResult(false)
    }

    const onSent = async (prompt) => {
        setResultData("")                               // Clear the previous result
        setLoading(true)                                // Show the loader
        setShowResult(true)                             // Show the result

        let response;
        if (prompt !== undefined) {
            response = await run(prompt)                // This will return the response from the AI
            setRecentPrompt(prompt)                     // Set the recent prompt
        } else {
            setPrevPrompts(prev => [...prev, input])    // Add the input to the list of previous prompts
            setRecentPrompt(input)                      // Set the recent prompt
            response = await run(input)                 // This will return the response from the AI
        }


        // The output is somethings like xyz is a **abc** which is def*ghi*klm
        // This will convert the 2 stars to bold
        let responseArray = response.split("**")
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 != 1) {
                newResponse += responseArray[i]
            } else {
                newResponse += "<b>" + responseArray[i] + "</b>"
            }
        }
        // This will convert the 1 star to break/new line
        let newResponse2 = newResponse.split("*").join("<br>")

        let newResponse3 = newResponse2.split(" ")
        for (let i = 0; i < newResponse3.length; i++) {
            if (newResponse3[i].startsWith("##")) {
                newResponse3[i] = "<h2>" + newResponse3[i].substring(2) + "</h2>"
            }
        }
        newResponse3 = newResponse3.join(" ")

        // For typing effect - Split the response into words 
        let newResponseArray = newResponse3.split(" ")
        for (let i = 0; i < newResponseArray.length; i++) {
            const nextWord = newResponseArray[i]
            delayPara(i, nextWord + " ")
        }

        setLoading(false)               // Hide the loader
        setInput("")

    }

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider
