import { Getapi } from "../api/RestAPI";
import React, {useState} from "react";

function Main(){
    const[hello, setHello] = useState("");
    const[res, setRes] = useState("");

    const helloapi = async () => {

        const address = '/test/hello'
        const response = await Getapi(address)
        const data = await response.json();
        setHello(data.test)
        setRes(data.count)
        return data

    }

    const hellobutton = () => {
        helloapi();
    }

    return (
        <div>
            <p>안녕 세상아!</p>
            <button onClick={hellobutton}>hello</button>
            <p>{hello}</p>
            <p>카운트: {res}</p>
        </div>
    )
}

export default Main;