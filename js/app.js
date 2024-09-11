document.addEventListener('DOMContentLoaded', function() {
  const pads = [];
  const canvases = [];

  function resizeCanvas(canvas) {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const context = canvas.getContext("2d");
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height); // Clear the canvas before resizing

    // Optionally re-render the existing signature here
    const pad = pads[canvases.indexOf(canvas)];
    if (pad && !pad.isEmpty()) {
      pad.fromData(pad.toData());
    }
  }

  // Initialize Signature Pads
  for (let i = 1; i <= 4; i++) {
    const canvas = document.querySelector(`#signature-pad-${i} canvas`);
    canvases.push(canvas);
    pads[i - 1] = new SignaturePad(canvas);

    // Event listener for Undo Button
    const undoButton = document.querySelector(`#signature-pad-${i} [data-action=undo]`);
    if (undoButton) {
      undoButton.addEventListener("click", () => {
        const pad = pads[i - 1];
        const data = pad.toData();
        if (data) {
          data.pop(); // Remove the last dot or line
          pad.fromData(data);
        }
      });
    }

    // Event listener for Clear Button
    const clearButton = document.querySelector(`#signature-pad-${i} .undoClear`);
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        pads[i - 1].clear();
      });
    }

      // Event listener for Save Button
      if (i === 4) { // Assuming the last pad has a submit button
          const saveButton = document.querySelector(`#signature-pad-${i} #save-btn`);
          if (saveButton) {
          saveButton.addEventListener('click', function() {
              // Directly obtain data URL from the pad without checking if it's empty
              const dataURL = pads[i - 1].toDataURL();
              console.log(`Signature ${i} data URL:`, dataURL);
              // Handle the data URL (e.g., send it to a server or display it)
          });
          }
      }  
  }

  // Resize all canvases on page load
  canvases.forEach(canvas => resizeCanvas(canvas));

  // Resize canvases on window resize
  window.addEventListener("resize", function() {
    canvases.forEach(canvas => resizeCanvas(canvas));
  });

  // Fetch Data
const nameSelect = document.getElementById('name');
const name2Select = document.getElementById('name2');

// Function to populate the select elements with names
function populateNames() {
    fetch('get_names.php')
        .then(response => response.json())
        .then(data => {
            // Clear existing options
            nameSelect.innerHTML = '';
            name2Select.innerHTML = '';

            data.forEach(person => {
                const option = document.createElement('option');
                option.value = person.id;
                option.textContent = person.name;
                nameSelect.appendChild(option);
                name2Select.appendChild(option.cloneNode(true));
            });

            // Restore previously selected values and details
            restoreSelections();
            restoreDetails();
        });
}

// Function to handle selection change and save to local storage
function handleSelectChange(event) {
    const selectId = event.target.id;
    const selectedValue = event.target.value;

    localStorage.setItem(selectId, selectedValue);
}

// Function to restore selections from local storage
function restoreSelections() {
    const nameValue = localStorage.getItem('name');
    const name2Value = localStorage.getItem('name2');

    if (nameValue) {
        nameSelect.value = nameValue;
        handleSelectChange({ target: nameSelect }); // Trigger updateDetails for nameSelect
    }
    if (name2Value) {
        name2Select.value = name2Value;
        handleSelectChange({ target: name2Select }); // Trigger updateDetails for name2Select
    }
}

// Function to update details and save them to local storage
function updateDetails(selectElement, deptInput, posInput, nameInput) {
    selectElement.addEventListener('change', function () {
        const id = this.value;
        if (id) {
            fetch(`get_details.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    deptInput.value = data.dept;
                    posInput.value = data.position;
                    nameInput.value = data.name;

                    // Save details to local storage
                    localStorage.setItem(`${selectElement.id}_dept`, data.dept);
                    localStorage.setItem(`${selectElement.id}_position`, data.position);
                    localStorage.setItem(`${selectElement.id}_name`, data.name);
                });
        } else {
            deptInput.value = '';
            posInput.value = '';
            nameInput.value = '';

            // Clear details from local storage
            localStorage.removeItem(`${selectElement.id}_dept`);
            localStorage.removeItem(`${selectElement.id}_position`);
            localStorage.removeItem(`${selectElement.id}_name`);
        }
    });
}

// Function to restore details from local storage
function restoreDetails() {
    const nameDept = localStorage.getItem('name_dept');
    const namePosition = localStorage.getItem('name_position');
    const nameName = localStorage.getItem('name_name');
    
    if (nameSelect.value) {
        document.getElementById('dept').value = nameDept || '';
        document.getElementById('pos').value = namePosition || '';
        document.getElementById('nametext').value = nameName || '';
    }

    const name2Dept = localStorage.getItem('name2_dept');
    const name2Position = localStorage.getItem('name2_position');
    const name2Name = localStorage.getItem('name2_name');
    
    if (name2Select.value) {
        document.getElementById('dept2').value = name2Dept || '';
        document.getElementById('pos2').value = name2Position || '';
        document.getElementById('nametext2').value = name2Name || '';
    }
}

// Event listeners for select elements
nameSelect.addEventListener('change', handleSelectChange);
name2Select.addEventListener('change', handleSelectChange);

// Populate names on page load
populateNames();

// Initialize details update functionality
updateDetails(nameSelect, document.getElementById('dept'), document.getElementById('pos'), document.getElementById('nametext'));
updateDetails(name2Select, document.getElementById('dept2'), document.getElementById('pos2'), document.getElementById('nametext2'));

//

// URL API dan parameter
const apiUrl = 'https://date.nager.at/Api/v2/PublicHolidays/';
const countryCode = 'ID'; // Kode negara untuk Indonesia, periksa dokumentasi API
const year = new Date().getFullYear(); // Tahun saat ini

// Mendapatkan tanggal merah dari API
async function fetchTanggalMerah() {
  try {
    const response = await fetch(`${apiUrl}${year}/${countryCode}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.map(holiday => holiday.date); // Mengambil tanggal libur
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data:', error);
    return [];
  }
}

// Fungsi untuk memeriksa apakah tanggal ada di dalam tanggal merah
function isTanggalMerah(date, tanggalMerah) {
  return tanggalMerah.includes(date.toISOString().split('T')[0]);
}

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage() {
  localStorage.setItem('from1Date', document.getElementById('from1').value);
  localStorage.setItem('to1Date', document.getElementById('to1').value);
  localStorage.setItem('frommod1Value', document.getElementById('frommod1').value);
  localStorage.setItem('tomod1Value', document.getElementById('tomod1').value);
  localStorage.setItem('from2Date', document.getElementById('from2').value);
  localStorage.setItem('to2Date', document.getElementById('to2').value);
  localStorage.setItem('frommod2Value', document.getElementById('frommod2').value);
  localStorage.setItem('tomod2Value', document.getElementById('tomod2').value);
}

// Fungsi untuk memuat data dari localStorage
function loadFromLocalStorage() {
  document.getElementById('from1').value = localStorage.getItem('from1Date') || '';
  document.getElementById('to1').value = localStorage.getItem('to1Date') || '';
  document.getElementById('frommod1').value = localStorage.getItem('frommod1Value') || '';
  document.getElementById('tomod1').value = localStorage.getItem('tomod1Value') || '';
  document.getElementById('from2').value = localStorage.getItem('from2Date') || '';
  document.getElementById('to2').value = localStorage.getItem('to2Date') || '';
  document.getElementById('frommod2').value = localStorage.getItem('frommod2Value') || '';
  document.getElementById('tomod2').value = localStorage.getItem('tomod2Value') || '';
}

// Fungsi untuk memperbarui dropdown berdasarkan tanggal
async function fromOptions() {
  const from1Date = document.getElementById('from1').value;
  const from1Day = new Date(from1Date).getDay();

  const weekdaysOptions = ['MOD'];
  const weekendsOptions = ['MOD 1', 'MOD 2'];
  const redDateOptions = ['MOD 1', 'MOD 2']; // Opsi untuk tanggal merah

  function populateSelect(selectElement, options) {
    selectElement.innerHTML = ''; // Clear existing options
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.text = option;
      selectElement.add(opt);
    });
    selectElement.disabled = false; // Enable the select element
  }

  if (from1Date) {
    const tanggalMerah = await fetchTanggalMerah(); // Ambil tanggal merah dari API

    let options = [];
    if (isTanggalMerah(new Date(from1Date), tanggalMerah)) {
      options = redDateOptions;
    } else if (from1Day === 0 || from1Day === 6) {
      options = weekendsOptions;
    } else {
      options = weekdaysOptions;
    }
    populateSelect(document.getElementById('frommod1'), options);
  }

  // Automatically fill second set of selects with same values as the first set
  document.getElementById('to2').value = from1Date;

  // Sync second set of selects with the same options
  syncSelectOptions('frommod1', 'tomod2');

  // Save to localStorage
  saveToLocalStorage();
}

// Fungsi untuk memperbarui dropdown berdasarkan tanggal
async function toOptions() {
  const to1Date = document.getElementById('to1').value;
  const to1Day = new Date(to1Date).getDay();

  const weekdaysOptions = ['MOD'];
  const weekendsOptions = ['MOD 1', 'MOD 2'];
  const redDateOptions = ['MOD 1', 'MOD 2']; // Opsi untuk tanggal merah

  function populateSelect(selectElement, options) {
    selectElement.innerHTML = ''; // Clear existing options
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.text = option;
      selectElement.add(opt);
    });
    selectElement.disabled = false; // Enable the select element
  }

  if (to1Date) {
    const tanggalMerah = await fetchTanggalMerah(); // Ambil tanggal merah dari API

    let options = [];
    if (isTanggalMerah(new Date(to1Date), tanggalMerah)) {
      options = redDateOptions;
    } else if (to1Day === 0 || to1Day === 6) {
      options = weekendsOptions;
    } else {
      options = weekdaysOptions;
    }
    populateSelect(document.getElementById('tomod1'), options);
  }

  // Automatically fill second set of selects with same values as the first set
  document.getElementById('from2').value = to1Date;

  // Sync second set of selects with the same options
  syncSelectOptions('tomod1', 'frommod2');

  // Save to localStorage
  saveToLocalStorage();
}

// Fungsi untuk menyinkronkan opsi antara dropdown
function syncSelectOptions(sourceId, targetId) {
  const sourceSelect = document.getElementById(sourceId);
  const targetSelect = document.getElementById(targetId);

  // Copy options to source select to target select
  targetSelect.innerHTML = sourceSelect.innerHTML;

  // Set target select value to match source select value if it exists
  if (sourceSelect.value) {
      targetSelect.value = sourceSelect.value;
  }
}

// Fungsi untuk memperbarui dropdown berdasarkan perubahan pilihan
function updateDropdownsOnChange() {
  const frommod1 = document.getElementById('frommod1');
  const tomod1 = document.getElementById('tomod1');

  frommod1.addEventListener('change', () => {
      syncSelectOptions('frommod1', 'tomod2');
      saveToLocalStorage();
  });

  tomod1.addEventListener('change', () => {
      syncSelectOptions('tomod1', 'frommod2');
      saveToLocalStorage();
  });
}

loadFromLocalStorage(); // Load data from localStorage on page load
fromOptions();
toOptions();
updateDropdownsOnChange();


});

// // URL API dan parameter
// const apiUrl = 'https://date.nager.at/Api/v2/PublicHolidays/';
// const countryCode = 'ID'; // Kode negara untuk Indonesia, periksa dokumentasi API
// const year = new Date().getFullYear(); // Tahun saat ini

// // Mendapatkan tanggal merah dari API
// async function fetchTanggalMerah() {
//   try {
//     const response = await fetch(`${apiUrl}${year}/${countryCode}`);
//     if (!response.ok) throw new Error('Network response was not ok');
//     const data = await response.json();
//     return data.map(holiday => holiday.date); // Mengambil tanggal libur
//   } catch (error) {
//     console.error('Terjadi kesalahan saat mengambil data:', error);
//     return [];
//   }
// }

// // Fungsi untuk memeriksa apakah tanggal ada di dalam tanggal merah
// function isTanggalMerah(date, tanggalMerah) {
//   return tanggalMerah.includes(date.toISOString().split('T')[0]);
// }

// // Fungsi untuk menyimpan data ke localStorage
// function saveToLocalStorage() {
//   localStorage.setItem('from1Date', document.getElementById('from1').value);
//   localStorage.setItem('to1Date', document.getElementById('to1').value);
//   localStorage.setItem('frommod1Value', document.getElementById('frommod1').value);
//   localStorage.setItem('tomod1Value', document.getElementById('tomod1').value);
//   localStorage.setItem('from2Date', document.getElementById('from2').value);
//   localStorage.setItem('to2Date', document.getElementById('to2').value);
//   localStorage.setItem('frommod2Value', document.getElementById('frommod2').value);
//   localStorage.setItem('tomod2Value', document.getElementById('tomod2').value);
// }

// // Fungsi untuk memuat data dari localStorage
// function loadFromLocalStorage() {
//   document.getElementById('from1').value = localStorage.getItem('from1Date') || '';
//   document.getElementById('to1').value = localStorage.getItem('to1Date') || '';
//   document.getElementById('frommod1').value = localStorage.getItem('frommod1Value') || '';
//   document.getElementById('tomod1').value = localStorage.getItem('tomod1Value') || '';
//   document.getElementById('from2').value = localStorage.getItem('from2Date') || '';
//   document.getElementById('to2').value = localStorage.getItem('to2Date') || '';
//   document.getElementById('frommod2').value = localStorage.getItem('frommod2Value') || '';
//   document.getElementById('tomod2').value = localStorage.getItem('tomod2Value') || '';
// }

// // Fungsi untuk memperbarui dropdown berdasarkan tanggal
// async function fromOptions() {
//   const from1Date = document.getElementById('from1').value;
//   const from1Day = new Date(from1Date).getDay();

//   const weekdaysOptions = ['MOD'];
//   const weekendsOptions = ['MOD 1', 'MOD 2'];
//   const redDateOptions = ['MOD 1', 'MOD 2']; // Opsi untuk tanggal merah

//   function populateSelect(selectElement, options) {
//     selectElement.innerHTML = ''; // Clear existing options
//     options.forEach(option => {
//       const opt = document.createElement('option');
//       opt.value = option;
//       opt.text = option;
//       selectElement.add(opt);
//     });
//     selectElement.disabled = false; // Enable the select element
//   }

//   if (from1Date) {
//     const tanggalMerah = await fetchTanggalMerah(); // Ambil tanggal merah dari API

//     let options = [];
//     if (isTanggalMerah(new Date(from1Date), tanggalMerah)) {
//       options = redDateOptions;
//     } else if (from1Day === 0 || from1Day === 6) {
//       options = weekendsOptions;
//     } else {
//       options = weekdaysOptions;
//     }
//     populateSelect(document.getElementById('frommod1'), options);
//   }

//   // Automatically fill second set of selects with same values as the first set
//   document.getElementById('to2').value = from1Date;

//   // Sync second set of selects with the same options
//   syncSelectOptions('frommod1', 'tomod2');

//   // Save to localStorage
//   saveToLocalStorage();
// }

// // Fungsi untuk memperbarui dropdown berdasarkan tanggal
// async function toOptions() {
//   const to1Date = document.getElementById('to1').value;
//   const to1Day = new Date(to1Date).getDay();

//   const weekdaysOptions = ['MOD'];
//   const weekendsOptions = ['MOD 1', 'MOD 2'];
//   const redDateOptions = ['MOD 1', 'MOD 2']; // Opsi untuk tanggal merah

//   function populateSelect(selectElement, options) {
//     selectElement.innerHTML = ''; // Clear existing options
//     options.forEach(option => {
//       const opt = document.createElement('option');
//       opt.value = option;
//       opt.text = option;
//       selectElement.add(opt);
//     });
//     selectElement.disabled = false; // Enable the select element
//   }

//   if (to1Date) {
//     const tanggalMerah = await fetchTanggalMerah(); // Ambil tanggal merah dari API

//     let options = [];
//     if (isTanggalMerah(new Date(to1Date), tanggalMerah)) {
//       options = redDateOptions;
//     } else if (to1Day === 0 || to1Day === 6) {
//       options = weekendsOptions;
//     } else {
//       options = weekdaysOptions;
//     }
//     populateSelect(document.getElementById('tomod1'), options);
//   }

//   // Automatically fill second set of selects with same values as the first set
//   document.getElementById('from2').value = to1Date;

//   // Sync second set of selects with the same options
//   syncSelectOptions('tomod1', 'frommod2');

//   // Save to localStorage
//   saveToLocalStorage();
// }

// // Fungsi untuk menyinkronkan opsi antara dropdown
// function syncSelectOptions(sourceId, targetId) {
//   const sourceSelect = document.getElementById(sourceId);
//   const targetSelect = document.getElementById(targetId);

//   // Copy options to source select to target select
//   targetSelect.innerHTML = sourceSelect.innerHTML;

//   // Set target select value to match source select value if it exists
//   if (sourceSelect.value) {
//       targetSelect.value = sourceSelect.value;
//   }
// }

// // Fungsi untuk memperbarui dropdown berdasarkan perubahan pilihan
// function updateDropdownsOnChange() {
//   const frommod1 = document.getElementById('frommod1');
//   const tomod1 = document.getElementById('tomod1');

//   frommod1.addEventListener('change', () => {
//       syncSelectOptions('frommod1', 'tomod2');
//       saveToLocalStorage();
//   });

//   tomod1.addEventListener('change', () => {
//       syncSelectOptions('tomod1', 'frommod2');
//       saveToLocalStorage();
//   });
// }

// // Initial setup
// window.addEventListener('DOMContentLoaded', () => {
//   loadFromLocalStorage(); // Load data from localStorage on page load
//   fromOptions();
//   toOptions();
//   updateDropdownsOnChange();
// });