let search = $("#search");
let searchButton = $("#searchBtn")
let history = $("#history")
let searchHistory = []
let searchterms
let weatherContents = {}
let searchEl = {
    element: "223e030c136e0012bc8230f476cd7cf8"
}

function load(){
    searchHistory = JSON.parse(localStorage.getItem("searchHistoryArchive"))
    if(!searchHistory){
        searchHistory = []
    }
    else{
        searchHistoryCol()
    }  
}

function searchHistoryCol(){
    let oldHistory = searchHistory.reverse()
    clearHistory(oldHistory)

    for (let i = 0; i < oldHistory.length; i++) { 
        let iconbit = $("<i>").addClass("fa fa-clock-o")
        let iconholder = $("<td>").attr("width","5%")
        let content = $("<td>").html(oldHistory[i]).attr("id","content"+i)
        let buttonBit = $("<a>").addClass("button is-small is-primary").html("Search Again")
        buttonBit.attr("id","historyButton"+i)
        let buttonHolder = $("<td>").addClass("level-right")
        let historyCol = $("<tbody>").attr("id","cityCard"+i)
        let container = $("<tr>")
        iconholder.append(iconbit)
        buttonHolder.append(buttonBit)
        container.append(iconholder)
        container.append(content)
        container.append(buttonHolder)
        historyCol.append(container)
        history.append(historyCol)
    }   
    revertReverse = searchHistory.reverse()
    localStorage.removeItem("searchHistoryArchive")
    localStorage.setItem("searchHistoryArchive",JSON.stringify(revertReverse))

}
function displayWeather(weatherObj){
    let dateTarget     = $("#date-target")
    let cityTarget     = $("#city-target")
    let tempTarget     = $("#temp-target")
    let windTarget     = $("#wind-target")
    let humidityTarget = $("#humidity-target")
    let UVTarget      = $("#UV-target")
    let CityHTML = weatherObj.city +" "+ weatherObj.spanHTML

    dateTarget.html(weatherObj.Date)
    cityTarget.html(CityHTML)
    tempTarget.html(weatherObj.CurrentTemp)
    windTarget.html(weatherObj.CurrentWind)
    humidityTarget.html(weatherObj.CurrentHumid)
    
    for (let i = 1; i < weatherObj.daily.length; i++) {
        let dayTarget = $("#date-"+i)
        let dayIconTarget = $("#day"+i+"-icon-target")
        let dayTempTarget = $("#Temp"+i)
        let dayWindTarget = $("#Wind"+i)
        let dayHumTarget = $("#Humid"+i)

        dayTarget.html(weatherObj.daily[i].date)
        dayIconTarget.html(weatherObj.daily[i].iconURL)
        dayTempTarget.html(weatherObj.daily[i].temp)
        dayWindTarget.html(weatherObj.daily[i].wind)
        dayHumTarget.html(weatherObj.daily[i].humidity)
    }
}

function loadApi(searchArg){
    searchButton.addClass('is-loading')
    function UVConnect(weatherObj){
        lat = weatherObj.lat
        lon = weatherObj.lon
        let WeatherURL = "https://api.openweathermap.org/data/2.5/onecall?lat="+ lat +"&lon="+ lon +"&exclude=minutely,hourly&units=metric&appid=" + searchElements.element
        fetch(WeatherURL)
        .then(function(response){
            if(response.ok){
                response.json().then(function(data){
                    weatherObj.UV = data.current.uv
                    weatherObj.daily = data.daily
                    
                    let add =  true

                    if(searchHistory.length > 0){
                        for (let i = 0; i < searchHistory.length; i++) {
                            if(searchHistory[i] == searchArg){
                                add = false
                            }
                        }
                    }
                    
                    if(add){
                        if(searchHistory.length == 5){
                            searchHistory.shift()
                            searchHistory.push(searchArg) 
                            searchHistoryCol(searchArg)
                        }
                        else{
                            searchHistory.push(searchArg)
                            searchHistoryCol(searchArg)
                        }

                    }
                    

                    for (let i = 1; i < data.daily.length; i++) {
                        weatherObj.daily[0] = ""
                        weatherObj.daily[i].date = moment.unix(data.daily[i].dt).format("MM/DD/YY")
                        weatherObj.daily[i].temp = data.daily[i].temp.day + " °F"
                        weatherObj.daily[i].wind = data.daily[i].wind_speed + " mph"
                        weatherObj.daily[i].humidity = data.daily[i].humidity + " %"
                        weatherObj.daily[i].iconCode = data.daily[i].weather[0].icon
                        weatherObj.daily[i].status = data.daily[i].weather[0].main
                        weatherObj.daily[i].iconURL = "<img src='https://openweathermap.org/img/wn/"+ weatherObj.daily[i].iconCode + ".png'> ("+weatherObj.daily[i].status+")"
                    
                      }

                    searchButton.removeClass('is-loading')
                    displayWeather(weatherObj)

                })
            }
        })
        .catch(function(error){
            alert("There is an error, please try again")
            searchButton.removeClass('is-loading')
        })
    }
    function connectApp(){
        let latLongURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchArg + "&units=metric&appid="+ searchElements.element
    fetch(latLongURL)
        .then(function(response){
            if(response.ok){
                response.json().then(function(data){
                    let dataToUse = {}
                     dataToUse.lat = data.coord.lat
                     dataToUse.lon = data.coord.lon
                     dataToUse.city = data.name
                     dataToUse.CurrentTemp = data.main.temp + " °F"
                     dataToUse.CurrentWind = data.wind.speed + " mph"
                     dataToUse.CurrentHum = data.main.humidity + " %"
                     dataToUse.Date = moment.unix(data.dt).format("MM/DD/YY")
                     dataToUse.iconCode = data.weather[0].icon
                     dataToUse.status = data.weather[0].main
                     dataToUse.iconURL = "<img src='https://openweathermap.org/img/wn/"+ dataToUse.iconCode + ".png'> ("+dataToUse.status+")"
                     dataToUse.spanHTML = "<span class= 'tag is-large mb-3' id='icon-target'>"+dataToUse.iconURL+"</span>"
                    return UVConnect(dataToUse)
                })
            }
            else{
                message("Please try again")
                searchButton.removeClass('is-loading')
            }
        })
        .catch(function(error){
            alert("There is an error, please try again")
            searchButton.removeClass('is-loading')
        })
    }
    connectApp();
}
load();

searchButton.on("click",function(){
    searchterms = search.val()
    loadApi(searchterms)

})