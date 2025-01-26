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

    const onSent = async () => {
        setResultData("")                               // Clear the previous result
        setLoading(true)                                // Show the loader
        setShowResult(true)                             // Show the result
        setRecentPrompt(input)                          // Set the recent prompt
        setPrevPrompts(prev => [...prev, input])        // Add the input to the list of previous prompts

        const response = await run(input) // This will return the response from the AI

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

        // For typing effect - Split the response into words 
        let newResponseArray = newResponse2.split(" ")
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
        setInput
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider
