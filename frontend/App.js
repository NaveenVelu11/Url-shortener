import {useState} from "react";
import axios from "axios";

function App(){

const [url,setUrl] = useState("");
const [shortUrl,setShortUrl] = useState("");

const shorten = async ()=>{

 const res = await axios.post(
   "http://localhost:5002/shorten",
   { originalUrl:url }
 );

 setShortUrl(res.data.shortUrl);

};

return(

<div>

<h1>URL Shortener</h1>

<input
 placeholder="Enter URL"
 onChange={(e)=>setUrl(e.target.value)}
/>

<button onClick={shorten}>
Shorten
</button>

<p>{shortUrl}</p>

</div>

);

}

export default App;