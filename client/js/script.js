let url, fullName, productId;
const STARTING_BALANCE = 100; // starting balance for all registerers

$(document).ready(function(){
	// check log in and hide and show everything
	$('#navLoggedIn').hide();
	$('#registerForm').hide();
	$('#account').hide();
	$("#productCards").show();
	$('#productPage').hide();

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
		$("#account").hide();
		$('#registerForm').hide();
		showAllProducts();
		$("#productCards").show();
		$('#productPage').toggle();
	});

	//get url and port from config.json
	$.ajax({
		url :'config.json',
		type :'GET',
		dataType :'json',
		success : function(data){
			url = `${data.SERVER_URL}:${data.SERVER_PORT}`;
			showAllProducts();
		},//success
		error:function(){
			console.log('error: cannot call api');
		}//error
	});//ajax

	//category filter
	$('#categories').on('click', 'button', function(clickedButton) {
		let clickedCategory = clickedButton.target.id.slice(0, -6);
		let btnCategory = clickedButton.target.id;
		console.log(btnCategory);
		console.log(clickedCategory);
		let list = document.querySelectorAll(".btn-category");
		for(var i = 0; i < list.length; i++){
			list[i].classList.remove(".btn-secondary");
			list[i].classList.add(".btn-outline-secondary");
		}
		document.getElementById(btnCategory).classList.add('btn-secondary');
		document.getElementById(btnCategory).classList.remove('btn-outline-secondary');
			$.ajax({
			url: `${url}/products`,
			type: 'GET',
			dataType: 'json',
			success: function(data){
				document.getElementById('productCards').innerHTML = " ";
				for (var i = 0; i < data.length; i++) {
					let cat = data[i].category.toLowerCase();
					console.log(data[i].category, cat);
					if (cat.includes(clickedCategory)) {
						let card =`<div class="product-link position-relative card col-3" id="${data[i]["_id"]}">
						<img class="card-img-top" src="${data[i].image}" alt="Image">`;
						if (sessionStorage['username']) {
							card += `<div class="watchlistCardBtn" title="Add to watchlist">+</div>`;
						}
						card += `<div class="card-body">
						<h3 class="card-title"> ${data[i].title}</h3>
						<h4 class="card-text">$${data[i].price}</h4>
						</div></div>`;
						document.getElementById('productCards').innerHTML += card;
					}
				}
				openProduct();
			},
			error: function(){
				console.log('cannot get category');
			}
		})
	});

	$('.btn-category').click(function(){
		$('#account').hide();
		$("#productCards").show();
		$('#productPage').hide();
	})


	//price filter
	$('#filterSelect').on('change', function(){
		if ($(this).val() == 'low') {
			console.log('low to high price selected');
			$.ajax({
				url: `${url}/products`,
				type: 'GET',
				dataType: 'json',
				success: function(data){
					for (var i = 0; i < data.length; i++) {
						let products = data[i].price;
						function compare(a ,b){
							return a.price - b.price;
						};
						data.sort(compare);
						console.log(products);
					}
				},
				error: function(){
					console.log('cannot filter objects');
				}
		});//ajax end
		} else if ($(this).val() == 'high') {
			console.log('high to low price selected');
			$.ajax({
				url: `${url}/products`,
				type: 'GET',
				dataType: 'json',
				success: function(data){
					for (var i = 0; i < data.length; i++) {
						let products = data[i].price;
						function compare(a ,b){
							return b.price - a.price;
						};
						data.sort(compare);
						console.log(products);
					}
				},
				error: function(){
					console.log('cannot filter objects');
				}
		});//ajax end
		} else if ($(this).val() == 'latest') {
			console.log('latest listings selected');
		} else if ($(this).val() == 'oldest') {
			console.log('oldest listings selected');
		}
	});

	//Load cards
	function showAllProducts(){
		$.ajax({
			url: `${url}/products`,
			type: 'GET',
			dataType :'json',
			success: function(data){
				console.log(data);
				document.getElementById('productCards').innerHTML = "";
				for (let i = 0; i < data.length; i++) {
					let card =`<div class="product-link position-relative card col-3" id="${data[i]["_id"]}">
					<img class="card-img-top" src="${data[i].image}" alt="Image">`;
					if (sessionStorage['username']) {
						card += `<div class="watchlistCardBtn" title="Add to watchlist">+</div>`;
					}
					card += `<div class="card-body">
					<h3 class="card-title"> ${data[i].title}</h3>
					<h4 class="card-text">$${data[i].price}</h4>
					</div></div>`;
					document.getElementById('productCards').innerHTML += card;
				}
				openProduct();
			},
			error: function(error) {
				console.log('no good');
			}
		})
	}

	// --- Product details ---
	// Open product page
	function openProduct(){
		$('.product-link').click(function(){
			let sellerId, sellerUsername;
			let clickedProduct = this.id;
			console.log(clickedProduct);

			// Hides list of products
			$('#productCards').hide();
			$('#productPage').show();
			$('#filterBar').hide();

			// Creates produc page dynamically
			$.ajax({
				url: `${url}/products/p=${clickedProduct}`,
				type: 'GET',
				dataType: 'json',
				success: function(data){
					console.log(data)
					// Gets seller's information
					sellerId = data.sellerId;
					$.ajax({
						url: `${url}/users/u=${sellerId}`,
						type: 'GET',
						dataType: 'json',
						// Couldn't figure out how to get user name displayed so calling ajax inside ajax. May not be proper practice
						success: function(sellerData){
							// Image, description, question section
							document.getElementById('productInformation').innerHTML =
							`<img src="${data.image}" class="img-fluid" alt="${data.title}">
							<div class="product-description my-5">${data.description}</div>
							<div id="questionForm"></div>
							<div id="qAndAPrintOut" class="question-previous-questions row">
							<div class="col-12">
							<h3>Questions and Answers</h3>
							</div></div>`;
							// Button, title, listing id and seller information
							document.getElementById('productButtonContainer').innerHTML =
							`<h3>${data.title}</h3>
							<h4 class="small">Listing #: ${data._id}</h4>
							<h4 class="text-success font-weight-bold my-4">$${data.price}</h4>
							<div id="dynamicBtnContainer" class="row"></div>
							<div class="mt-2">
							<h5 class="small">Seller:</h5>
							<h5>${sellerData.username}</h5>
							<h6>${sellerData.location}</h6>
							<h6>Shipping: </h6>
							</div>`;
							listingPrivledges();
							// Confirmation pop up add to watchlist
							$('#productAddToWatchList').click(function(){
								$.ajax({
											url: `${url}/users/u=${localStorage.getItem('userID')}`,
											type: 'POST',
											data: 'json',
											success: function(buyerData){
												buyerData.watchlist.push(data._id);
												alert('success');
											},
											error: function(error){
												alert('failed to add to watchlist');
											}
										})
								// Alert pop up
								swal({
									title: `Add to Wishlist`,
									text: `Are you sure you want to add ${data.title} to your watchlist?`,
									buttons: {
										cancel: 'Cancel',
										success: {
											text: 'Add',
											value: 'add',
										},
									},
								})
								// Add to watch list method
								.then((value) => {

									switch (value) {
										case 'add':
										swal({
											title: 'Added to watchlist',
											text: `Successfully added ${data.title} to your watchlist`,
											icon: 'success',
											button: 'Got it',
											timer: 2500
										});
										break;
									}
								});
							})
							// Confirmation pop up purchase item
							$('#productPurchase').click(function(){
								// Alert pop up
								swal({
									title: `Purchase ${data.title}`,
									text: `Are you sure you want to Purchase ${data.title} to for $${data.price}?`,
									buttons: {
										cancel: 'Cancel',
										success: {
											text: 'Purchase',
											value: 'add',
										},
									},
								})
								// Add to watch list method
								.then((value) => {
									switch (value) {
										case 'add':
										swal({
											title: `${data.title} has been purchased`,
											text: `Successfully purchased ${data.title}, itemId #: ${data._id}`,
											icon: 'success',
											button: 'Got it',
											timer: 2500
										});
										break;
									}
								});
							});
						}
					});
				},
				error: function(error){
					console.log('failed');
				}
			});
		});
	}
	// Gives different layout if user is logged in our out
	function listingPrivledges(){
		if(sessionStorage['username']){
			// Adds question form
			document.getElementById('questionForm').innerHTML =
			`<form>
			<div class="question-form row form-group bg-secondary py-3 col-12">
			<h3>Ask a Question</h3>
			<textarea class="form-control" id="newQuestion" rows="3"></textarea>
			<div class="col">
			<button id="" class="btn btn-primary mt-3 float-right">Ask Question</button>
			</div>
			</div>
			</form>`;
			// Adds buttons
			document.getElementById('dynamicBtnContainer').innerHTML =
			`<div class="col-md-6">
			<button id="productPurchase" class="btn btn-outline-success btn-block">Buy Now</button>
			</div>
			<div class="col-md-6">
			<button id="productAddToWatchList" class="btn btn-outline-primary btn-block">Add watchlist</button>
			</div>`;
		} else{
			// Adds warning to login or register
			document.getElementById('questionForm').innerHTML =
			`<div class="bg-secondary p-3">
			<h4 class="text-light">Please log in or register to ask a question</h4>
			</div>`;
			// Adds buttons
			document.getElementById('dynamicBtnContainer').innerHTML =
			`<div class="col-12">
			<button id="registerAccountProductPageBtn" class="btn btn-outline-primary btn-block">Register an account</button>
			</div>`;
		}
	}
	// --- Product details end ---

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
						$('#loginUsername').focus();
						$('#loginPassword').val('');
					} else if (user == 'Not authorised. Incorrect password'){
						swal({
							title: 'Incorrect password',
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
						showAllProducts();
						listingPrivledges();
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
		$("#account").hide();
		$('#loginUsername').val("");
		$('#loginPassword').val("");
		$("#productPage").hide();
		$("#productCards").show();
	});

	// show register
	$('#registerButton').click(function(){
		$("#productCards").hide();
		$("#productPage").hide();
		$("#filterContainer").hide();
		$('#registerUsername').val('');
		$('#registerFirstName').val('');
		$('#registerLastName').val('');
		$('#registerLocation').val('');
		$('#registerEmail').val('');
		$('#registerPassword').val('');
		$('#registerForm').show();
	});

	$('#registerAccountProductPageBtn').click(function(){
		$("#productCards").hide();
		$("#productPage").hide();
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

	// empty all inputs on add product form
	$("#addListingBtn").click(function(){
		$('#addTitle').val('');
		$('#addPrice').val('');
		$('#addCategory').val('');
		$('#addDescription').val('');
		$('#addImage').val('');
		$('#addKeywords').val('');
		$('#shipping-pick').prop("checked", false);
		$('#shipping-deliver').prop("checked", false);
		$('#addTitle').focus();
	})

	// add product
	$('#addProductBtn').click(function(){
		let title = $('#addTitle').val();
		let price = parseInt($('#addPrice').val());
		let category = $('#addCategory').val();
		let desc = $('#addDescription').val();
		let image = $('#addImage').val();
		let keywords = $('#addKeywords').val();
		let pickup = $('#shipping-pick').is(":checked");
		let deliver = $('#shipping-deliver').is(":checked");
		let shipping = [];
		if(pickup){shipping.push($('#shipping-pick').val());}
		if(deliver){shipping.push($('#shipping-deliver').val());}
		let keywordArray = keywords.split(' ');
		let status = "listed";
		price = price.toFixed(2);
		let seller = sessionStorage.getItem("userID");

		if (title == '' || price == '' || category == '' || desc == '' || image == '' || keywords == '' || (!pickup && !deliver)){
			swal({
				title: 'Fill Out Details',
				text: 'Please enter all details',
				icon: 'warning',
				button: 'Got it',
				timer: 2500
			});
		}
		else {
			$.ajax({
				url :`${url}/addProduct`,
				type :'POST',
				data:{
					title : title,
					description : desc,
					price : price,
					image : image,
					status : status,
					keywords : keywordArray,
					sellerId : seller,
					buyerId : seller,
					category : category,
					shipping : shipping
				},
				success : function(data){
					console.log(data)
					$('#addProductModal').modal('hide');
					swal({
						title: 'Success!',
						text: `Congratulations! Your product has been listed`,
						icon: 'success',
						button: 'Okay!',
						timer: 2500
					});
					showAllProducts();
				},
				error:function(){
					console.log('error: cannot call api');
				}
			});//ajax
		} // else
	});//add product form

	$("#myAccountButton").click(function(){
		addProfileDetails();
		$("#productCards").hide();
		$('#productPage').hide();
		$("#account").show();
		$('#filterBar').hide();
	})

	// add profile details on account page
	function addProfileDetails(){
		$.ajax({
			url :`${url}/users/u=${sessionStorage.getItem('userID')}`,
			type :'GET',
			dataType :'json',
			success : function(data){
				$("#profile-username").html(data.username);
				$("#profile-fullname").html(fullName);
				$("#profile-location").html(data.location);
				$("#profile-email").html(data.email);
				$("#profile-balance").html(`$${data.balance}`);
			},//success
			error:function(){
				console.log('error: cannot call api');
			}//error
		});//ajax
	}// add profile details


	$("#editProfileBtn").click(function(){
		$.ajax({
			url :`${url}/users/u=${sessionStorage.getItem('userID')}`,
			type :'GET',
			dataType :'json',
			success : function(data){
				$("#editFirstName").val(data.firstName);
				$("#editLastName").val(data.lastName);
				$("#editLocation").val(data.location);
				$("#editEmail").val(data.email);
			},//success
			error:function(){
				console.log('error: cannot call api');
			}//error
		});//ajax
	});

	$("#saveProductBtn").click(function(){
		let fname = $("#editFirstName").val();
		let lname = $("#editLastName").val();
		let city = $("#editLocation").val();
		let email = $("#editEmail").val();
		$.ajax({
			url :`${url}/updateUser/u=${sessionStorage.getItem('userID')}`,
			type :'PATCH',
			data:{
				firstName : fname,
				lastName : lname,
				email : email,
				location : city
			},
			success : function(data){
				$('#editProfileModal').modal('hide');
				swal({
					title: 'Success!',
					text: `Your profile details have been updated`,
					icon: 'success',
					button: 'Okay!',
					timer: 2500
				});
				sessionStorage.setItem('userFName',fname);
				sessionStorage.setItem('userLName',lname);
				sessionStorage.setItem('userEmail',email);
				fullName = sessionStorage.getItem('userFName') + " " + sessionStorage.getItem('userLName');
				addProfileDetails()
			},//success
			error:function(){
				console.log('error: cannot call api');
			}//error
		});//ajax
	});





	// add and remove active list class on profile side bar
	$(".account-info__sidebar__list-item").click(function(){
		let list = document.querySelectorAll(".account-info__sidebar__list-item");
		for(var i = 0; i < list.length; i++){
			list[i].classList.remove("account-info__sidebar__list-item--active");
		}
		$(this).addClass("account-info__sidebar__list-item--active")
	});

}); // document
