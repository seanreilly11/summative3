let url, fullName, productId;
const STARTING_BALANCE = 100; // starting balance for all registerers

$(document).ready(function(){
	// check log in and hide and show everything
	$('#navLoggedIn').hide();
	$('#registerForm').hide();
	$("#productCards").show();

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

	$(".navbar-brand").click(function(){
		showAllProducts();
	});

	//get url and port from config.json
	$.ajax({
		url :'config.json',
		type :'GET',
		dataType :'json',
		success : function(data){
			url = `${data.SERVER_URL}:${data.SERVER_PORT}`;
			showAllProducts();
			addProfileDetails();
			// showProductInfo();
		},//success
		error:function(){
			console.log('error: cannot call api');
		}//error
	});//ajax

	//Load cards
	function showAllProducts(){
		$.ajax({
			url: `${url}/products`,
			type: 'GET',
			dataType :'json',
			success: function(data){
				console.log(data);
				if(window.location.href.includes("index.html")){
					document.getElementById('productCards').innerHTML = "";
					for (let i = 0; i < data.length; i++) {
						document.getElementById('productCards').innerHTML +=
						`<div class="product-link card col" id="${data[i]["_id"]}" >
							<img class="img-thumbnail" src="${data[i].image}" alt="Image">
							<div class="card-body">
								<h3 class="card-title"> ${data[i].title}</h3>
								<h4 class="card-text">$${data[i].price}</h4>
							</div>
						</div>`;
					}
				}
			},
			error: function(error) {
				console.log('no good');
			}
		})
	}

	//login
	$('#loginButton').click(function(){
		let username = $('#loginUsername').val();
		let password = $('#loginPassword').val();

		if (username == '' || password == ''){
			swal({
				title: 'Enter username and password',
				text: 'Please fill all fields details',
				icon: 'warning',
				button: 'Got it',
				timer: 2500
			});
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
						swal({
							title: 'Not a user',
							text: 'There is no account for this username. Please try again or register',
							icon: 'warning',
							button: 'Got it',
							timer: 2500
						});
						$('#loginUsername').val('');
						$('#loginPassword').val('');
					} else if (user == 'Not authorised. Incorrect password'){
						swal({
							title: 'Incorrect password',
							text: 'Password incorrect. Please try again',
							icon: 'warning',
							button: 'Got it',
							timer: 2500
						});
						swal({
							title: 'Incorrect Password',
							text: 'Password incorrect. Please try again',
							icon: 'warning',
							button: 'Got it',
							timer: 2500
						});
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
						console.log(window.location.href)
						showAllProducts();
					}
				},
				error:function(){
					console.log('error: cannot call api');
				}
			});//ajax
		}
	});//login form

	// logout button
	$('.logoutButton').click(function(){
		sessionStorage.clear();
		$('#navLoggedIn').hide();
		$('#navLoggedOut').show();
		$('#loginUsername').val("");
		$('#loginPassword').val("");
		$("#productCards").show();
	});

	// show register
	$('#registerButton').click(function(){
		$('#productCards').hide();
		$('#filterContainer').hide();
		$('#registerUsername').val('');
		$('#registerFirstName').val('');
		$('#registerLastName').val('');
		$('#registerLocation').val('');
		$('#registerEmail').val('');
		$('#registerPassword').val('');
		$('#registerForm').show();
	});

	// register
	$('#registerUser').click(function(){
		let username = $('#registerUsername').val();
		let fname = $('#registerFirstName').val();
		let lname = $('#registerLastName').val();
		let location = $('#registerLocation').val();
		let email = $('#registerEmail').val();
		let password = $('#registerPassword').val();

		if (username == '' ||fname == '' || lname == '' || location == '' || email == '' || password == ''){
			swal({
				title: 'Fill Out Details',
				text: 'Please enter all details',
				icon: 'warning',
				button: 'Got it',
				timer: 2500
			});
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
						swal({
							title: 'error',
							text: 'There is already an account with this username. Please login or try again',
							icon: 'warning',
							button: 'Got it',
							timer: 2500
						});
					}
					else{
						$('#registerForm').hide();
						$('#loginUsername').focus();
						swal({
							title: 'Success!',
							text: `Congratulations! Your new account has been registered\n Please log in to continue`,
							icon: 'success',
							button: 'Okay!',
							timer: 2500
						});
					}
				},
				error:function(){
					console.log('error: cannot call api');
				}
			});//ajax
		} // else
	});//register form

	// add profile details on account page
	function addProfileDetails(){
		$.ajax({
			url :`${url}/users/u=${sessionStorage.getItem('userID')}`,
			type :'GET',
			dataType :'json',
			success : function(data){
				console.log(data);
				if(window.location.href.includes("profile.html")){
					$("#profile-username").html(data.username);
					$("#profile-fullname").html(fullName);
					$("#profile-email").html(data.email);
					$("#profile-balance").html(`$${data.balance}`);
				}
			},//success
			error:function(){
				console.log('error: cannot call api');
			}//error
		});//ajax
	}// add profile details

	// $(".product-link").click(function(){
	// 	sessionStorage.setItem('productId',"this id");
	// 	productId = $(this).attr('id');
	// 	// console.log($(this).id, productId, sessionStorage)
	// })

	// function showProductInfo(){
	// 	let id = sessionStorage.getItem('productId');
	// 	console.log(productId);
	// 	$.ajax({
	// 		url :`${url}/products/`,
	// 		type :'GET',
	// 		dataType :'json',
	// 		success : function(data){
	// 			console.log(data);
	// 			if(window.location.href.includes("product.html")){
	// 				$("#product-info").html(data.title)
	// 			}
	// 		},//success
	// 		error:function(){
	// 			console.log('error: cannot call api');
	// 		}//error
	// 	});//ajax
	// }

	// add and remove active list class on profile side bar
	$(".account-info__sidebar__list-item").click(function(){
		let list = document.querySelectorAll(".account-info__sidebar__list-item");
		for(var i = 0; i < list.length; i++){
			list[i].classList.remove("account-info__sidebar__list-item--active");
		}
		$(this).addClass("account-info__sidebar__list-item--active")
	});
}); // document
