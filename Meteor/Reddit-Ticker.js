Posts = new Mongo.Collection("posts");

if (Meteor.isServer) {
  Meteor.publish("posts",function() {
    return Posts.find({});
  })
}

if (Meteor.isClient) {
  
  Meteor.subscribe("posts");

  Session.setDefault('subreddit',"rpi");
  //Session.set('subreddit', "rpi");

  var currtime = new Date().getTime() / 1000 - (1 * 365.25 * 24 * 60 * 60);
  //                                            yrs days     hrs  min  sec
  var past = currtime - (6 * 365.25 * 24 * 60 * 60);
  //                     yrs days     hrs  min  sec
  //console.log(currtime | 0);
  //console.log(past | 0);
  Meteor.call('blankPosts');

  var sub = Session.get('subreddit');

  Meteor.call('reddit', sub, past, currtime, function (err, data){
    
    //Debug print out the entire object returned from Reddit
    console.log(data);
    
    /*Seriously Reddit? This is what it apparently takes 
       to get at the post title and upvote count */
    
    for (var i in data.data.data.children){
      console.log({title: data.data.data.children[i].data.title, 
                   votes: data.data.data.children[i].data.score});
      var post = data.data.data.children[i].data;
      console.log(post);
      Meteor.call('addPost', post);
    }
  });  
Template.body.helpers({
  posts: function(){
    return Posts.find({});
  },
  sub: function(){
    return Session.get('subreddit');
  }
});
Template.body.events({
    "submit .input-subreddit":function (event) {
      event.preventDefault();
      //set up the checked property to the opposite of its current value
      Session.set('subreddit',event.target.subreddit.value);
      
      var currtime = new Date().getTime() / 1000 - (1 * 365.25 * 24 * 60 * 60);
      //                                            yrs days     hrs  min  sec
      var past = currtime - (6 * 365.25 * 24 * 60 * 60);

      Meteor.call("reddit", Session.get('subreddit'), past, currtime, function(err, data){
        console.log("in callback");
      });
      event.target.subreddit.value = "";

    }
   
  });
}

Meteor.methods({
  reddit: function (subreddit, startTime, endTime) {
    var result = HTTP.call("GET", "http://reddit.com/r/"+subreddit+"/search.json?restrict_sr=true&limit=5&sort=top&q=timestamp:"+(startTime | 0)+".."+(endTime | 0)+"&syntax=cloudsearch");
    return result;//Meteor.call("addPost", result);

  },
  addPost: function(data){
    Posts.insert({
      title: data.title,
      createdAt: data.created_utc,
      karma: data.score,
      username: data.author,
      link: data.permalink
    });
  },
  blankPosts: function(){
    Posts.remove({});
  }
});