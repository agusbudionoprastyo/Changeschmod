<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Card</title>
    <link rel="icon" href="images/icon/drawable-hdpi/icon.png" type="image/x-icon">
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" type="text/css" href="sweetalert2/dist/sweetalert2.min.css">
    <link rel="stylesheet" type="text/css" href="css/styles.css">
    <link type="text/css" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/south-street/jquery-ui.css" rel="stylesheet"> 
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script> 
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="https://kit.fontawesome.com/3595b79eb9.js" crossorigin="anonymous"></script>
        <style>
            /* Mengatur container tombol */
            #button-container {
                display: flex; /* Menggunakan flexbox untuk menyusun tombol secara sejajar */
                justify-content: flex-end; /* Menyelaraskan tombol dari kanan */
                gap: 10px; /* Memberikan jarak antar tombol */
                position: fixed; /* Mengambang di posisi tetap pada layar */
                top: 5px; /* Jarak dari atas layar */
                right: 20px; /* Jarak dari kanan layar */
                z-index: 1000; /* Z-index untuk memastikan container di atas elemen lain */
            }

            /* Mengatur gaya tombol yang mengambang */
            .floating-btn {
                position: relative; /* Menggunakan relative untuk posisi relatif dalam flexbox */
                top: 5px; /* Jarak dari atas */
                z-index: 1000; /* Z-index untuk stacking */
            }
        </style>
    <script>

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);

            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'update') {
                alert(event.data.message);
                }
            });
            })
            .catch(error => {
            console.error('Service Worker registration failed:', error);
            });
    }

    function notifyServiceWorkerToUpdateCache() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'clearCache' });
        }
    }
    </script>
</head>
<body>
    <form id="imageForm"> 
    <img src="images/logo.png" alt="logo" class="logo">

    <div id="button-container">
        <button type="button" class="floating-btn" id="pairing-btn" style="display:none;"><i class="fa-solid fa-arrows-rotate"></i></button>
        <button type="button" class="floating-btn" id="unpair-btn" style="display:none;"><i class="fa-solid fa-x" style="color: #ff0000;"></i></button>
        <button type="button" class="floating-btn" id="toggle-btn"><i class="fa-brands fa-apple"></i></button>
    </div>

        <div class="input-group">
            <div class="input-wrapper">
                <input type="text" id="name" placeholder="NAME" disabled style="margin-right: 10px;"/>
                <input type="text" id="phone" placeholder="PHONE NUMBER"/>
            </div>
        </div>

        <div class="input-group">
            <div class="input-wrapper">
                <label for="room"><h3>ROOM</h3></label>
                <input type="text" id="room" placeholder="***" disabled/>
                <label for="folio"><h3>FOLIO</h3></label>
                <input type="text" id="folio" placeholder="*****" disabled/>
            </div>
        </div>      

        <div class="input-group">
            <div class="input-wrapper">
                <label for="dateci"><h3>CHECKIN</h3></label>
                <input type="date" id="dateci" disabled/>
                <label for="dateco"><h3>CHECKOUT</h3></label>
                <input type="date" id="dateco" disabled/>
            </div>
        </div>

        <div class="input-group">
            <div class="input-wrapper">
                <label for="birthday"><h3>BIRTH OF DATE</h3></label>
                <input type="text" id="birthday" placeholder="**/**/****" disabled/>
            </div>
        </div>

        <div class="input-group">
            <div class="input-wrapper">
                <label for="address"><h3>ADDRESS</h3></label>
                <textarea id="address" class="input-address" placeholder="Jl." disabled></textarea>
            </div>
        </div>

        <div class="input-group">
            <div class="input-wrapper">
                <label for="email"><h3>EMAIL</h3></label>
                <input type="text" id="email" placeholder="dafam@mail.com"/>
            </div>
        </div>

        <div id="message"></div>
        <input type="hidden" id="roomtype"/>
        <input type="hidden" id="pdfFile"/>
        
        <div id="signature-pad">
            <label><h3>SIGNATURE</h3></label>
            <canvas></canvas>
            <div class="input-group">
                <div class="input-wrapper">
                    <button type="button" class="undoClear" data-action="clear"><i class="fa-solid fa-eraser"></i></button>
                    <button type="button" data-action="undo"><i class="fa-solid fa-rotate-left"></i></button>
                    <button type="button" id="save-btn" class="cyan">SUBMIT</button>
                </div>
            </div>
        </div>
    </form>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
        var tokenId = localStorage.getItem('deviceTokenId'); // Pastikan kunci 'token_id' sesuai dengan yang Anda set di localStorage

        if (tokenId) {
            fetch('fetch_device_name.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'deviceTokenId=' + tokenId
            })
            .then(response => response.text())
            .then(data => {
                document.getElementById('toggle-btn').innerHTML += ' ' +data;
            })
            .catch(error => console.error('Error:', error));
        }
    });
    </script>

    <script>
    document.getElementById('toggle-btn').addEventListener('click', function() {
        var btnPair = document.getElementById('pairing-btn');
        var btnUnpair = document.getElementById('unpair-btn');
        var btnUnlink = document.getElementById('unlink-btn');
        
        // Toggle visibility
        if (btnPair.style.display === 'none' || btnPair.style.display === '') {
            btnPair.style.display = 'block';
            btnUnpair.style.display = 'block';
            btnUnlink.style.display = 'block';
        } else {
            btnPair.style.display = 'none';
            btnUnpair.style.display = 'none';
            btnUnlink.style.display = 'none';
        }
    });
</script>
    
    <script src="sweetalert2/dist/sweetalert2.min.js"></script>
    <script src="js/signature_pad.umd.js"></script>
    <script src="js/app.js"></script>
    <script src="js/axios.min.js"></script>
    <script src="js/script.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.0.279/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.0.279/pdf.worker.min.js"></script>

    <script>
        var lastScrollTop = 0;
        var floatingBtn = document.getElementById('button-container');

        window.addEventListener("scroll", function() {
            var currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll > lastScrollTop) {
                // Downscroll code
                floatingBtn.style.display = 'none';
            } else {
                // Upscroll code
                floatingBtn.style.display = 'block';
            }

            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
        });
    </script>

</body>
</html>
