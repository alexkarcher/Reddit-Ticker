//Alex Karcher
//Cisco Programming Challenge
//11.18.15

//Create a new collection to hold posts
Posts = new Mongo.Collection("posts");

//Pass those posts from the server to the client
if (Meteor.isServer) {
  Meteor.publish("posts",function() {
    return Posts.find({});
  })
}

//Client side code
if (Meteor.isClient) {
  
  //After the posts are loaded render the subreddit title
  Meteor.subscribe("posts", {onReady: function(){

      //load stats for /r/rpi by default on the first run
      if(Posts.find({}).count() == 0){
      console.log("no initial posts");
      Session.set('subreddit', "rpi");

      Meteor.call('reddit', "rpi");
      }
      else{
        console.log(Posts.find({}).fetch()[0]);
        Session.set('subreddit', Posts.find({}).fetch()[0].subreddit);
      }
    }
  });

//Functions called by spacebars in .html
Template.body.helpers({
  posts: function(){
    return Posts.find({});
  },
  loading: function(){
    return Posts.find({}).count() == 0;
  },
  sub: function(){
    return Posts.find({}).fetch()[0].subreddit;
  }
});

//Functions to be called on form completions
Template.body.events({
    "submit .input-subreddit":function (event) {
      event.preventDefault();
      
      Session.set('subreddit',event.target.subreddit.value);

      Meteor.call('blankPosts');
      
      var sub = Session.get('subreddit');

      Meteor.call('reddit', sub);
      
      event.target.subreddit.value = "";

    }
   
  });
}

//Functions ran on both client and server
Meteor.methods({
  reddit: function (subreddit) {
    if(Meteor.isServer){
      console.log("searching for posts on /r/"+subreddit);
      var endTime = new Date().getTime() / 1000 - (1 * 365.25 * 24 * 60 * 60);
      //                                            yrs days     hrs  min  sec
      var startTime = endTime - (6 * 365.25 * 24 * 60 * 60);
      //                     yrs days     hrs  min  sec

      var data = HTTP.call("GET", "http://reddit.com/r/"+subreddit+"/search.json?restrict_sr=true&limit=5&sort=top&q=timestamp:"+(startTime | 0)+".."+(endTime | 0)+"&syntax=cloudsearch");

      for (var i in data.data.data.children){
              console.log({title: data.data.data.children[i].data.title, 
                           votes: data.data.data.children[i].data.score});
              var post = data.data.data.children[i].data;
              //console.log(post);
              Meteor.call('addPost', post);
      }
    }
    //return result;//Meteor.call("addPost", result);

  },
  addPost: function(data){
    Posts.insert({
      title: data.title,
      createdAt: data.created_utc,
      karma: data.score,
      username: data.author,
      link: data.permalink,
      subreddit: data.subreddit
    });
  },
  blankPosts: function(){
    Posts.remove({});
  }
});