const storage = (table) => {

    if (!localStorage.getItem(table)) {
        localStorage.setItem(table, JSON.stringify({}));
    }

    const get = (key = null) => {
        let data = JSON.parse(localStorage.getItem(table));
        return key ? data[key] : data;
    };

    const set = (key, value) => {
        let storage = get();
        storage[key] = value;
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const unset = (key) => {
        let storage = get();
        delete storage[key];
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const has = (key) => Object.keys(get()).includes(key);

    return {
        get,
        set,
        unset,
        has,
    };
};

const request = (method, path) => {

    let url = document.querySelector('body').getAttribute('data-url');
    let req = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (url.slice(-1) == '/') {
        url = url.slice(0, -1);
    }

    return {
        async then(...params) {
            return fetch(url + path, req)
                .then((res) => res.json())
                .then((res) => {
                    if (res.error !== null) {
                        throw res.error[0];
                    }

                    return res;
                })
                .then(...params);
        },
        token(token) {
            req.headers['Authorization'] = 'Bearer ' + token;
            return this;
        },
        body(body) {
            req.body = JSON.stringify(body);
            return this;
        },
    };
};

const util = (() => {

    const opacity = (nama) => {
        let nm = document.getElementById(nama);
        let op = parseInt(nm.style.opacity);
        let clear = null;

        clear = setInterval(() => {
            if (op >= 0) {
                nm.style.opacity = op.toString();
                op -= 0.025;
            } else {
                clearInterval(clear);
                clear = null;
                nm.remove();
                return;
            }
        }, 10);
    };

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const salin = (btn, msg = 'Tersalin', timeout = 1500) => {
        navigator.clipboard.writeText(btn.getAttribute('data-nomer'));

        let tmp = btn.innerHTML;
        btn.innerHTML = msg;
        btn.disabled = true;

        let clear = null;
        clear = setTimeout(() => {
            btn.innerHTML = tmp;
            btn.disabled = false;
            btn.focus();

            clearTimeout(clear);
            clear = null;
            return;
        }, timeout);
    };

    const timer = () => {
        let countDownDate = (new Date(document.getElementById('tampilan-waktu').getAttribute('data-waktu').replace(' ', 'T'))).getTime();

        setInterval(() => {
            let distance = Math.abs(countDownDate - (new Date()).getTime());

            document.getElementById('hari').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.getElementById('jam').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('menit').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('detik').innerText = Math.floor((distance % (1000 * 60)) / 1000);
        }, 1000);
    };

    const music = (btn) => {
        if (btn.getAttribute('data-status') !== 'true') {
            btn.setAttribute('data-status', 'true');
            audio.play();
            btn.innerHTML = '<i class="fa-solid fa-circle-pause spin-button"></i>';
        } else {
            btn.setAttribute('data-status', 'false');
            audio.pause();
            btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
        }
    };

    const modal = (img) => {
        document.getElementById('show-modal-image').src = img.src;
        (new bootstrap.Modal('#modal-image')).show();
    };

    const tamu = () => {
        let name = (new URLSearchParams(window.location.search)).get('to');

        if (!name) {
            document.getElementById('nama-tamu').remove();
            return;
        }

        let div = document.createElement('div');
        div.classList.add('m-2');
        div.innerHTML = `<p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p><h2 class="text-light">${escapeHtml(name)}</h2>`;

        document.getElementById('form-nama').value = name;
        document.getElementById('nama-tamu').appendChild(div);
    };

    const animation = async () => {
        const duration = 10 * 1000;
        const animationEnd = Date.now() + duration;
        let skew = 1;

        let randomInRange = (min, max) => {
            return Math.random() * (max - min) + min;
        };

        (async function frame() {
            const timeLeft = animationEnd - Date.now();
            const ticks = Math.max(200, 500 * (timeLeft / duration));

            skew = Math.max(0.8, skew - 0.001);

            await confetti({
                particleCount: 1,
                startVelocity: 0,
                ticks: ticks,
                origin: {
                    x: Math.random(),
                    y: Math.random() * skew - 0.2,
                },
                colors: ["FFC0CB", "FF69B4", "FF1493", "C71585"],
                shapes: ["heart"],
                gravity: randomInRange(0.5, 1),
                scalar: randomInRange(1, 2),
                drift: randomInRange(-0.5, 0.5),
            });

            if (timeLeft > 0) {
                requestAnimationFrame(frame);
            }
        })();
    };

    const buka = async (button) => {
        button.disabled = true;
        document.querySelector('body').style.overflowY = 'scroll';
        AOS.init();
        audio.play();

        if (localStorage.getItem('alertClosed')) {
            document.getElementById('alertDiv').style.display = 'none';
        }

        opacity('welcome');
        document.getElementById('tombol-musik').style.display = 'block';
        timer();

        await confetti({
            origin: { y: 0.8 },
            zIndex: 1057
        });
        await animation();
    };

    const show = () => {
        tamu();
        opacity('loading');
        window.scrollTo(0, 0);
    };

    return {
        buka,
        tamu,
        modal,
        music,
        salin,
        escapeHtml,
        opacity,
        show
    };
})();

const progress = (() => {

    const assets = document.querySelectorAll('img');
    const info = document.getElementById('progress-info');
    const bar = document.getElementById('bar');

    let total = assets.length;
    let loaded = 0;

    const progress = () => {
        loaded += 1;

        bar.style.width = Math.min((loaded / total) * 100, 100).toString() + "%";
        info.innerText = `Loading assets (${loaded}/${total}) [${parseInt(bar.style.width).toFixed(0)}%]`;

        if (loaded == total) {
            util.show();
        }
    };

    assets.forEach((asset) => {
        if (asset.complete && (asset.naturalWidth !== 0)) {
            progress();
        } else {
            asset.addEventListener('load', () => progress());
        }
    });
})();

const audio = (() => {
    let audio = null;

    const singleton = () => {
        if (!audio) {
            audio = new Audio();
            audio.src = document.getElementById('tombol-musik').getAttribute('data-url');
            audio.load();
            audio.currentTime = 0;
            audio.autoplay = true;
            audio.muted = false;
            audio.loop = true;
            audio.volume = 1;
        }

        return audio;
    };

    return {
        play: () => singleton().play(),
        pause: () => singleton().pause(),
    };
})();

const comments = () =>{
   
  
        const UCAPAN = document.getElementById('daftar-ucapan');

  $.getJSON("https://script.googleusercontent.com/macros/echo?user_content_key=lyFGvWrU4imduRBvC4jA1Kg9veXiKssbl282oRzzR9_ciTO9XO6Mw4nb0lmUvMYMcEVHM8OghLQHJw9Q75lfIfqvnt0W1dEDOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMWojr9NvTBuBLhyHCd5hHaycrEzNhlqxuej4n49pSEiCs5SPreC2QyQ5TIMk2stw11qKo74XirIDbfUOhEQyMWTdFZXw4mgS4jD3R6IC0EsqWCdo-iHTpOno2yeDGxMjWqoRHbWky2UWt06GC-ZnJYl4QEr2paiAhgIgF_EBhIfC0tW7FROm7JT7pTl6U6gb8u--hnZjV4WE&lib=MzrdOdBHdVpRVNWKhVKR17CJes7BewgY5", function(result){
       console.log(result["data"]["link"]);
       var m= result["data"]["link"];
       
         UCAPAN.innerHTML = null;

                    if (result["data"]["link"].length == 0) {
                        UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
                    }
                $.each(m, function(i){
                  
        const DIV = document.createElement('div');
        DIV.classList.add('mb-3');
       DIV.innerHTML = `
        <div class="card-body bg-light shadow p-3 m-0 rounded-4" data-parent="true" id="${m[i].Judul}">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                    <strong class="me-1">${m[i].Judul}</strong><i class="fa-solid fa-circle-check text-success"></i>
                </p>
            </div>
            <hr class="text-dark my-1">
            <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${m[i].Judul}</p>
        </div>`;

                     UCAPAN.appendChild(DIV);
       });
     });
};
comments();




    const kirim = () => {
      
const stored = localStorage[location.href] 
const id = stored && JSON.parse(stored) || [Math.floor(Math.random() * 6) + 2, Math.floor(Math.random() * 6) + 2]


if ( !stored ) localStorage[location.href] = JSON.stringify(id)




        const name = document.getElementById('form-nama');
        if (name.value.length == 0) {
            alert('Please fill name');
            return;
        }

        const presence = document.getElementById('form-kehadiran');
        
        const form = document.getElementById(`form-pesan`);
       

 $.getJSON("https://script.google.com/macros/s/AKfycbwvRlurPQ0nDCp_StgnybhG2Q8_CAdu4fw-4_V1Z8EMDaRosrc/exec?id=1tbaznkJjfaBmCzWdnOZxVePUydEU4zsAP-NElF24D9M&sheet=comments&action=insert&nama="+id+"&email="+name.value+"&pasword= "+presence.value+"&nope=,"+form.value, function(result){
       console.log(result);
     comments();
     });

            

    };

