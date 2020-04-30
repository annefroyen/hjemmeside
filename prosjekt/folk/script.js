
const befolkningUrl = "befolkning.json";
const sysselsatteUrl = "http://wildboy.uib.no/~tpe056/folk/100145.json";
const utdanningUrl = "http://wildboy.uib.no/~tpe056/folk/85432.json"

var befolkningsData;
var sysselsettingsData;
var utdanningsData;
var utdanningsDatasett;

var gyldigeKommuneNr = [];
var fellesAarstall = [];
var data;

window.onload = start

function start(){

   data = new Data(utdanningUrl);

   data.onLoad = function(){

     gyldigeKommuneNr = finnFelles("kommunenummer");
     fellesAarstall = finnFelles('aarstall');

     skrivOversiktstabell();
     settOppEventListeners();

    var lasteSkjerm = document.getElementById("lasteSkjerm")
    lasteSkjerm.style.display = "none"
  }

  data.load(befolkningUrl, function() {data.load(utdanningUrl, function() {data.load(sysselsatteUrl, 'onLoad')}) });

}

function Data(url){

  this.url = url;
  this.getNames = function(){

    if(url === befolkningUrl){
          return hentDataliste(befolkningsData, "navn");
    }else if( url === sysselsatteUrl){
          return hentDataliste(sysselsettingsData, "navn");
    }else if( url === utdanningUrl){
          return hentDataliste(utdanningsData, "navn");
    }else{
      return "Fant ingen gyldig data";
    }

  };
  this.getIDs = function(){
    if(url === befolkningUrl){
          return hentDataliste(befolkningsData, "nr");
    }else if( url === sysselsatteUrl){
          return hentDataliste(sysselsettingsData, "nr");
    }else if( url === utdanningUrl){
          return hentDataliste(utdanningsData, "nr");
    }else{
      return "Fant ingen gyldig data";
    }
  };
  this.getInfo = function(nr){

    if(url === befolkningUrl){
          return hentDataBefolkning(nr, "info");
    }else if( url === sysselsatteUrl){
          return hentDataSysselsetting(nr, "info");
    }else if( url === utdanningUrl){
          return hentDataUtdanning(nr, "info");
    }else{
      return "Fant ingen gyldig data";
    }
  };
  this.load = function(url, callBack){

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onreadystatechange = function(){

      if( xhr.readyState === 4 && xhr.status === 200){

       var dataResponse = JSON.parse(xhr.responseText);

       if(url === befolkningUrl){
            befolkningsData = dataResponse.elementer;
       }else if(url === utdanningUrl){
            utdanningsDatasett = dataResponse;
            utdanningsData = dataResponse.elementer;
       }else if(url === sysselsatteUrl){
         sysselsettingsData = dataResponse.elementer;
       }

        if(callBack === 'onLoad'){
          data.onLoad();
        }else if(callBack !== 'onLoad' && callBack !== null){
          callBack(dataResponse);
        }

     }
    };
   xhr.send();
  };
  this.onLoad = null;
}

//diverse
function sjekkInput(input, error) {
    if (input === "") {
      error.innerText = "Skriv noe i input feltet!";
      throw "Ugyldig input"
    }else if(!gyldigeKommuneNr.includes(input)){
      error.innerText = "Skriv inn et gyldig kommunenummer!"
      throw "Ugyldig kommunenummer"
    }else{
      error.innerText = ""
    }
  }
function settOppEventListeners(){

var input = document.getElementById("kommuneNavn");

input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    document.getElementById("detaljKnapp").click();
  }
});

var input1 = document.getElementById("kommuneNavnEn");
var input2 = document.getElementById("kommuneNavnTo");

input1.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    document.getElementById("sammenlignKnapp").click();
  }
});
input2.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    document.getElementById("sammenlignKnapp").click();
  }
});



}
function finnFelles(data){

  var felles = [];
  var befolkning;
  var utdanning;
  var sysselsetting;

  if(data === "kommunenummer"){
    befolkning = hentDataliste(befolkningsData, "nr");
    utdanning = hentDataliste(utdanningsData, "nr");
    sysselsetting = hentDataliste(sysselsettingsData, "nr");

  }else if(data === "aarstall"){
    befolkning = Object.keys(befolkningsData.Halden.Menn);
    utdanning = Object.keys(utdanningsData.Halden['01'].Menn);
    sysselsetting = Object.keys(befolkningsData.Halden.Menn);
  }

  for (var i = 0; i < befolkning.length && i < sysselsetting.length; i++) {
    for (var j = 0; j < sysselsetting.length; j++) {
     for (var k = 0; k < utdanning.length; k++) {
        if(befolkning[i] === sysselsetting[j] && befolkning[i] === utdanning[k]){
         felles.push(befolkning[i]);
        }
      }
    }
  }

  return felles;
}
function sjekkAntallKommuner(){
  console.log("Felles kommunenummer: " + finnFelles("kommunenummer").length);
  console.log("Kommuner i befolkningsData: " + Object.keys(befolkningsData).length);
  console.log("Kommuner i sysselsettingsData: " + Object.keys(sysselsettingsData).length);
  console.log("Kommuner i utdanningsData: " + Object.keys(utdanningsData).length);
  console.log("Her kan vi sjå at utdannings API har fleire kommuner enn dei andre og at befolkning og sysselsetting har en kommune som ikkje er felles.");
}

//hjelpefunksjoner som henter ut data fra datasettene
function hentDataliste(datasett, datatype){

  var returnArray =[];

  for (var key in datasett) {

    switch(datatype) {
      case "navn":
        returnArray.push(key);
        break;
      case "nr":
        returnArray.push(datasett[key].kommunenummer);
        break;
      case "befolkning":
         returnArray.push(finnBefolkning(datasett[key].Menn, datasett[key].Kvinner));
        break;
      case "vekst":
        returnArray.push(finnBefolkningsvekst(datasett[key].Menn, datasett[key].Kvinner));
        break;
      default:
        returnArray.push("ingen data funnet");
    }

  }
  return returnArray;
}
function hentDataBefolkning(kommunenr, datatype){

  for (var key in befolkningsData) {
if(kommunenr === befolkningsData[key].kommunenummer){
    switch(datatype) {
      case "navn":
        return key;
        break;
      case "antall":
         return finnBefolkning(befolkningsData[key].Menn, befolkningsData[key].Kvinner);
        break;
      case "kvinner":
         return befolkningsData[key].Kvinner[fellesAarstall[fellesAarstall.length-1]];
         break;
      case "menn":
        return befolkningsData[key].Menn[fellesAarstall[fellesAarstall.length-1]];
        break;
      case "vekst":
        return finnBefolkningsvekst(befolkningsData[key].Menn, befolkningsData[key].Kvinner);
        break;
      case "element":
        return befolkningsData[key];
        break;
      case "info":
        return  key + " " + JSON.stringify(befolkningsData[key]);
        break;
      default:
        return "ingen data funnet";
    }
}
  }
}
function hentDataSysselsetting(kommunenr, datatype){

  for (var key in sysselsettingsData) {

if(kommunenr === sysselsettingsData[key].kommunenummer){

    switch(datatype) {
      case "navn":
        return key;
        break;
      case "sysselatteProsent":
        return sysselsettingsData[key]["Begge kjønn"][fellesAarstall[fellesAarstall.length-1]];
        break;
      case "element":
        return sysselsettingsData[key];
        break;
      case "info":
        return  key + " " + JSON.stringify(sysselsettingsData[key]);
        break;
      default:
        return "ingen data funnet";
    }
}
  }
}
function hentDataUtdanning(kommunenr, datatype){

  for (var key in utdanningsData) {

if(kommunenr === utdanningsData[key].kommunenummer){

    switch(datatype) {
      case "navn":
        return key;
        break;
      case "hoyereUtdannede":
        return (utdanningsData[key]["03a"].Menn[fellesAarstall[fellesAarstall.length-1]] * hentDataBefolkning(kommunenr, "menn") /100) +
               (utdanningsData[key]["03a"].Kvinner[fellesAarstall[fellesAarstall.length-1]] * hentDataBefolkning(kommunenr, "kvinner")/100);
        break;
      case "element":
        return utdanningsData[key];
        break;
      case "info":
        return  key + " " + JSON.stringify(utdanningsData[key]);
        break;
      default:
        return "ingen data funnet";
    }
}
  }
}

//navbar
function visSide(side){


  var divs = document.getElementsByClassName("innhold");

      for (let d = 0; d < divs.length; d++) {
          if (divs[d].classList.contains("synligSide")) {
             divs[d].classList.remove("synligSide");
         }
      }
    var divid = document.getElementById(side.name).classList.add("synligSide");

    var navButtons = document.getElementsByClassName("nav-button")
    for(let j = 0; j< navButtons.length;j++){
      if(navButtons[j].name === side.name){
        navButtons[j].classList.add("active-btn")
      }else{
        navButtons[j].classList.remove("active-btn")
      }
    }
}

//oversikt
function skrivOversiktstabell() {

  var tabell = document.getElementById("oversiktsTabell");


  var header = tabell.createTHead();
  var rad = header.insertRow();

  var navn = document.createElement("th");
  var nr = document.createElement("th");
  var befolkning = document.createElement("th");
  var befolkningsvekst = document.createElement("th");

  navn.innerText = "Navn";
  nr.innerText = "Kommunenummer"
  befolkning.innerText = "Befolkning";
  befolkningsvekst.innerText = "Befolkningsvekst";

  rad.appendChild(navn);
  rad.appendChild(nr);
  rad.appendChild(befolkning);
  rad.appendChild(befolkningsvekst);

  for (var key in befolkningsData) {

    var r = tabell.insertRow(1);

    var kommune = r.insertCell(0);
    var nr = r.insertCell(1);
    var befolkning = r.insertCell(2);
    var vekst = r.insertCell(3);

    kommune.innerText = key;
    nr.innerText = befolkningsData[key].kommunenummer;
    befolkning.innerText = finnBefolkning(befolkningsData[key].Menn, befolkningsData[key].Kvinner);
    let ve = finnBefolkningsvekst(befolkningsData[key].Menn, befolkningsData[key].Kvinner);
    if ( ve > 0) {
      vekst.className += "positiv";
    }else if(ve < 0){
      vekst.className += "negativ";
    }else{
      vekst.className += "noytral";
    }
    vekst.innerText = ve + " %";


  }
}
function finnBefolkning(menn, kvinner){

  return Object.values(menn).pop() + Object.values(kvinner).pop();

}
function finnBefolkningsvekst(menn, kvinner){

var current = Object.values(menn).reverse()[0] + Object.values(kvinner).reverse()[0];
var last = Object.values(menn).reverse()[1] + Object.values(kvinner).reverse()[1];

if(last === 0){
  return "Ingen data";
}

let sum = (current-last)/last*100+""

return sum.substr(0,4)
}

//detaljer
function visDetaljer(input, error){


  //sjekk inputFelt
  sjekkInput(input, error);

  //skriv detlajer
  visKommuneInfo(input);

  //skriv befolkningstabell
  var tittel = document.getElementById('befolkningsvekst');
  tittel.innerText = " Befolkningsvekst";

  skrivDetaljTabell(input, befolkningsData, "befolkningsData");

  //skriv sysselsettingstabell
  var tittel = document.getElementById('sysselsettingsvekst');
  tittel.innerText = "Sysselsettingsvekst"

  skrivDetaljTabell(input, sysselsettingsData, "sysselsettingsData");

  //skriv utdanningstabell
  var tittel = document.getElementById('utdanningsvekst');
  tittel.innerText = "Utdanningsvekst"

  skrivDetaljTabell(input, utdanningsData, "utdanningsData");

}
function visKommuneInfo(input){

  var ul = document.getElementById("kommuneInfo")
  ul.innerHTML = "";

  var kommune = hentDataBefolkning(input, "navn");
  var befolkning = hentDataBefolkning(input, "antall")
  var sysselsatteProsent = Math.round(hentDataSysselsetting(input, "sysselatteProsent") *10)/10;
  var sysselsatte = Math.round((sysselsatteProsent*befolkning)/100);
  var utdanning = Math.round(hentDataUtdanning(input, "hoyereUtdannede"));
  var utdanningProsent = Math.round((utdanning/befolkning)*100 * 10) / 10;

  var li1 = document.createElement("li");
  var li2 = document.createElement("li");
  var li3 = document.createElement("li");
  var li4 = document.createElement("li");
  var li5 = document.createElement("li");

  li1.innerText = kommune + " kommune";
  li1.style.fontSize = '30px';
  li2.innerText = "Kommune nr: " + input;
  li3.innerText = "Befolkning: " + befolkning;
  li4.innerText = "Innbyggere som er sysselsatte: " + sysselsatte + " stk eller " + sysselsatteProsent + "%";
  li5.innerText = "Innbyggere med høyere utdanning: " + utdanning + " stk eller " + utdanningProsent + "%";


  ul.appendChild(li1)
  ul.appendChild(li2)
  ul.appendChild(li3)
  ul.appendChild(li4)
  ul.appendChild(li5)

}
function skrivDetaljTabell(input, datasett, data){

var tabell = document.getElementById(data);
tabell.innerHTML = '';
tabell.setAttribute('class', 'detaljTabell');

//document.getElementById('detaljer').appendChild(tabell);

var header = tabell.createTHead();
var rad = header.insertRow();

var kategorier = document.createElement("th");
kategorier.innerText = "Kategorier";
rad.appendChild(kategorier);

for(aar in fellesAarstall){
  var ar = document.createElement("th");
  ar.innerText = fellesAarstall[aar];
  rad.appendChild(ar);
}



if(datasett === befolkningsData){
  var kommuneElement = hentDataBefolkning(input, "element");
  printTabell(kommuneElement, tabell, fellesAarstall);
}else if(datasett === sysselsettingsData){
  var kommuneElement = hentDataSysselsetting(input, "element");
    printTabell(kommuneElement, tabell, fellesAarstall);
}else if(datasett === utdanningsData){
  var kommuneElement = hentDataUtdanning(input, "element");
  printTabellUtdanning(kommuneElement, tabell, fellesAarstall);
}else {
  var kommuneElement = "error";
}


}
function printTabell(kommuneElement, tabell, fellesAarstall){


  var kjonn = Object.keys(kommuneElement)
   for (var i = 0; i < kjonn.length; i++) {
     if(kjonn[i] !== 'kommunenummer'){


          var rad = tabell.insertRow(1);
          var k = rad.insertCell(0);
          k.innerText = kjonn[i];

          for (var p = 0; p < fellesAarstall.length; p++) {


          celle = rad.insertCell();
          celle.innerText = kommuneElement[kjonn[i]][fellesAarstall[p]];
      }

    }
  }
}
function printTabellUtdanning(kommuneElement, tabell, fellesAarstall){

  var kategorier = Object.keys(utdanningsDatasett.datasett.kategorier);
  var kategoriNavn = Object.values(utdanningsDatasett.datasett.kategorier);

   for (var i = 0; i < kategorier.length; i++) {
     if(kategorier[i] !== 'kommunenummer'){

       var kjonn = Object.keys(kommuneElement[kategorier[i]])

        for (var j = 0; j < kjonn.length; j++) {

          var rad = tabell.insertRow(1);
          var kategori = rad.insertCell(0);
          kategori.innerText = kategoriNavn[i] + " " + kjonn[j] ;


          for (var p = 0; p < fellesAarstall.length; p++) {

            celle = rad.insertCell();
            celle.innerText = kommuneElement[kategorier[i]][kjonn[j]][fellesAarstall[p]];

          }

      }

    }
}
}

//sammenligning
function visSammenligning(input1, input2, error1, error2){
    sjekkInput(input1, error1);
    sjekkInput(input2, error2);
    skrivSammenligningsTabell(input1, input2);
}
function skrivSammenligningsTabell(kommunenr1, kommunenr2) {


  var tabell = document.getElementById("sammenligningsTabell");
  tabell.innerHTML = '';
  var kommune1;
  var kommune1Navn;
  var kommune2;
  var kommune2Navn;
  var kommune1Score = 0;
  var kommune2Score = 0;

  for (var key in utdanningsData) {
    if(kommunenr1 === utdanningsData[key].kommunenummer){
      kommune1 = utdanningsData[key];
      kommune1Navn = key;
    }else if(kommunenr2 === utdanningsData[key].kommunenummer ){
      kommune2 = utdanningsData[key];
      kommune2Navn = key;
    }
  }


  var header = tabell.createTHead();
  var rad = header.insertRow();

  var kategorier = document.createElement("th");
  var kommuneEn = document.createElement("th");
  var kommuneTo = document.createElement("th");
  var vinner = document.createElement("th");

  kategorier.innerText = "Kategorier";
  kommuneEn.innerText = kommune1Navn;
  kommuneTo.innerText = kommune2Navn;
  vinner.innerText = "Vinner"

  rad.appendChild(kategorier);
  rad.appendChild(kommuneEn);
  rad.appendChild(kommuneTo);
  rad.appendChild(vinner);


  var kategorier = Object.keys(utdanningsDatasett.datasett.kategorier);
  var kategorierNavn = Object.values(utdanningsDatasett.datasett.kategorier);



   for (var i = 0; i < kategorier.length; i++) {
       var kjonn = Object.keys(kommune1[kategorier[i]])
        for (var j = 0; j < kjonn.length; j++) {
         var vinner = printRad(tabell, kjonn[j], kategorier[i], kommune1, kommune2, kategorierNavn[i])

        if(vinner === "k1"){
          kommune1Score++;
        }else if(vinner === "k2"){
          kommune2Score++;
        }
        }


}


var rad = tabell.insertRow();
rad.style.fontWeight = "bold";

var kat = rad.insertCell(0);
var kommuneEn = rad.insertCell(1);
var kommuneTo = rad.insertCell(2);
var vinner = rad.insertCell(3);

kat.innerText = "Sammenlagt vinner: ";
kommuneEn.innerText = kommune1Score;
kommuneTo.innerText = kommune2Score;
vinner.innerText = (kommune1Score >= kommune2Score ? (kommune1Score===kommune2Score ? "uavgjort" : kommune1Navn): kommune2Navn)


}
function printRad(tabell, kjonn, kategorier, kommune1, kommune2, kategorierNavn){

  var rad = tabell.insertRow(1);

  var kat = rad.insertCell(0);
  var kommuneEn = rad.insertCell(1);
  var kommuneTo = rad.insertCell(2);
  var vinner = rad.insertCell(3);
  var scoreTobeReturnedK1 = 0;
  kat.innerText = kategorierNavn + " " + kjonn;
  var kommuneEnVerdi =  Object.values(kommune1[kategorier][kjonn]).pop();
  var kommuneToVerdi = Object.values(kommune2[kategorier][kjonn]).pop();
  kommuneEn.innerText = kommuneEnVerdi;
  kommuneEn.className += (kommuneEnVerdi >= kommuneToVerdi ? (kommuneEnVerdi===kommuneToVerdi ? "noytral" : "positiv"): "negativ")
  kommuneTo.innerText = kommuneToVerdi;
  kommuneTo.className += (kommuneToVerdi >= kommuneEnVerdi ? (kommuneEnVerdi===kommuneToVerdi ? "noytral" : "positiv"): "negativ")
var vinnerText;
  vinner.innerText = (kommuneEnVerdi >= kommuneToVerdi ? (kommuneEnVerdi===kommuneToVerdi ? "uavgjort" : (vinnerText = "k1", hentDataUtdanning(kommune1.kommunenummer, "navn") ))   : (vinnerText ="k2",hentDataUtdanning(kommune2.kommunenummer, "navn")))
return vinnerText
}
