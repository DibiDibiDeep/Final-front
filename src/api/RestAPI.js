export function Getapi(address){
    const url = `http://localhost:8080${address}`
    
    return (
        fetch(url, {
            method: 'GET',
            headers:{
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Access-Cross-Allow-Origin': "*"
            }
        })
    )
}