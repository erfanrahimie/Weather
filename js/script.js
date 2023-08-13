let cityName = document.querySelector('.w-icon > span:last-child');
let country = document.querySelector('.w-info > p:nth-child(2) > span');
let cityAir = document.querySelector('.w-info > p:nth-child(3) > span');
let temp = document.querySelector('.w-info > p:nth-child(4) > span');
let feelsLike = document.querySelector('.w-info > p:nth-child(5) > span');
let windSpeed = document.querySelector('.w-info > p:nth-child(6) > span');
let humidity = document.querySelector('.w-info > p:nth-child(7) > span');
let timeCity = document.querySelector('.w-info > p:nth-child(8) > span');
let reloadInfo = document.querySelector('.search-container + span');
let sonIcon = document.querySelector('.w-icon > span:nth-child(1)');
let moonIcon = document.querySelector('.w-icon > span:nth-child(2)');
let menuBtn = document.querySelector('.main-box > header > span')


let latitude = 35.67916;
let longitude = 51.39514;
let LocationBtn = document.querySelector('.location-list > div > span');
let closeMapBtn = document.querySelector('.popup-content > span');
let selectLocatinBtn = document.querySelector('.popup-content > button');
let popupMap = document.querySelector('#popup');


let dataCity = [];
let cityList = document.querySelector('.location-list > ul');
let searchBtn = document.querySelector('.search-container > span');
let searchInput = document.querySelector('.search-input');
let alertsContainer = document.getElementById('alerts-container');



const createAlert = (message, status) => {
    const alertElement = document.createElement('div');
    alertElement.classList.add('alert', 'slide-in');
    if (status === 'danger') {
        alertElement.classList.add('alert','error-alert', 'slide-in');
    }
    alertElement.textContent = message;
    alertsContainer.appendChild(alertElement);
  
    setTimeout(() => {
      alertElement.classList.remove('slide-in');
      alertElement.classList.add('slide-out');
      setTimeout(() => {
        alertElement.remove();
      }, 500);
    }, 4000);
}

const loadData = () => {
    let savedData = localStorage.getItem('objectArray');
    if (savedData && JSON.parse(savedData).length) {
        dataCity = JSON.parse(savedData);
        cityList.innerHTML = '';
        dataCity[1].reverse().forEach(data => {
            cityList.innerHTML += `<li><div><span class="lnr lnr-map-marker"></span><p>${data}</p></div><div><span class="lnr lnr-trash"></span><span class="lnr lnr-chevron-right"></span></div></li>`;
        });
    } else {
        dataCity.push('Tehran', []);
    }
}

loadData()

const dataSave = () => {
    localStorage.removeItem('objectArray');
    localStorage.setItem('objectArray', JSON.stringify(dataCity));
}

const setTime = data => {
    let locSelectTime = new Date(data);
    let hours = locSelectTime.getHours();
    let minutes = locSelectTime.getMinutes();
    let seconds = locSelectTime.getSeconds();
    if (hours > 19 || hours < 6) {
        moonIcon.style.display = 'block';
        sonIcon.style.display = 'none';
    } else {
        sonIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
    timeCity.innerText = `${hours}:${minutes}:${seconds}`
}

const setInfo = data => {
    cityName.innerHTML = data['name'];
    country.innerHTML = data['sys']['country'];
    cityAir.innerHTML = data['weather'][0]['main'];
    temp.innerHTML = (data['main']['temp'] - 273.1).toFixed(2);
    feelsLike.innerHTML = (data['main']['feels_like'] - 273.15).toFixed(2);
    temp.innerHTML += ' C°'
    feelsLike.innerHTML += ' C°'
    windSpeed.innerHTML = (data['wind']['speed'] * 3.6).toFixed(0);
    windSpeed.innerHTML += ' km/h'
    humidity.innerHTML = data['main']['humidity'];
    let latlng = []
    latlng.push(data['coord']['lat']);
    latlng.push(data['coord']['lon']);
    getInfo(latlng, true)
        .then(data => setTime(data['formatted']))
        .catch(err => createAlert(err.message, 'danger'))
}

const getInfo = async(parametr, getTime = false) => {
    if (parametr instanceof Object && !getTime) {
        response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${parametr['lat'].toFixed(4)}&lon=${parametr['lng'].toFixed(4)}&appid=f669170d3fe1e149021f4bf7bf696764`);
    } else if (getTime) {
        response = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=NSSU8OU7LFF4&format=json&by=position&lat=${parametr[0]}&lng=${parametr[1]}`);
    }else {
        response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${parametr}&appid=f669170d3fe1e149021f4bf7bf696764`);
    }

    if (!response.ok) {
        throw new Error('There was an issue with retrieving the information!');
    }
    
    return response.json();
}


getInfo(dataCity[0])
    .then(data => setInfo(data))
    .catch(err => createAlert(err.message, 'danger'))

LocationBtn.addEventListener('click', ()=>{
    popupMap.style.display= 'flex';
    const map = L.map('map').setView([latitude, longitude], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
    map.getContainer().style.filter = 'invert(100%)';
    map.getContainer().style.background = 'invert(100%)';
    
    selectLocatinBtn.addEventListener('click', ()=> {
        let markerLatLng = marker.getLatLng();
        addCity = (data) => {
            if (!dataCity[1].includes(data['name']) && dataCity[0] != data['name']) {
                dataCity[1].push(data['name']);
                dataSave();
                popupMap.style.display= 'none';
                loadData();
                createAlert('The location was successfully added.');
            } else {
                createAlert('This location already exists.');
            }
        }
        getInfo(markerLatLng)
            .then(data => addCity(data))
            .catch(err => createAlert(err.message, 'danger'));
    });
});

reloadInfo.addEventListener('click', () => {
    let icon = reloadInfo.querySelector('span');
    icon.style.transition = 'transform 1s ease-in-out';
    icon.style.transform = 'rotate(-360deg)';
    
    setTimeout(() => {
      icon.style.transition = '';
      icon.style.transform = '';
    }, 1000);

    console.log()
    getInfo(dataCity[0])
        .then(data => setInfo(data))
        .catch(err => createAlert(err.message, 'danger'))
    createAlert('The page content has been successfully updated.');
});

cityList.addEventListener('click', (item)=> {
    if (item.target.className === 'lnr lnr-chevron-right') {
        citySelect = item.target.parentElement.parentElement
        nameCity = citySelect.querySelector('p').innerText
        dataCity[1].push(dataCity[0])
        dataCity[1] = dataCity[1].filter(item => item !== nameCity);
        dataCity[0] = nameCity;
        dataSave();
        getInfo(dataCity[0])
            .then(data => setInfo(data))
            .catch(err => createAlert(err.message, 'danger'))
        loadData();
    } else if(item.target.className === 'lnr lnr-trash'){
        citySelect = item.target.parentElement.parentElement
        nameCity = citySelect.querySelector('p').innerText
        dataCity[1] = dataCity[1].filter(item => item !== nameCity);
        dataSave();
        loadData();
        createAlert('The location was successfully deleted.');
    }
});

closeMapBtn.addEventListener('click', ()=> {
    popupMap.style.display= 'none';
});

searchBtn.addEventListener('click', ()=> {
    console.log(window.innerWidth < 768)
    if (window.innerWidth < 768) {
            if (searchInput.className.includes('active-input')) {
                setTimeout(()=>{
                    menuBtn.parentElement.style.justifyContent = 'space-between'
                    reloadInfo.style.display = 'flex';
                    menuBtn.style.display = 'flex';
                }, 350);
            } else {
                menuBtn.parentElement.style.justifyContent = 'center';
                reloadInfo.style.display = 'none';
                menuBtn.style.display = 'none';
            }
    }
    if (searchInput.className.includes('active-input')) {
        searchInput.classList.remove('active-input')
    } else {
        searchInput.classList.add('active-input')
        searchInput.focus();
    }
})

searchInput.addEventListener('keyup', (data)=>{
    let text = data.target.value.toLowerCase();
    let dataList = cityList.querySelectorAll('li > div:nth-child(1) > p');
    dataList.forEach(data => {
        if (data.innerText.toLowerCase().indexOf(text) != -1) {
            data.parentElement.parentElement.style.display = 'flex';
        } else {
            data.parentElement.parentElement.style.display = 'none';
        }
    })
})

menuBtn.addEventListener('click', () => {
    createAlert('Made by ERFAN');
})