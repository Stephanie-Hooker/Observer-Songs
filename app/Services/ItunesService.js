import Song from "../Models/Song.js";

// @ts-ignore
let _sandBoxApi = axios.create({
    baseURL: "https://bcw-sandbox.herokuapp.com/api/Stephanie/songs"
})

//Private
let _state = {
    apiSongs: [],
    mySongs: []
}

//NOTE methods to run when a given property in state changes
let _subscribers = {
    apiSongs: [],
    mySongs: []
}

function _setState(propName, data) {
    //NOTE add the data to the state
    _state[propName] = data
    //NOTE run every subscriber function that is watching that data
    _subscribers[propName].forEach(fn => fn());
}

//Public
export default class ItunesService {
    get ApiSongs() {
        return _state.apiSongs.map(item => new Song(item))
    }

    get MySongs() {
        return _state.mySongs.map(item => new Song(item))
    }


    //NOTE adds the subscriber function to the array based on the property it is watching
    addSubscriber(propName, fn) {
        _subscribers[propName].push(fn)
    }

    /**
     * Get  a list of songs from the itunes api via axios by appending a query value to the url.
     * @param {*} query 
     */
    getMusicByQuery(query) {
        var url = 'https://itunes.apple.com/search?callback=?&term=' + query;
        // @ts-ignore
        $.getJSON(url)
            .then(res => {
                // res is the response body from the ajax call
                // a song is contained in the res.resuls in the form of a json object
                console.log(res)
                let results = res.results.map(rawData => new Song(rawData))
                _setState('apiSongs', results)
            })
            .catch(err => console.log(err))
    }

    getMySongs() {
        _sandBoxApi.get()
            .then(res => {
                console.log(res.data)
                _setState('mySongs', res.data.data)
            })
            .catch(err => console.error(err))
    }

    /**
     * Uses an id passed from the onclick event to post a song to our data base via axios and api 
     * we then add the song to MySongs to disploy the right hand column
     * 
     * @param {*} id The id of the song we are trying to add to our list
     */
    addSong(id) {
        let songToSave = this.ApiSongs.find(item => id == item._id)
        if (!songToSave) {
            return alert("We couldnt find that song. sorry")
        }
        _sandBoxApi.post('', songToSave)  //This is taking an empty string because we are not appending the URL
            .then(res => {
                console.log(res.data)
                // res.data.data contains a json object of the song that was stored on the server from the uploaded itunes song.
                let copyOfMySongs = this.MySongs //NOTE safely get a copy of the mySongs array
                copyOfMySongs.push(new Song(res.data.data)) // NOTE modify that copy by adding the song we just added to the db and got back from the server
                _setState('mySongs', copyOfMySongs) //NOTE save that new array as the mySongs array that our application cares about
                //this.getMySongs();
            })
    }
}
