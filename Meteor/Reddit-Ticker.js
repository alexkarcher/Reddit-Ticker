if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  //var currtime = new Date().getTime() / 1000 - (1 * 365.25 * 24 * 60 * 60);
  //                                            yrs days     hrs  min  sec
  //var past = currtime - (6 * 365.25 * 24 * 60 * 60);
  //                     yrs days     hrs  min  sec
  //console.log(currtime | 0);
  //console.log(past | 0);
  /*Meteor.call('reddit',"rpi", past, currtime, function (err, data){
    
    //Debug print out the entire object returned from Reddit
    console.log(data);
    
    /*Seriously Reddit? This is what it apparently takes 
       to get at the post title and upvote count *//*
    for (var i in data.data.data.children){
      console.log({title: data.data.data.children[i].data.title, 
                   votes: data.data.data.children[i].data.score});
    }
  });  */

Template.body.events({
    "submit .new-team":function (event) {
      event.preventDefault();
      //set up the checked property to the opposite of its current value
      var subreddit = event.target.inputTeamName.value;
      
      var currtime = new Date().getTime() / 1000 - (1 * 365.25 * 24 * 60 * 60);
      //                                            yrs days     hrs  min  sec
      var past = currtime - (6 * 365.25 * 24 * 60 * 60);

      Meteor.call("reddit", subreddit, past, currtime, function(err, data){
        for (var i in data.data.data.children){
        console.log({title: data.data.data.children[i].data.title, 
                   votes: data.data.data.children[i].data.score});
        }
      });
      //event.target.inputTeamName.value = "";
    }
   
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    
  });
}

Meteor.methods({
  reddit: function (subreddit, startTime, endTime) {
    var result = HTTP.call("GET", "http://reddit.com/r/"+subreddit+"/search.json?restrict_sr=true&limit=5&sort=top&q=timestamp:"+(startTime | 0)+".."+(endTime | 0)+"&syntax=cloudsearch");
    return result;

  }
});