/* Module */
/* Magic Mirror
 * Module: MMM-HTTPRequestDisplay
 *
 * By Eunan Camilleri eunancamilleri@gmail.com
 * v1.0 23/06/2016
 *
 * Modified by KAG 19/02/2019
 * Module: MMM-Avinor
 * v1.0.1 04/03/2019
 * MIT Licensed.
 */

Module.register("MMM-Avinor",{
// Default module config.
	defaults: {
		//updateInterval: 5 * 60 * 1000, // every 5 minutes
		animationSpeed: 1000,
		refreshInterval: 5 * 60 * 1000, // every 5 minutes
		tableLength: 14,
		minTimeDiff:0,
		timeZone: 1,
		layout:2,
		httpRequestURL:"https://flydata.avinor.no/XmlFeed.asp?TimeFrom=1&TimeTo=12&airport=OSL",
	},


	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "https://code.jquery.com/jquery-2.2.3.min.js"];
	},

	// Define required styles.
	getStyles: function() {
		if(this.config.layout==1) return ["MMM-Avinor1.css"];
		if(this.config.layout==2) return ["MMM-Avinor2.css"];
		else return ["MMM-Avinor.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		this.loaded = false;
		moment.locale(config.language);

		// variables that will be loaded from service
		this.avinorData = null;
		this.nodeNames = "";
		this.nodes = [];

		//Log.log("Sending CONFIG to node_helper.js in " + this.name);
		//Log.log("Payload: " + this.config);
		this.sendSocketNotification("CONFIG", this.config);
	},

	// unload the results from uber services
	processData: function(data) {

		if (!data) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			Log.log("#No data");
			return;
		}

		this.data = data;
		//Log.log("#Payload: " + data.getElementsByTagName("flight_id")[0].childNodes[0].nodeValue);
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			Log.log("#LOADED");
			return wrapper;
		}

		if (!this.data) {
			wrapper.innerHTML = "No data";
			Log.log("#NODATA");
			return wrapper;
		}

		var IATACode = ["ABZ","ALC","AMS","AYT","SXF","BLL","BRU","GDN","SZZ","LPA","GOT","HAM","HEM","INV","KTW","KUN","KRK","CPH","LPL","YXU","MAN","AGP","MUC","CDG","PRG","RKV","RIX","SZG","ARN",
			"FAE","WAW","VIE","BOO","FRO","FDE","KRS","KSU","MOL","NTB","OSL","SOG","SVG","TRF","TOS","TRD","AES","HOV","EDI","LPA","HEM","CPH","ACE","LCA","LMZ","TFS","PMI","LGW","FRA","BGO","HEL"];
		var IATACity = ["Aberdeen","Alicante","Amsterdam","Antalya","Berlin","Billund","Brussels","Gdansk","Goleniow","Gran Canaria Island","Gothenburg","Hamburg","Helsinki","Inverness","Katowice",
			"Kaunas","Kraków","Copenhagen","Liverpool","London","Manchester","Malaga","Munchen","Paris","Praha","Reykjavik","Riga","Salzburg","Stockholm","Vagar","Warszawa","Wien","Bodø","Florø","Førde",
			"Kristiansand","Kristiansund","Molde","Notodden","Oslo","Sogndal","Stavanger","Torp","Tromsø","Trondheim","Ålesund","Ørsta","Edinburgh","Gran Canaria","Helsinki","Copenhagen","Lanzarote Island",
			"Larnarca","Palma","Tenerife","Palma","London Gatwick","Frakfurt","Bergen","Helsinki"];
		var IATACountry = ["Storbritannia","Spania","Nederland","Tyrkia","Tyskland","Denmark","Belgia","Polen","Polen","Spania","Sverige","Tyskland","Finland","Storbritannia","Polen","Litauen","Polen",
			"Denmark","Storbritannia","Storbritannia","Storbritannia","Spania","Tyskland","Frankrike","Tsjekkia","Island","Latvia","Østerrike","Sverige","Faroe Islands","Polen","Østerrike","Norge","Norge",
			"Norge","Norge","Norge","Norge","Norge","Norge","Norge","Norge","Norge","Norge","Norge","Norge","Norge","Storbritannia","Spania","Finland","Denmark","Spania","Kypros","Spania","Spania","Spania","England","Tyskland","Norge","Finland"];

		var airlines = ["Adria Airways","Aegean Airlines","Aeroflot","Air Baltic","Air Cairo","Air France","Air Norway","Austrian Airlines","Blue Air","bmi","British Airways","Brussels Airlines",
			"Croatia Airlines","Czech Airlines","Danish Air Transport (DAT)","Emirates","Ethiopian Airlines","Eurowings/Germanwings","Finnair","Iberia Express","Icelandair","KLM","LOT","Lufthansa",
			"Norwegian","Pakistan International Airlines","Pegasus Airlines","Qatar Airways","Ryanair","SAS","SunExpress","Swiss International Air Lines","TAP Portugal","Thai Airways International",
			"Turkish Airlines","United Airlines","Vueling","Widerøe","Airwing"];
		var arlineCode =["JP","A3","SU","BT","SM","AF","M3","OS","0B","BM","BA","SN","OU","OK","DX","EK","ET","4U","AY","I2","FI","KL","LO","LH","DY","PK","PC","QR","FR","SK","XQ","LX","TP","TG",
			"TK","UA","VY","WF","NWG"];

		var x = this.data.getElementsByTagName("flight_id");
		var y = this.data.getElementsByTagName("airport");
		var z = this.data.getElementsByTagName("arr_dep");
		var time = this.data.getElementsByTagName("schedule_time");
		var airline = this.data.getElementsByTagName("airline");

		var timeZone = this.config.timeZone;

		var departureHeading = document.createElement("div");
		departureHeading.className = "divider";

		var avinorIcon = document.createElement("img");
		avinorIcon.className = "icon";
		avinorIcon.src = "modules/MMM-Avinor/avinor.png";
		departureHeading.innerHTML = "Departures";
		departureHeading.appendChild(avinorIcon);
		wrapper.appendChild(departureHeading);

		tableWwrapper = document.createElement("table");
		tableWwrapper.className = "Mytable";

		var row = tableWwrapper.insertRow(-1);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = " ";	//Departure heading
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Flight";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Airline";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Destination";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "City";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Country";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Time";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Date";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Mythg";
		var aiportName = y[0].getAttribute("name");
		var index = IATACode.indexOf(aiportName);
		aiportName = IATACity[index];
		headerCell.innerHTML = "Information for " + aiportName + " airport";
		row.appendChild(headerCell);

		var displayCount = 0;

		for (j = 0; j < x.length ; j++) {

			var dateAndTime = time[j].childNodes[0].nodeValue;
			var date = dateAndTime.split("T")[0];
			var klokken = dateAndTime.split("T")[1];
			var year = date.split("-")[0];
			var month = date.split("-")[1];
			var day = date.split("-")[2];
			var hourZ = klokken.split(":")[0];
			var hour = String(Number(hourZ) + timeZone);
			var minute = klokken.split(":")[1];
			var second = klokken.split(":")[2];
			var d = new Date(Number(year),Number(month),Number(day),Number(hour),0,0,0);
			var dateNowAndTime = new Date();
			var timeNow = dateNowAndTime.toISOString().split("T")[1];
			var hourNow = String(Number(timeNow.split(":")[0]) + timeZone);
			var minuteNow = timeNow.split(":")[1];
			var dateNow = dateNowAndTime.toISOString().split("T")[0];
			var monthNow = dateNow.split("-")[1];
			var dayNow = dateNow.split("-")[2];

			var timeDiff = Number(hourNow) - Number(hour);
			if(timeDiff === -1) {		//hvis det er en time diff, så sjekk minutter
				var minutteDiff = Number(minuteNow) - Number(minute);
				if(minutteDiff >= 0) {
					timeDiff = 0;
				}
			}
			var monthDiff = Number(monthNow) - Number(month);
			var dayDiff = Number(day) - Number(dayNow);
			if(day !== dayNow) {timeDiff = timeDiff - 23}
			if(monthNow !== month) {dayDiff = dayDiff - 31}

			if (timeDiff < this.config.minTimeDiff
				//&& monthDiff === 0
				&& dayDiff >= 0
				&& displayCount < this.config.tableLength
				&& z[j].childNodes[0].nodeValue==="D") {

				displayCount++;

				var eventWrapper = document.createElement("tr");
				if(timeDiff === 0) {
					eventWrapper.className = "trB";
				}
				else {eventWrapper.className = "Mytr";}

				var symbolWrapper = document.createElement("td");

				symbolWrapper.className = "Mytd";
				var symbol = document.createElement("span");
				var image = document.createElement("img");
				image.className = "tag";
				if(z[j].childNodes[0].nodeValue==="D") {image.src = "modules/MMM-Avinor/dep.png";}
				else {image.src = "modules/MMM-Avinor/arr.png";}
				symbol.appendChild(image);
				symbol.className = "symbol";
				symbolWrapper.appendChild(symbol);
				eventWrapper.appendChild(symbolWrapper);

				var lineWrapper = document.createElement("td");
				lineWrapper.className = "Mytd";
				lineWrapper.innerHTML = x[j].childNodes[0].nodeValue;
				eventWrapper.appendChild(lineWrapper);

				var airlineWrapper = document.createElement("td");
				airlineWrapper.className = "Mytd";
				var index = arlineCode.indexOf(airline[j].childNodes[0].nodeValue);
				airlineWrapper.innerHTML = airlines[index];
				eventWrapper.appendChild(airlineWrapper);

				var destWrapper = document.createElement("td");
				destWrapper.className = "Mytd";
				destWrapper.innerHTML = y[j+1].childNodes[0].nodeValue;
				eventWrapper.appendChild(destWrapper);

				var destCityWrapper = document.createElement("td");
				destCityWrapper.className = "Mytd";
				var index = IATACode.indexOf(y[j+1].childNodes[0].nodeValue);
				destCityWrapper.innerHTML = IATACity[index];
				eventWrapper.appendChild(destCityWrapper);

				var destCountryWrapper = document.createElement("td");
				destCountryWrapper.className = "Mytd";
				destCountryWrapper.innerHTML = IATACountry[index];
				eventWrapper.appendChild(destCountryWrapper);

				var timeWrapper = document.createElement("td");
				timeWrapper.className = "Mytd";
				timeWrapper.innerHTML = hour + ":" + minute;
				eventWrapper.appendChild(timeWrapper);

				var dateWrapper = document.createElement("td");
				dateWrapper.className = "Mytd";
				dateWrapper.innerHTML = day + "/" + month;
				eventWrapper.appendChild(dateWrapper);

				var gateWrapper = document.createElement("td");
				var divString = [];

				//DEPARTURES
				gateWrapper.className = "Mystatus";				//"Mystatus";
				var firstSibling = y[j+1].nextElementSibling;
				if(firstSibling !== null) {
					if (firstSibling.nodeName === "via_airport") {
						var index = IATACode.indexOf(firstSibling.childNodes[0].nodeValue.split(",")[0]);
						divString = divString + "Via " + IATACity[index];
					}
					if (firstSibling.nodeName === "status") {
						if(firstSibling.getAttribute("code")==="A") {divString = divString + " ARRIVED "}
						if(firstSibling.getAttribute("code")==="D") {divString = divString + " DEPARTED "}
						if(firstSibling.getAttribute("code")==="C") {divString = divString + " CANCELLED "}
						if(firstSibling.getAttribute("code")==="E") {
							var delayedTime = firstSibling.getAttribute("time").split("T")[1];
							var delayedHour = delayedTime.split(":")[0];
							var delayedZoneHour = String(Number(delayedHour)+timeZone);
							var delayedMinute = delayedTime.split(":")[1];
							divString = divString + " NEW TIME " + delayedZoneHour + ":" + delayedMinute + " ";
							gateWrapper.className = "delay";
						}
						if(firstSibling.getAttribute("code")==="N") {divString = divString + " NEW INFO "}
					}
					if (firstSibling.nodeName === "check_in") {
						divString = divString + "Checkin counter " + firstSibling.childNodes[0].nodeValue;
					}
					if (firstSibling.nodeName === "gate") {
						divString = divString + "Gate :" + firstSibling.childNodes[0].nodeValue;
					}
					if (firstSibling.nodeName === "belt") {
						divString = divString + "Baggage belt " + firstSibling.childNodes[0].nodeValue;
					}
					if (firstSibling.nodeName === "delayed") {
						divString = divString + "DELAYED ";
						gateWrapper.className = "delay";
					}
					var secondSibling = firstSibling.nextElementSibling;
					if (secondSibling !== null) {
						if(secondSibling.nodeName === "via_airport") {
							var index = IATACode.indexOf(secondSibling.childNodes[0].nodeValue.split(",")[0]);
							divString = divString + "Via " + IATACity[index];
						}
						if(secondSibling.nodeName === "status") {
							if(secondSibling.getAttribute("code")==="A") {divString = divString + " ARRIVED "}
							if(secondSibling.getAttribute("code")==="D") {divString = divString + " DEPARTED "}
							if(secondSibling.getAttribute("code")==="C") {divString = divString + " CANCELLED "}
							if(secondSibling.getAttribute("code")==="E") {
								var delayedTime = secondSibling.getAttribute("time").split("T")[1];
								var delayedHour = delayedTime.split(":")[0];
								var delayedMinute = delayedTime.split(":")[1];
								var delayedZoneHour = String(Number(delayedHour)+timeZone);
								divString = divString + " NEW TIME " + delayedZoneHour + ":" + delayedMinute + " ";
								gateWrapper.className = "delay";
							}
							if(secondSibling.getAttribute("code")==="N") {divString = divString + " NEW INFO "}
						}
						if(secondSibling.nodeName === "check_in") {
							divString = divString + " Checkin counter " + secondSibling.childNodes[0].nodeValue;
						}
						if(secondSibling.nodeName === "gate") {
							divString = divString + " Gate " + secondSibling.childNodes[0].nodeValue;
						}
						if(secondSibling.nodeName === "belt") {
							divString = divString + " Baggage belt " + secondSibling.childNodes[0].nodeValue;
						}
						if (secondSibling.nodeName === "delayed") {
							divString = divString + " DELAYED ";
							gateWrapper.className = "delay";
						}
						var thirdSibling = secondSibling.nextElementSibling;
						if(thirdSibling !== null) {
							if(thirdSibling.nodeName === "via_airport") {
								var index = IATACode.indexOf(thirdSibling.childNodes[0].nodeValue.split(",")[0]);
								divString = divString + "Via " + IATACity[index];
							}
							if(thirdSibling.nodeName === "status") {
								if(thirdSibling.getAttribute("code")==="A") {divString = divString + " ARRIVED "}
								if(thirdSibling.getAttribute("code")==="D") {divString = divString + " DEPARTED "}
								if(thirdSibling.getAttribute("code")==="C") {divString = divString + " CANCELLED "}
								if(thirdSibling.getAttribute("code")==="E") {
									var delayedTime = thirdSibling.getAttribute("time").split("T")[1];
									var delayedHour = delayedTime.split(":")[0];
									var delayedMinute = delayedTime.split(":")[1];
									var delayedZoneHour = String(Number(delayedHour)+timeZone);
									divString = divString + " NEW TIME " + delayedZoneHour + ":" + delayedMinute + " ";
									gateWrapper.className = "delay";
								}
								if(thirdSibling.getAttribute("code")==="N") {divString = divString + " NEW INFO "}
							}
							if(thirdSibling.nodeName === "check_in") {
								divString = divString + " Checkin counter " + thirdSibling.childNodes[0].nodeValue;
							}
							if(thirdSibling.nodeName === "gate") {
								divString = divString + " Gate " + thirdSibling.childNodes[0].nodeValue;
							}
							if(thirdSibling.nodeName === "belt") {
								divString = divString + " Baggage belt " + thirdSibling.childNodes[0].nodeValue;
							}
							if (thirdSibling.nodeName === "delayed") {
								divString = divString + " DELAYED ";
								gateWrapper.className = "delay";
							}
						}
					}
				}
				gateWrapper.innerHTML = divString;
				eventWrapper.appendChild(gateWrapper);

				tableWwrapper.appendChild(eventWrapper);
				wrapper.appendChild(tableWwrapper);
				wrapper.className = "dimmed";
			}

		}

		displayCount = 0;

		var divideWrapper = document.createElement("tr");
		divideWrapper.className = "Mytr";

		var divideTextWrapper = document.createElement("td");
		divideTextWrapper.className = "divider";
		divideTextWrapper.colSpan = "9";
		divideTextWrapper.innerHTML = "Arrivals";
		divideWrapper.appendChild(divideTextWrapper);

		tableWwrapper.appendChild(divideWrapper);
		wrapper.appendChild(tableWwrapper);
		wrapper.className = "dimmed";

		for (j = 0; j < x.length ; j++) {

			var dateAndTime = time[j].childNodes[0].nodeValue;
			var date = dateAndTime.split("T")[0];
			var klokken = dateAndTime.split("T")[1];
			var year = date.split("-")[0];
			var month = date.split("-")[1];
			var day = date.split("-")[2];
			var hourZ = klokken.split(":")[0];
			var hour = String(Number(hourZ)+timeZone);
			var minute = klokken.split(":")[1];
			var second = klokken.split(":")[2];
			var d = new Date(Number(year),Number(month),Number(day),Number(hour),0,0,0);
			var dateNowAndTime = new Date();
			var timeNow = dateNowAndTime.toISOString().split("T")[1];
			var hourNow = String(Number(timeNow.split(":")[0]) + timeZone);
			var minuteNow = timeNow.split(":")[1];
			var dateNow = dateNowAndTime.toISOString().split("T")[0];
			var monthNow = dateNow.split("-")[1];
			var dayNow = dateNow.split("-")[2];

			var timeDiff = Number(hourNow) - Number(hour);
			var monthDiff = Number(monthNow) - Number(month);
			var dayDiff = Number(day) - Number(dayNow);
			if(day !== dayNow) {timeDiff = timeDiff - 23}
			if(monthNow !== month) {dayDiff = dayDiff - 31}

			if(timeDiff === -1) {		//hvis det er en time diff, så sjekk minutter
				var minutteDiff = Number(minuteNow) - Number(minute);
				if(minutteDiff >= 0) {
					timeDiff = 0;
				}
			}

			if (timeDiff < this.config.minTimeDiff
				//&& monthDiff === 0
				&& dayDiff >= 0
				&& displayCount < this.config.tableLength
				&& z[j].childNodes[0].nodeValue==="A") {

				displayCount++;

				var eventWrapper = document.createElement("tr");
				if(timeDiff === 0) {
					eventWrapper.className = "trB";
				}
				else {eventWrapper.className = "Mytr";}

				var symbolWrapper = document.createElement("td");

				symbolWrapper.className = "Mytd";
				var symbol = document.createElement("span");
				var image = document.createElement("img");
				image.className = "tag";
				if(z[j].childNodes[0].nodeValue==="D") {image.src = "modules/MMM-Avinor/dep.png";}
				else {image.src = "modules/MMM-Avinor/arr.png";}
				symbol.appendChild(image);
				symbol.className = "symbol";
				symbolWrapper.appendChild(symbol);
				eventWrapper.appendChild(symbolWrapper);

				var lineWrapper = document.createElement("td");
				lineWrapper.className = "Mytd";
				lineWrapper.innerHTML = x[j].childNodes[0].nodeValue;
				eventWrapper.appendChild(lineWrapper);

				var airlineWrapper = document.createElement("td");
				airlineWrapper.className = "Mytd";
				var index = arlineCode.indexOf(airline[j].childNodes[0].nodeValue);
				airlineWrapper.innerHTML = airlines[index];
				eventWrapper.appendChild(airlineWrapper);

				var destWrapper = document.createElement("td");
				destWrapper.className = "Mytd";
				destWrapper.innerHTML = y[j+1].childNodes[0].nodeValue;
				eventWrapper.appendChild(destWrapper);

				var destCityWrapper = document.createElement("td");
				destCityWrapper.className = "Mytd";
				var index = IATACode.indexOf(y[j+1].childNodes[0].nodeValue);
				destCityWrapper.innerHTML = IATACity[index];
				eventWrapper.appendChild(destCityWrapper);

				var destCountryWrapper = document.createElement("td");
				destCountryWrapper.className = "Mytd";
				destCountryWrapper.innerHTML = IATACountry[index];
				eventWrapper.appendChild(destCountryWrapper);

				var timeWrapper = document.createElement("td");
				timeWrapper.className = "Mytd";
				timeWrapper.innerHTML = hour + ":" + minute;
				eventWrapper.appendChild(timeWrapper);

				var dateWrapper = document.createElement("td");
				dateWrapper.className = "Mytd";
				dateWrapper.innerHTML = day + "/" + month;
				eventWrapper.appendChild(dateWrapper);

				var gateWrapper = document.createElement("td");
				gateWrapper.className = "Mytd";

				//ARRIVALS
				var divString = [];
				gateWrapper.className = "Mystatus";				//"Mystatus";
				var firstSibling = y[j+1].nextElementSibling;
				if(firstSibling !== null) {
					if (firstSibling.nodeName === "via_airport") {
						var index = IATACode.indexOf(firstSibling.childNodes[0].nodeValue.split(",")[0]);
						divString = divString + "Via " + IATACity[index];
					}
					if (firstSibling.nodeName === "status") {
						if(firstSibling.getAttribute("code")==="A") {divString = divString + " ARRIVED "}
						if(firstSibling.getAttribute("code")==="D") {divString = divString + " DEPARTED "}
						if(firstSibling.getAttribute("code")==="C") {divString = divString + " CANCELLED "}
						if(firstSibling.getAttribute("code")==="E") {
							var delayedTime = firstSibling.getAttribute("time").split("T")[1];
							var delayedHour = delayedTime.split(":")[0];
							var delayedMinute = delayedTime.split(":")[1];
							var delayedZoneHour = String(Number(delayedHour)+timeZone);
							divString = divString + " NEW TIME " + delayedZoneHour + ":" + delayedMinute + " ";
							gateWrapper.className = "delay";
						}
						if(firstSibling.getAttribute("code")==="N") {divString = divString + " NEW INFO "}
					}
					if (firstSibling.nodeName === "check_in") {
						divString = divString + "Checkin counter " + firstSibling.childNodes[0].nodeValue;
					}
					if (firstSibling.nodeName === "gate") {
						divString = divString + "Gate " + firstSibling.childNodes[0].nodeValue;
					}
					if (firstSibling.nodeName === "belt") {
						divString = divString + "Baggage belt " + firstSibling.childNodes[0].nodeValue;
					}
					if (firstSibling.nodeName === "delayed") {
						divString = divString + "DELAYED ";
						gateWrapper.className = "delay";
					}
					var secondSibling = firstSibling.nextElementSibling;
					if (secondSibling !== null) {
						if(secondSibling.nodeName === "via_airport") {
							var index = IATACode.indexOf(secondSibling.childNodes[0].nodeValue.split(",")[0]);
							divString = divString + " Via " + IATACity[index];
						}
						if(secondSibling.nodeName === "status") {
							if(secondSibling.getAttribute("code")==="A") {divString = divString + " ARRIVED "}
							if(secondSibling.getAttribute("code")==="D") {divString = divString + " DEPARTED "}
							if(secondSibling.getAttribute("code")==="C") {divString = divString + " CANCELLED "}
							if(secondSibling.getAttribute("code")==="E") {
								var delayedTime = secondSibling.getAttribute("time").split("T")[1];
								var delayedHour = delayedTime.split(":")[0];
								var delayedMinute = delayedTime.split(":")[1];
								var delayedZoneHour = String(Number(delayedHour)+timeZone);
								divString = divString + " NEW TIME " + delayedZoneHour + ":" + delayedMinute + " ";
								gateWrapper.className = "delay";
							}
							if(secondSibling.getAttribute("code")==="N") {divString = divString + " NEW INFO "}
						}
						if(secondSibling.nodeName === "check_in") {
							divString = divString + " Checkin counter " + secondSibling.childNodes[0].nodeValue;
						}
						if(secondSibling.nodeName === "gate") {
							divString = divString + " Gate " + secondSibling.childNodes[0].nodeValue;
						}
						if(secondSibling.nodeName === "belt") {
							divString = divString + " Baggage belt " + secondSibling.childNodes[0].nodeValue;
						}
						if (secondSibling.nodeName === "delayed") {
							divString = divString + " DELAYED";
							gateWrapper.className = "delay";
						}
						var thirdSibling = secondSibling.nextElementSibling;
						if(thirdSibling !== null) {
							if(thirdSibling.nodeName === "via_airport") {
								var index = IATACode.indexOf(thirdSibling.childNodes[0].nodeValue.split(",")[0]);
								divString = divString + " Via " + IATACity[index];
							}
							if(thirdSibling.nodeName === "status") {
								if(thirdSibling.getAttribute("code")==="A") {divString = divString + " ARRIVED "}
								if(thirdSibling.getAttribute("code")==="D") {divString = divString + " DEPARTED "}
								if(thirdSibling.getAttribute("code")==="C") {divString = divString + " CANCELLED "}
								if(thirdSibling.getAttribute("code")==="E") {
									var delayedTime = thirdSibling.getAttribute("time").split("T")[1];
									var delayedHour = delayedTime.split(":")[0];
									var delayedMinute = delayedTime.split(":")[1];
									var delayedZoneHour = String(Number(delayedHour)+timeZone);
									divString = divString + " NEW TIME " + delayedZoneHour + ":" + delayedMinute + " ";
									gateWrapper.className = "delay";
								}
								if(thirdSibling.getAttribute("code")==="N") {divString = divString + " NEW INFO "}
							}
							if(thirdSibling.nodeName === "check_in") {
								divString = divString + " Checkin counter " + thirdSibling.childNodes[0].nodeValue;
							}
							if(thirdSibling.nodeName === "gate") {
								divString = divString + " Gate " + thirdSibling.childNodes[0].nodeValue;
							}
							if(thirdSibling.nodeName === "belt") {
								divString = divString + " Baggage belt " + thirdSibling.childNodes[0].nodeValue;
							}
							if (thirdSibling.nodeName === "delayed") {
								divString = divString + " DELAYED";
								gateWrapper.className = "delay";
							}
						}
					}
				}
				gateWrapper.innerHTML = divString;
				eventWrapper.appendChild(gateWrapper);

				tableWwrapper.appendChild(eventWrapper);
				wrapper.appendChild(tableWwrapper);
				wrapper.className = "dimmed";
			}

		}
		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		var parser, xmlDoc;

		if (notification === "STARTED") {
			this.updateDom();
			Log.log("#STARTED");
		}
		else if (notification === "DATA") {
			this.loaded = true;
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(payload,"text/xml");
			//Log.log("#DATA " + xmlDoc.getElementsByTagName("flight_id")[0].childNodes[0].nodeValue);
			this.processData(xmlDoc);
			this.updateDom();
		}
	},

});
