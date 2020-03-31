console.log("Hello");
let url, fullName;
const STARTING_BALANCE = 100; // starting balance for all registerers

$(document).ready(function(){
  // check log in and hide and show everything
  $('#navLoggedIn').hide();
  $('#registerForm').hide();

  if (sessionStorage['username']) {
  	$('#navLoggedIn').show();
  	$('#navLoggedOut').hide();
  	fullName = sessionStorage.getItem('userFName') + " " + sessionStorage.getItem('userLName');
  	document.getElementById("firstNameGreeting").innerHTML = sessionStorage.getItem('userFName');
  }
  else {
  	$('#navLoggedIn').hide();
  	$('#navLoggedOut').show();
  }

  //get url and port from config.json
  $.ajax({
  	url :'config.json',
  	type :'GET',
  	dataType :'json',
  	success : function(data){
  		url = `${data.SERVER_URL}:${data.SERVER_PORT}`;
    },//success
    error:function(){
    	console.log('error: cannot call api');
    }//error
  });//ajax

  //login
  $('#loginButton').click(function(){
  	let username = $('#loginUsername').val();
  	let password = $('#loginPassword').val();
  	console.log(username, password);

  	if (username == '' || password == ''){
  		alert('Please enter all details');
  	}
  	else {
  		$.ajax({
  			url :`${url}/login`,
  			type :'POST',
  			data:{
  				username : username,
  				password : password
  			},
  			success : function(user){
  				console.log(user);
  				if (user == 'User not found'){
  					alert('There is no account for this username. Please try again or register');
  					$('#loginUsername').val('');
  					$('#loginPassword').val('');
  				} else if (user == 'Not authorised. Incorrect password'){
  					alert('Password incorrect. Please try again');
  					$('#loginPassword').val('');
  					$('#loginPassword').focus();
  				} else{
  					sessionStorage.setItem('userID', user['_id']);
  					sessionStorage.setItem('username', user['username']);
  					sessionStorage.setItem('userFName',user['firstName']);
  					sessionStorage.setItem('userLName',user['lastName']);
  					sessionStorage.setItem('userEmail',user['email']);
  					fullName = sessionStorage.getItem('userFName') + " " + sessionStorage.getItem('userLName');
  					document.getElementById("firstNameGreeting").innerHTML = sessionStorage.getItem('userFName');
  					console.log(sessionStorage);
  					$('#navLoggedIn').show();
  					$('#navLoggedOut').hide();
  					$('#registerForm').hide();
  				}
  			},
  			error:function(){
  				console.log('error: cannot call api');
  			}
      });//ajax
  	}
  });//login form

  // logout button
  $('#logoutButton').click(function(){
  	sessionStorage.clear();
  	$('#navLoggedIn').hide();
  	$('#navLoggedOut').show();
  	$('#loginUsername').val("");
  	$('#loginPassword').val("");
  });

  // show register
  $('#registerButton').click(function(){
  	$('#registerUsername').val('');
  	$('#registerFirstName').val('');
  	$('#registerLastName').val('');
  	$('#registerLocation').val('');
  	$('#registerEmail').val('');
  	$('#registerPassword').val('');
  	$('#registerForm').show();
    $('#productCards').hide();
  });

  // register
  $('#registerUser').click(function(){
  	let username = $('#registerUsername').val();
  	let fname = $('#registerFirstName').val();
  	let lname = $('#registerLastName').val();
  	let location = $('#registerLocation').val();
  	let email = $('#registerEmail').val();
  	let password = $('#registerPassword').val();
  	console.log(username,fname,lname,location,email, password);

  	if (username == '' ||fname == '' || lname == '' || location == '' || email == '' || password == ''){
  		alert('Please enter all details');
  	}
  	else {
  		let watchlist = [];
  		$.ajax({
  			url :`${url}/register`,
  			type :'POST',
  			data:{
  				username : username,
  				firstName : fname,
  				lastName : lname,
  				email : email,
  				password : password,
  				watchlist : watchlist,
  				balance : STARTING_BALANCE,
  				location : location
  			},
  			success : function(user){
  				console.log(user);
  				if (user === "This username is already taken. Please try another one"){
  					alert('There is already an account with this username. Please login or try again');
  				}
  				else{
  					$('#registerForm').hide();
  					sessionStorage.setItem('userID', user['_id']);
  					sessionStorage.setItem('username', user['username']);
  					sessionStorage.setItem('userFName',user['firstName']);
  					sessionStorage.setItem('userLName',user['lastName']);
  					sessionStorage.setItem('userEmail',user['email']);
  					fullName = sessionStorage.getItem('userFName') + " " + sessionStorage.getItem('userLName');
  					document.getElementById("firstNameGreeting").innerHTML = sessionStorage.getItem('userFName');
  					$('#navLoggedIn').show();
  					$('#navLoggedOut').hide();
  				}
  			},
  			error:function(){
  				console.log('error: cannot call api');
  			}
      });//ajax
  	} // else
  });//register form

  //Load cards
    $.ajax({
      url: `http://localhost:3000/products`,
      type: 'GET',
      success: function(data){
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          document.getElementById('productCards').innerHTML +=
          `<a href="#">
            <div class=card>
            <img src="${data[i].image}" class="card-img-top" alt="...">
              <div class="card-body">
                <h5 class="card-title">${data[i].title}</h5>
                <p class="card-text">${data[i].description}</p>
              </div>
            </div>
          </a>`
        }
      },
      error: function(error) {
        console.log('no good');
      }
    });
}); // document
