if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  
  Meteor.call('reddit', function (err, data){
    
    //Debug print out the entire object returned from Reddit
    console.log(data);
    
    /*Seriously Reddit? This is what it apparently takes 
       to get at the post title and upvote count */
    for (var i in data.data.data.children){
      console.log({title: data.data.data.children[i].data.title, 
                   votes: data.data.data.children[i].data.score});
    }
  });  

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    
  });
}

Meteor.methods({
  reddit: function () {
    var result = HTTP.call("GET", "http://reddit.com/r/rpi/top.json",
                           {params: {limit: 5, t: "year"}});
    return result;

  }
});