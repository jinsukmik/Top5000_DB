// dependencies //
// import mysql npm package
var mysql = require("mysql");
// import inquirer npm package
var inquirer = require("inquirer");

// create credentials for mysql connection //
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // user name
    user: "root",
    // password
    password: "root",
    // database name
    database: "top_songsDB"
});
// create the connection //
connection.connect(function(err){
    // if there is an error, throw it
    if(err) throw err;
    // run a function called runSearch
    runSearch();
})

// Inquirer for CLI control //
// function that prompts the user on what to do 
function runSearch(){
    inquirer
    // where we pass in the question(s) we want to ask and possible choices
    .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "Find songs by artist",
            "Find all artists who appear more than once",
            "Find data within a specific range",
            "Search for a specific song"
        ]
    })
    // where we use the user choice to run the next function and break out of the switch statement
    .then(function(answer){
        switch(answer.action){
            case "Find songs by artist":
                artistSearch();
                break;
            case "Find all artists who appear more than once":
                multiSearch();
                break;
            case "Find data within a specific range":
                rangeSearch();
                break;
            case "Search for a specific song":
                songSearch();
                break;
        }
    })
}

// function asks for the artist name and sends a SQL query to the database based on the user input //
function artistSearch(){
    inquirer
    // where we pass in the question on which artist to search for
    .prompt({
        name: "artist",
        type: "input",
        message: "What artist would you like to search for?"
    })
    // where we use the users input to create a SQL query 
    .then(function(answer){
        // create a query to select the following properties from table top5000 where it matches answer.artist
        var query = "SELECT position, song, year FROM top5000 WHERE ?";
        // send our query and replace ? with, where the database artist is equal to our answer.artist
        connection.query(query, {artist: answer.artist}, function(err,res){
            // we loop through the response we get from the database and for every iteration we console.log that datas position, song name and year of release
            for(var i = 0; i < res.length; i++){
                console.log("Position: " + res[i].position + " || Song: " + res[i].song + " || Year: " + res[i].year);
            }
            // we bring the user back to beginning and prompt the user again 
            runSearch();
        });
    });
}

function rangeSearch(){
    inquirer
    // where we ask for the position range for songs to search for
    .prompt([
        {
            name: "start",
            type: "input",
            message: "Entering starting positions: ",
            // check to see if value is not a number 
            validate: function(value){
                if(isNaN(value) === false) {
                    return true;
                }
                return false
            }
        },
        {
            name: "end",
            type: "input",
            message: "Enter ending positions: ",
            // check to see if the value is not a number
            validate: function(value) {
                if (isNaN(value) === false){
                    return true;
                }
                return false;
            }
        }
    ])
    // uses user input to create a SQL query
    .then(function(answer){
        // create a SQL query to select the following properties from the table top500 where position is between answer.start and answer.end
        var query = "SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?";
        //send our query and replace ? ? with answer.start and answer.end
        connection.query(query, [answer.start, answer.end], function(err,res){
            for (var i = 0; i < res.length; i++){
                console.log(
                    "Position: " + res[i].position + 
                    " || Song: " + res[i].song +
                    " || Artist: " + res[i].artist + 
                    " || Year: " + res[i].year
                );
            }
            // we bring the user back to the beginning and prompt the user again
            runSearch();
        })
    })
}
//function to handle looking for artists that appear more than once //
function multiSearch() {
    // create query to select artist from the table top5000 that show more than once
    var query = 'SELECT artist from top5000 GROUP BY artist HAVING count(*) > 1';
    connection.query(query, function (err, res) {
        // iterate through the response and console.log each of their artist names
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].artist);
        }
        // take the user back to the beginning and prompt the user again
        runSearch();
    });
}
// function to handle a song name searching //
function songSearch() {
    inquirer
        .prompt({
            name: "song",
            type: "input",
            message: "What song would you like to look for?"
        })
        // use user input to create a SQL query
        .then(function (answer) {
            // create a SQL query to select all from table top5000 where song is equal to our answer from the prompt
            var query = "SELECT * FROM top5000 WHERE ?";
            // send our query and replace ? with, where song matches our answer.song
            connection.query(query, { song: answer.song }, function (err, res) {
                // console.log the FIRST match that you find
                console.log(
                    "Position: " + res[0].position +
                    " || Song: " + res[0].song +
                    " || Artist: " + res[0].artist +
                    " || Year: " + res[0].year
                );
                // we bring the user back to the beginning and prompt the user again
                runSearch();
            })
        })
}