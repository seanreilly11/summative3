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
		$('#productPage').hide();
		$("#filterBar").show();
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

	//search
	$('#searchButton').click(function(e){
		e.preventDefault();
		$.ajax({
			url: `${url}/products`,
			type: 'GET',
			dataType: 'json',
			success: function(data){
				document.getElementById('productCards').innerHTML = " ";
				let searchInput = $('#searchBar').val().toLowerCase();
				console.log(searchInput);
				for (var i = 0; i < data.length; i++) {
					// console.log(data[i].keywords);
					let searchTargetTitle = data[i].title.toLowerCase();
					// let searchTargetKeyword = data[i].keywords.toLowerCase();
					console.log(searchTargetTitle);
					//After test products are deleted, do search for keywords also.
					if (data[i].status == 'listed' &&	searchTargetTitle.includes(searchInput)) {
						let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${data[i]["_id"]}">
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
				console.log('cannot complete search');
			}
		})
	});

	//category filter
	$('.btn-category').click(function(){
		let clickedCategory = $(this).attr("id").slice(0, -6);
		let btnCategory = $(this).attr("id");
		console.log(btnCategory);
		console.log(clickedCategory);
		$('#account').hide();
		$("#productCards").show();
		$("#filterBar").show();
		$('#productPage').hide();
		$(this).removeClass('btn-outline-secondary').addClass('btn-secondary').siblings().removeClass('btn-secondary').addClass('btn-outline-secondary');
		$.ajax({
			url: `${url}/products`,
			type: 'GET',
			dataType: 'json',
			success: function(data){
				// Get's buyer's watchlist from users
				var buyerWatchlist = [];
				document.getElementById('productCards').innerHTML = " ";
				if(sessionStorage.getItem('userID')){
					$.ajax({
						url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
						type: 'GET',
						dataType: 'json',
						success: function(buyerData){
							buyerWatchlist = buyerData.watchlist;
							var notPresentInWatchlist = false;
							outerloop:
							for (var i = 0; i < data.length; i++){
								let cat = data[i].category.toLowerCase();
								console.log(data[i].category, cat);
								if (cat.includes(clickedCategory) & data[i].status == 'listed'){
									let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${data[i]["_id"]}">
									<img class="card-img-top" src="${data[i].image}" alt="Image">`;		
									if (sessionStorage['username'] && sessionStorage.getItem("userID") != data[i].sellerId) {
										// loops through both products and user's watchlist and compares
										for(let j = 0; j < buyerWatchlist.length; j++){
											var buyerWatchlistItem = buyerWatchlist[j];
											// Finds if the user has an item in their watchlist already
											if(buyerWatchlistItem == data[i]._id){
												console.log(`${buyerWatchlistItem} exsists`);
												card += `<div class="watchlistCardBtn" title="Remove from watchlist">-</div>
												<div class="card-body">
												<h3 class="card-title"> ${data[i].title}</h3>
												<h4 class="card-text">$${data[i].price}</h4>
												</div></div>`;
												document.getElementById('productCards').innerHTML += card;
												// Moves on to the next item after printing card
												continue outerloop;
											}
											// If the item is not already in the watchlist, triggers conditional statement outside of inner loop
											notPresentInWatchlist = true;
										}
										// Conditional statement that shows the user a + if product is not on watchlist
										if((notPresentInWatchlist) || (buyerWatchlist.length === 0)){
											card += `<div class="watchlistCardBtn" title="Add to watchlist">+</div>`;
										}
									}
									card += `<div class="card-body">
									<h3 class="card-title"> ${data[i].title}</h3>
									<h4 class="card-text">$${data[i].price}</h4>
									</div></div>`;
									document.getElementById('productCards').innerHTML += card;
								}
							}
							openProduct();
							addToWatchlistSymbol();
						},
						error: function(error){
							console.log('Couldnt load watchlist while sorting');
						}
					})
				}
				else{
					for (var i = 0; i < data.length; i++) {
						let cat = data[i].category.toLowerCase();
						console.log(data[i].category, cat);
						if (cat.includes(clickedCategory) & data[i].status == 'listed') {
							let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${data[i]["_id"]}">
							<img class="card-img-top" src="${data[i].image}" alt="Image">`;
							card += `<div class="card-body">
							<h3 class="card-title"> ${data[i].title}</h3>
							<h4 class="card-text">$${data[i].price}</h4>
							</div></div>`;
							document.getElementById('productCards').innerHTML += card;
						}
					}
					openProduct();
				}
			},
			error: function(){
				console.log('cannot get category');
			}
		})
	});

	//price filter
	$('#filterSelect').on('change', function(){
		if ($(this).val() == 'low') {
			console.log('low to high price selected');
			$.ajax({
				url: `${url}/products`,
				type: 'GET',
				dataType: 'json',
				success: function(data){
					function compare(a ,b){
						return a.price - b.price;
					};
					data.sort(compare);
					createCard(data);
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
					function compare(a ,b){
						return b.price - a.price;
					};
					data.sort(compare);
					createCard(data);
				},
				error: function(){
					console.log('cannot filter objects');
				}
		});//ajax end
		} else if ($(this).val() === 'latest') {
			console.log('latest listings selected');
			$.ajax({
				url: `${url}/products`,
				type: 'GET',
				dataType: 'json',
				success: function(data){
					createCard(data);
				},
				error: function(){
					console.log('cannot filter objects');
				}
			});
		} else if ($(this).val() == 'oldest') {
			console.log('oldest listings selected');
			$.ajax({
				url: `${url}/products`,
				type: 'GET',
				dataType: 'json',
				success: function(data){
					console.log(data.reverse());
				},
				error: function(){
					console.log('cannot filter objects');
				}
			});
		}
	});

	// --- Create Cards ---
	function createCard(a){
		// Get's buyer's watchlist from users
		var buyerWatchlist = [];
		if(sessionStorage.getItem('userID')){
			$.ajax({
				url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
				type: 'GET',
				dataType: 'json',
				success: function(buyerData){
					buyerWatchlist = buyerData.watchlist;
					console.log(buyerWatchlist);
					console.log(buyerWatchlist);
					console.log(a);
					document.getElementById('productCards').innerHTML = "";
					// Assumes that the item is in watchlist to not trigger adding a + to cards
					var notPresentInWatchlist = false;
					outerloop:
					for (let i = 0; i < a.length; i++) {
						if(a[i].status === "listed"){
							let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${a[i]["_id"]}">
							<img class="card-img-top" src="${a[i].image}" alt="Image">`;		
							if (sessionStorage['username'] && sessionStorage.getItem("userID") != a[i].sellerId) {
								// loops through both products and user's watchlist and compares
								for(let j = 0; j < buyerWatchlist.length; j++){
									var buyerWatchlistItem = buyerWatchlist[j];
									// Finds if the user has an item in their watchlist already
									if(buyerWatchlistItem == a[i]._id){
										console.log(`${buyerWatchlistItem} exsists`);
										card += `<div class="watchlistCardBtn" title="Remove from watchlist">-</div>
										<div class="card-body">
										<h3 class="card-title"> ${a[i].title}</h3>
										<h4 class="card-text">$${a[i].price}</h4>
										</div></div>`;
										document.getElementById('productCards').innerHTML += card;
										// Moves on to the next item after printing card
										continue outerloop;
									}
									// If the item is not already in the watchlist, triggers conditional statement outside of inner loop
									notPresentInWatchlist = true;
								}
								// Conditional statement that shows the user a + if product is not on watchlist
								if((notPresentInWatchlist) || (buyerWatchlist.length === 0)){
									card += `<div class="watchlistCardBtn" title="Add to watchlist">+</div>`;
								}
							}
							card += `<div class="card-body">
							<h3 class="card-title"> ${a[i].title}</h3>
							<h4 class="card-text">$${a[i].price}</h4>
							</div></div>`;
							document.getElementById('productCards').innerHTML += card;
						}
					}
					openProduct();
					addToWatchlistSymbol(a);
				},
				error: function(error){
					alert('Failed to get buyer\'s details');
				}
			});
		}
		else{
			document.getElementById('productCards').innerHTML = " ";
			for (var i = 0; i < a.length; i++) {
				if (a[i].status == 'listed') {
					let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${a[i]["_id"]}">
					<img class="card-img-top" src="${a[i].image}" alt="Image">`;
					card += `<div class="card-body">
					<h3 class="card-title"> ${a[i].title}</h3>
					<h4 class="card-text">$${a[i].price}</h4>
					</div></div>`;
					document.getElementById('productCards').innerHTML += card;
				}
			}
			openProduct();
		}
	} // Create card ends

	// --- Add to watchlist button on cards ---
	function addToWatchlistSymbol(a){
		// Add product to wishlist on click of '+' on product card
		$('.watchlistCardBtn').click(function(e){
			// Get value of watchlist icon on home screen
			var action = $(this).text();
			console.log(action);
			var prod = e.target.parentNode.attributes[1].value;
			console.log(prod);
			e.stopPropagation();
			if(action === '-'){
				console.log('entered condition');
				// Get product details
				$.ajax({
					url: `${url}/products/p=${prod}`,
					type: 'GET',
					dataType: 'json',
					success: function(clickedProduct){
						var sellerId = clickedProduct.sellerId;
						// Get seller's details so that the seller doesn't add their listing to their account
						$.ajax({
							url: `${url}/users/u=${sellerId}`,
							type: 'GET',
							dataType: 'json',
							success: function(sellerData){
								// Get buyer's details
								$.ajax({
									url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
									type: 'GET',
									data: 'json',
									success: function(buyerData){
										var newWatchlist = buyerData.watchlist;
										var productToRemove = prod;
										console.log(newWatchlist);
										console.log(productToRemove);
										// Adding product id to user's watchlist array
										$.ajax({
											url: `${url}/removeWatchlist/u=${sessionStorage.getItem('userID')}`,
											type: 'PATCH',
											data: {
												watchlist : productToRemove
											},
											success: function(){
												swal({
													title: 'Removed from watchlist',
													text: `Successfully removed ${clickedProduct.title} from your watchlist`,
													icon: 'success',
													button: 'Got it',
													timer: 2500
												}).then(function(){
													location.reload();
													}
												);
											},
											error: function(error){
												alert('Failed to remove from watchlist');
											}
										});
									},
									error: function(error){
										alert('Failed to get buyer\'s details');
									}
								}); // Get buyer's details end	
							},
							error: function(error){
								alert('Failed to get seller\'s details');
							}
						}); // Get seller's details end
					},
					error: function(error){
						alert('Failed to get product details');
					}
				}); // Get product details end
			}
			else{
				// Get product details
				$.ajax({
					url: `${url}/products/p=${prod}`,
					type: 'GET',
					dataType: 'json',
					success: function(clickedProduct){
						var sellerId = clickedProduct.sellerId;
						// Get seller's details so that the seller doesn't add their listing to their account
						$.ajax({
							url: `${url}/users/u=${sellerId}`,
							type: 'GET',
							dataType: 'json',
							success: function(sellerData){
								// Get buyer's details
								$.ajax({
									url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
									type: 'GET',
									data: 'json',
									success: function(buyerData){
										var newWatchlist = buyerData.watchlist;
										var productToAdd = prod;
										// Adding product id to user's watchlist array
										if((newWatchlist.indexOf(productToAdd) == -1) && (sellerId != sessionStorage.getItem("userID"))){
											$.ajax({
												url: `${url}/updateWatchlist/u=${sessionStorage.getItem('userID')}`,
												type: 'PATCH',
												data: {
													watchlist : productToAdd
												},
												success: function(updateBuyerWatchlist){
													swal({
														title: 'Added to watchlist',
														text: `Successfully added ${clickedProduct.title} to your watchlist`,
														icon: 'success',
														button: 'Got it',
														timer: 2500
													}).then(function(){
														location.reload();
														}
													);
												},
												error: function(error){
													alert('failed to add product to watchlist');
												}
											}); // ajax
										}
									},
									error: function(error){
										alert('failed to add to watchlist');
									}
								}); // Get buyer details end
							},
							error: function(){
								alert('Failded to get seller\'s details');
							}
						})
					},
					error: function(error){
						alert('Could not find product');
					}
				}) // Get product details end
			}
		}); 
	} // Add to watchlist from home screen end

	//Load all cards
	function showAllProducts(){
		
		$.ajax({
			url: `${url}/products`,
			type: 'GET',
			dataType :'json',
			success: function(data){
				createCard(data);
			},
			error: function(error) {
				console.log('no good');
			}
		}) // ajax products end
	} // Show all products end

	// --- Product details ---
	// Open product page
	function openProduct(){
		$('.product-link').click(function(){
			let sellerId, sellerUsername;
			let clickedProduct = this.id;
			console.log(clickedProduct);

			// Hides list of products
			$('#account').hide();
			$('#productCards').hide();
			$('#productPage').show();
			$('#filterBar').hide();

			// Creates product page dynamically
			$.ajax({
				url: `${url}/products/p=${clickedProduct}`,
				type: 'GET',
				dataType: 'json',
				success: function(data){
					console.log(data);
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
							<div class="col-12" id="questionForm"></div>
							<div class="question-previous-questions col-12 mt-5">
							<h3 class="bg-light p-3">Questions and Answers</h3>
							<div class="col-12" id="qAndAPrintOut"></div></div>`;
							// Button, title, listing id and seller information
							let card = `<h3>${data.title}</h3>
							<h4 class="small">Listing #: ${data._id}</h4>
							<h4 class="text-success font-weight-bold my-4">$${data.price}</h4>
							<div id="dynamicBtnContainer" class="row"></div>
							<div class="mt-3">
							<h5 class="small mb-0">Seller:</h5>
							<h4 class="mb-0">${sellerData.username}</h5>
							<h6 class="mb-2">${sellerData.location}</h6>`;
							if((data.shipping.pickup) && (data.shipping.deliver)){
								card += `<p class="mb-0">Shipping: Pick up and delivery available</p></div>`;
							}
							else if(data.shipping.pickup){
								card += `<p class="mb-0">Shipping: Pick up only</p></div>`;
							}
							else if(data.shipping.deliver){
								card += `<p class="mb-0">Shipping: Delivery only</p></div>`;
							}
							document.getElementById('productButtonContainer').innerHTML = card;
							listingPrivledges(sellerId, data);

							// Allows owner of listing to edit and delete the product
							$('#editProduct').click(function(){
								// Outputs exsiting product information
								$('#updateTitle').val(data.title);
								$('#updatePrice').val(data.price);
								$('#updateCategory').val(data.category);
								$('#updateDescription').val(data.description);
								$('#updateKeywords').val(data.keywords);
								$('#updateImage').val(data.image);
								$('#updateShipping-pick').prop('checked', data.shipping.pickup);
								$('#updateShipping-deliver').prop('checked', data.shipping.deliver);
								// Updates listing after save changes has been clicked
								$('#updateProductBtn').click(function(){
									let newTitle = $('#updateTitle').val();
									let newPrice = $('#updatePrice').val();
									let newCategory = $('#updateCategory').val();
									let newDescription = $('#updateDescription').val();
									let newImage = $('#updateImage').val();
									let modifiedKeywordArray = document.getElementById('updateKeywords').value;
									// let modifiedKeywordArray = $('#updateKeywords').val();
									let newPickup = $('#updateShipping-pick').is(":checked");
									let newDeliver = $('#updateShipping-deliver').is(":checked");
									// Updates product information
									$.ajax({
										url: `${url}/updateProduct/p=${clickedProduct}`,
										type: 'PATCH',
										dataType: 'json',
										data: {
											title : newTitle,
											description : newDescription,
											price : newPrice,
											image : newImage,
											category : newCategory,
											keywords : modifiedKeywordArray,
											pickup : newPickup,
											deliver : newDeliver
										},
										success: function(){
											swal({
												title: 'Listing Updated',
												text: `Successfully updated ${data.title} with new details that you have entered`,
												icon: 'success',
												button: 'Got it',
												timer: 2500
											});
										},
										error: function(error){
											alert('Could not update listing');
										}
									});
								}); // Save changes end
							}); // Edit listing

							// Delete a listing
							$('#deleteProduct').click(function(){
								swal({
									title: `Delete ${data.title}`,
									text: `Are you sure that you want to permentaly remove ${data.title} as a listing. This action cannot be undone!`,
									icon: 'warning',
									buttons: {
										cancel: 'Cancel',
										success: {
											text: 'Delete Listing',
											value: 'delete',
										},
									},
								})
								.then((value) => {
									switch (value) {
										case 'delete':
										$.ajax({
											url: `${url}/deleteProduct/p=${clickedProduct}`,
											type: 'DELETE',
											data: 'json',
											success: function(){
												swal({
													title: 'Listing Deleted',
													text: `Successfully deleted ${data.title}`,
													icon: 'success',
													button: 'Got it',
													timer: 2500
												});
												$("#productPage").hide();
												showAllProducts()
												$("#productCards").show();
											},
											error: function(){
												alert('Failed to delete listing');
											}
										});
									}
								});
							});

							// Confirmation pop up add to watchlist
							$('#productAddToWatchList').click(function(){
								console.log('Clicked watchlist button');
								// Gets buyer's data
								$.ajax({
									url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
									type: 'GET',
									data: 'json',
									success: function(buyerData){
										var newWatchlist = buyerData.watchlist;
										var productToAdd = data['_id'];
										// Adding product id to user's watchlist array
										if((newWatchlist.indexOf(productToAdd) == -1) && (sellerId != sessionStorage.getItem("userID"))){
											$.ajax({
												url: `${url}/updateWatchlist/u=${sessionStorage.getItem('userID')}`,
												type: 'PATCH',
												data: {
													watchlist : productToAdd
												},
												success: function(updateBuyerWatchlist){
													swal({
														title: 'Added to watchlist',
														text: `Successfully added ${data.title} to your watchlist`,
														icon: 'success',
														button: 'Got it',
														timer: 2500
													});
												},
												error: function(error){
													alert('failed to add product to watchlist');
												}
											}); // ajax
										}
										else{
											swal({
												title: 'Already added',
												text: `${data.title} is already on your watchlist`,
												icon: 'info',
												button: 'Got it',
												timer: 2500
											});
										}
									},
									error: function(error){
										alert('failed to add to watchlist');
									}
								});
							});

							// Remove from watchlist
							$('#productRemoveFromWatchlist').click(function(){
								console.log('Remove button clicked');
							});

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
								// Add to purchased list method
								.then((value) => {
									switch (value) {
										case 'add':
										// Gets buyer's information
										$.ajax({
											url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
											type: 'GET',
											data: 'json',
											success: function(buyerData){
												// Conditional statement to make sure that the user buying the product has enough in their account to do so
												if(buyerData.balance > data.price){
													// Edit product details
													$.ajax({
														url: `${url}/productSold/p=${data._id}`,
														type: `PATCH`,
														data: {
															buyerId: `${sessionStorage.getItem('userID')}`,
															status: 'sold'
														},
														success: function(updateBuyerBalance){
															var updateBuyerWallet = buyerData.balance - data.price;
															var updateSellerWallet = sellerData.balance + data.price;
															$.ajax({
																url: `${url}/products/p=${data._id}`,
																type: 'GET',
																data: 'json',
																success: function(newProdData){
																	listingPrivledges(sellerId, newProdData);
																},
																error: function(error){
																	alert("Can't get product");
																}
															})
															// Update buyer's wallet
															$.ajax({
																url: `${url}/updateBalance/u=${sessionStorage.getItem('userID')}`,
																type: `PATCH`,
																data: {
																	balance: updateBuyerWallet
																},
																success: function(){
																	console.log('Buyer\'s balance has changed to ' + buyerData.balance);
																},
																error: function(error){
																	console.log('Couldn\'t update buyer\'s balance');
																}
															});
															// Update seller's wallet
															$.ajax({
																url: `${url}/updateBalance/u=${sellerData._id}`,
																type: `PATCH`,
																data: {
																	balance: updateSellerWallet
																},
																success: function(){
																	console.log('Seller\'s balance has changed to ' + sellerData.balance);
																},
																error: function(error){
																	console.log('Couldn\'t update seller\'s balance');
																}
															});
														},
														error: function(error){
															alert('Unable to make purchase');
														}
													});
												}
												else{
													swal({
														title: `Insuficient funds`,
														text: `Unable to purchase ${data.title} due to insuficient funds. Please add more credit to your account to be able to purchase this.`,
														icon: `error`,
														button: `Got it!`,
														timer: 2500
													});
												}
											},
											error: function(error){
												alert('Failed to get buyer\'s details');
											}
										});
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
		}); // Initial ajax ends
	} // Open product function ends

	// Gives different layout if user is logged in our out
	function listingPrivledges(sellerId, data, buyerData){
		let status = data.status;
		let productId = data._id;
		if(status == 'sold'){
			// Adds question form
			document.getElementById('questionForm').innerHTML =
			`<div class="alert alert-danger col-12 text-center" role="alert">
			This product has been sold so questions are closed</div>`;
			// Adds buttons
			document.getElementById('dynamicBtnContainer').innerHTML =
			`<div class="alert alert-danger col-12 text-center" role="alert">This product has been sold</div>`;
		}
		else if((sessionStorage['username']) && (sellerId == sessionStorage.getItem("userID"))){
			// Adds question form
			document.getElementById('questionForm').innerHTML =
			`<div class="question-form row mx-0 bg-light py-3 col-12 mb-5">
			<h3>Ask a Question</h3>
			<textarea class="form-control" id="newQuestion" rows="3"></textarea>
			<div class="col-12">
			<button type="button" id="submitQuestionBtn" class="btn btn-primary mt-3 float-right">Ask Question</button>
			</div></div>`;
			// Adds buttons
			document.getElementById('dynamicBtnContainer').innerHTML =
			`<div class="alert alert-primary col-12 text-center" role="alert">This is your product</div>
			<div class="col-lg-6 col-md-12">
			<button id="editProduct" class="btn btn-outline-success btn-block" data-toggle="modal" data-target="#updateProductModal">Edit product</button>
			</div>
			<div class="col-lg-6 col-md-12">
			<button id="deleteProduct" class="btn btn-outline-danger btn-block">Delete product</button>
			</div>`;
		}
		// else if(sessionStorage['username']){
		// 	// Adds question form
		// 	document.getElementById('questionForm').innerHTML =
		// 	`<div class="question-form row mx-0 bg-light py-3 col-12 mb-5">
		// 	<h3>Ask a Question</h3>
		// 	<textarea class="form-control" id="newQuestion" rows="3"></textarea>
		// 	<div class="col-12">
		// 	<button type="button" id="submitQuestionBtn" class="btn btn-primary mt-3 float-right">Ask Question</button>
		// 	</div></div>`;
		// 	// Get buyer's watchlist
		// 	$.ajax({
		// 		url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
		// 		type: 'GET',
		// 		data: 'json',
		// 		success: function(buyerData){
		// 			var buyerWatchlist = buyerData.watchlist;
		// 			// If product is already in watchlist
		// 			if(buyerWatchlist.indexOf(productId) > -1){
		// 				// Adds buttons if not in watchlist already
		// 				document.getElementById('dynamicBtnContainer').innerHTML =
		// 				`<div class="col-lg-6 col-md-12">
		// 				<button id="productPurchase" class="btn btn-outline-success btn-block">Buy Now</button>
		// 				</div>
		// 				<div class="col-lg-6 col-md-12">
		// 				<button id="productAddToWatchList" class="btn btn-outline-danger btn-block">Remove watchlist</button>
		// 				</div>`;
		// 			}
		// 			else{
		// 				// Adds buttons if not in watchlist already
		// 				document.getElementById('dynamicBtnContainer').innerHTML =
		// 				`<div class="col-lg-6 col-md-12">
		// 				<button id="productPurchase" class="btn btn-outline-success btn-block">Buy Now</button>
		// 				</div>
		// 				<div class="col-lg-6 col-md-12">
		// 				<button id="productAddToWatchList" class="btn btn-outline-primary btn-block">Add watchlist</button>
		// 				</div>`;
		// 			}
		// 		},
		// 		error:function(error){
		// 			alert('Unable to get buyer\'s details');
		// 		}
		// 	}); // buyer data ends
		// }
		else if(sessionStorage['username']){
			// Adds question form
			document.getElementById('questionForm').innerHTML =
			`<div class="question-form row mx-0 bg-light py-3 col-12 mb-5">
			<h3>Ask a Question</h3>
			<textarea class="form-control" id="newQuestion" rows="3"></textarea>
			<div class="col-12">
			<button type="button" id="submitQuestionBtn" class="btn btn-primary mt-3 float-right">Ask Question</button>
			</div></div>`;
			// Adds buttons
			document.getElementById('dynamicBtnContainer').innerHTML =
			`<div class="col-lg-6 col-md-12">
			<button id="productPurchase" class="btn btn-outline-success btn-block">Buy Now</button>
			</div>
			<div class="col-lg-6 col-md-12">
			<button id="productAddToWatchList" class="btn btn-outline-primary btn-block">Add watchlist</button>
			</div>`;
		}
		// If the user isn't logged in
		else{
			// Adds warning to login or register
			document.getElementById('questionForm').innerHTML =
			`<div class="bg-light p-3">
			<h4 class="text-dark">Please log in or register to ask a question</h4>
			</div>`;
			// Adds buttons
			document.getElementById('dynamicBtnContainer').innerHTML =
			`<div class="col-12">
			<button id="registerAccountProductPageBtn" class="btn btn-outline-primary btn-block">Register an account</button>
			</div>`;
		}
		$("#submitQuestionBtn").click(function(){
			let newQuestion = $("#newQuestion").val();
			addComment(newQuestion, data);
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
		displayComments(data);
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
						$("#productPage").show();
						$("#filterContainer").show();
						openProduct();
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
					keywords : keywords,
					sellerId : seller,
					buyerId : seller,
					category : category,
					pickup : pickup,
					deliver : deliver
				},
				success : function(data){
					console.log(data)
					showMyProducts("selling");
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
		showMyProducts("selling");
		let list = document.querySelectorAll(".account-info__sidebar__list-item");
		for(var i = 0; i < list.length; i++){
			list[i].classList.remove("account-info__sidebar__list-item--active");
		}
		list[0].classList.add("account-info__sidebar__list-item--active")
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

	$("#viewSelling").click(function(){
		showMyProducts("selling");
		document.getElementById("myProductCards").scrollIntoView();
	})
	$("#viewSold").click(function(){
		showMyProducts("sold");
		document.getElementById("myProductCards").scrollIntoView();
	})
	$("#viewBought").click(function(){
		showMyProducts("bought");
		document.getElementById("myProductCards").scrollIntoView();
	})
	//Load my cards
	function showMyProducts(group){
		$.ajax({
			url: `${url}/products`,
			type: 'GET',
			dataType :'json',
			success: function(data){
				console.log(data);
				document.getElementById('myProductCards').innerHTML = "";
				for (let i = 0; i < data.length; i++) {
					if(group === "selling" && data[i].sellerId == sessionStorage.getItem("userID") && data[i].status === "listed"){
						let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${data[i]["_id"]}">
						<img class="card-img-top" src="${data[i].image}" alt="Image">
						<div class="card-body">
						<h3 class="card-title"> ${data[i].title}</h3>
						<h4 class="card-text">$${data[i].price}</h4>
						</div></div>`;
						document.getElementById('myProductCards').innerHTML += card;
					}
					if(group === "sold" && data[i].sellerId == sessionStorage.getItem("userID") && data[i].status === "sold"){
						let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${data[i]["_id"]}">
						<img class="card-img-top" src="${data[i].image}" alt="Image">
						<div class="card-body">
						<h3 class="card-title"> ${data[i].title}</h3>
						<div class="alert alert-danger col-12 text-center" role="alert">Sold</div>
						</div></div>`;
						document.getElementById('myProductCards').innerHTML += card;
					}
					if(group === "bought" && data[i].buyerId == sessionStorage.getItem("userID") && data[i].status === "sold"){
						let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${data[i]["_id"]}">
						<img class="card-img-top" src="${data[i].image}" alt="Image">
						<div class="card-body">
						<h3 class="card-title"> ${data[i].title}</h3>
						<div class="alert alert-success col-12 text-center" role="alert">Bought</div>
						</div></div>`;
						document.getElementById('myProductCards').innerHTML += card;
					}
				}
				openProduct();
			},
			error: function(error) {
				console.log('no good');
			}
		})
	}

	$("#viewWatchlist").click(function(){
		showMyWatchlist();
		document.getElementById("myProductCards").scrollIntoView();
	})
	//Load my watchlist
	function showMyWatchlist(){
		$.ajax({
			url: `${url}/users/u=${sessionStorage.getItem('userID')}`,
			type: 'GET',
			dataType :'json',
			success: function(userData){
				console.log(userData);
				document.getElementById('myProductCards').innerHTML = "";
				if(userData.watchlist.length == 0){
					document.getElementById('myProductCards').innerHTML =
					'You have no products added to your watchlist. Click the plus icon in the corner of a product to add it to your watchlist or go to the product\'s page and click "add to watchlist"';
				}
				else{
					$.ajax({
						url: `${url}/products`,
						type: 'GET',
						dataType :'json',
						success: function(data){
							console.log(data);
							document.getElementById('myProductCards').innerHTML = "";
							for (let j = 0; j < userData.watchlist.length; j++) {
								for (let i = 0; i < data.length; i++) {
									if(data[i]["_id"] == userData.watchlist[j] && data[i].status === "listed"){
										let card =`<div class="product-link position-relative card col-lg-3 col-sm-12 col-md-6" id="${data[i]["_id"]}">
										<img class="card-img-top" src="${data[i].image}" alt="Image">
										<div class="card-body">
										<h3 class="card-title"> ${data[i].title}</h3>
										<h4 class="card-text">$${data[i].price}</h4>
										</div></div>`;
										document.getElementById('myProductCards').innerHTML += card;
									}
								}
							}
							openProduct();
						},
						error: function(error) {
							console.log('no good');
						}
					})
				}
				openProduct();
			},
			error: function(error) {
				console.log('no good');
			}
		})
	}


	$("#editProfileBtn").click(function(){
		$('#editPasswordSection').hide();
		$('#editPasswordButton').click(function(){
			$('#editPasswordSection').slideDown()
		});
		$.ajax({
			url :`${url}/users/u=${sessionStorage.getItem('userID')}`,
			type :'GET',
			dataType :'json',
			success : function(data){
				$("#editFirstName").val(data.firstName);
				$("#editLastName").val(data.lastName);
				$("#editLocation").val(data.location);
				$("#editEmail").val(data.email);
				$("#newPassword").val(data.password)
			},//success
			error:function(){
				console.log('error: cannot call api');
			}//error
		});//ajax
	});




	$("#saveProfileBtn").click(function(){
		let fname = $("#editFirstName").val();
		let lname = $("#editLastName").val();
		let city = $("#editLocation").val();
		let email = $("#editEmail").val();
		let password = $("#newPassword").val()
		$.ajax({
			url :`${url}/updateUser/u=${sessionStorage.getItem('userID')}`,
			type :'PATCH',
			data:{
				firstName : fname,
				lastName : lname,
				email : email,
				location : city,
				password : password
			},
			success : function(data){
				$('#editProfileModal').modal('hide');
				swal({
					title: 'Success!',
					text: `Your profile details have been updated`,
					icon: 'success',
					button: 'Confirm'
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

	$('#deleteAccountButton').click(function(){
		$('#editProfileModal').modal('hide');
		swal({
			title: `Are you sure you want to delete your profile?`,
			text: `This action cannot be undone!`,
			icon: 'warning',
			buttons: {
				cancel: 'Cancel',
				success: {
					text: 'Delete Profile',
					value: 'delete',
				},
			},
		})
		.then((value) => {
			switch (value) {
				case 'delete':
				$.ajax({
					url: `${url}/deleteUser/u=${sessionStorage.getItem('userID')}`,
					type: 'DELETE',
					data: 'json',
					success: function(){
						swal({
							title: 'Your profile has been deleted',
							text: `Successfully deleted`,
							icon: 'success',
							button: 'Got it'
							// timer: 2500
						});
						sessionStorage.clear();
						setTimeout(location.reload.bind(location), 2500);
						$("#productPage").hide();
						showAllProducts()
						$("#productCards").show();
					},
					error: function(){
						alert('Failed to delete user');
					}
				});
			}
		});
	});

	// add and remove active list class on profile side bar
	$(".account-info__sidebar__list-item").click(function(){
		let list = document.querySelectorAll(".account-info__sidebar__list-item");
		for(var i = 0; i < list.length; i++){
			list[i].classList.remove("account-info__sidebar__list-item--active");
		}
		$(this).addClass("account-info__sidebar__list-item--active")
	});

	function addComment(question, product){
		$.ajax({
			url :`${url}/addComment`,
			type :'POST',
			data:{
				text : question,
				userId : sessionStorage.getItem('userID'),
				productId : product["_id"],
				replies : []
			},
			success : function(comment){
				console.log(comment);
				displayComments(product);
			},
			error:function(){
				console.log('error: cannot call api');
			}
		});//ajax
	}

	function displayComments(product){
		$.ajax({
			url: `${url}/comments`,
			type: 'GET',
			dataType :'json',
			success: function(data){
				console.log(data);
				document.getElementById('qAndAPrintOut').innerHTML = "";
				for (let i = 0; i < data.length; i++) {
					$.ajax({
						url: `${url}/users/u=${data[i].userId}`,
						type: 'GET',
						dataType :'json',
						success: function(user){
							let comUsername = user.username;
							if(data[i].productId === product["_id"]){					
								let count = 0;
								let card = "";
								if(data[i].replies.length == 0){
									card += `<div class="col-10 border p-2 pb-5 rounded my-2" id="${data[i]["_id"]}">`;
								}
								else{
									card += `<div class="col-10 border px-2 pt-2 rounded my-2" id="${data[i]["_id"]}">`;
								}
								card += `<p class="mb-0 text-primary font-weight-bold">${comUsername}<span class="text-muted ml-2 font-weight-normal comment-time">${getTimeAgo(data[i])}</span></p>
								<p class="card-text ml-2">${data[i].text}</p>
								<div class="comment-replies w-100" id="comment-${data[i]["_id"]}">`;
								if(!data[i].replies.includes(null)){
									for (let j = 0; j < data[i].replies.length; j++) {
										$.ajax({
											url: `${url}/users/u=${data[i].replies[j].userId}`,
											type: 'GET',
											dataType :'json',
											success: function(replier){
												let repUsername = replier.username;
												let reply =`<div class="col-11 border p-2 rounded mb-2 float-right">`;
												if(user.username === repUsername){
													reply += `<p class="mb-0 text-primary font-weight-bold">${repUsername}<span class="text-muted ml-2 font-weight-normal comment-time">${getTimeAgo(data[i].replies[j])}</span></p>`;
												}
												if(user.username != repUsername){
													reply += `<p class="mb-0 text-success font-weight-bold">${repUsername}<span class="text-muted ml-2 font-weight-normal comment-time">${getTimeAgo(data[i].replies[j])}</span></p>`;
												}
												reply += `<p class="card-text ml-2">${data[i].replies[j].text}</p></div>`;
												count++;
												$("#"+data[i]["_id"]).css("padding-bottom",calcPadding(count));
												let target = `comment-${data[i]["_id"]}`;
												document.getElementById(target).innerHTML += reply;
											},
											error: function(error) {
												console.log('no good');
											}
										}) // ajax
									}
								}
								card += `</div><div class="col-12 form-inline float-right">`;
								if(sessionStorage.getItem("username")){
									card += `<input type="text" class="form-control reply-input col-md-8 col-lg-9" name="reply-input" placeholder="Reply">
									<button type="button" class="btn btn-primary col-md-4 col-lg-3 replyBtn">Reply</button>`;
								}
								card += `</div></div>`;
								function calcPadding(x){
									let pb = x * 4.6 + 3;
									pb += "rem";
									return pb;
								}
								document.getElementById('qAndAPrintOut').innerHTML += card;
								$(".replyBtn").click(function(e){
									handleReply(e, product);
								})
							}
						},
						error: function(error) {
							console.log('no good');
						}
					})
				}
			},
			error: function(error) {
				console.log('no good');
			}
		})
	}

	function handleReply(e, product){
		let com = e.target.parentNode.parentNode.attributes[1].value;
		let input = e.target.previousElementSibling.value;
		if(input != ""){
			$.ajax({
				url :`${url}/commentReply/c=${com}`,
				type :'PATCH',
				data:{
					text : input,
					time : new Date(),
					userId : sessionStorage.getItem("userID")
				},
				success : function(data){
					console.log(data);
					displayComments(product);
				},
				error:function(){
					console.log('error: cannot call api');
				}
			});//ajax
		}
	}

	function getTimeAgo(data){
		// comment time values
		let t = data.time;
		let date = new Date(Date.parse(t));
		const DAY_IN_MS = 86400000;
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		let hours = date.getHours();
		let minutes = date.getMinutes();	
		// comparison values
		const today = new Date();
		const yesterday = new Date(today - DAY_IN_MS);
		const seconds = Math.round((today - date) / 1000);
		const minutes2 = Math.round(seconds / 60);
		const isToday = today.toDateString() === date.toDateString();
		const isYesterday = yesterday.toDateString() === date.toDateString();
		const isThisYear = today.getFullYear() === date.getFullYear();

		if (minutes < 10) {	minutes = `0${minutes}`;}

		if (seconds < 10) { return 'Just now';} 
		else if (seconds < 60) { return `${seconds} seconds ago`; } 
		else if (seconds < 100) { return 'About a minute ago'; } 
		else if (minutes2 < 60) { return `${minutes2} minutes ago`; }
		else if (isToday) { return `Today at ${hours}:${minutes}`; } 
		else if (isYesterday) { return `Yesterday at ${hours}:${minutes}`; } 
		else { return `${day}/${month}/${year} ${hours}:${minutes}`; } 	
	}
}); // document
