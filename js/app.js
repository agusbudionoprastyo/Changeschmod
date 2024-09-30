document.addEventListener('DOMContentLoaded', function() {
  const pads = [];
const canvases = [];

// Function to resize the canvas
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
      localStorage.removeItem(`signature-pad-${i}`); // Remove from local storage
      console.log(`Signature ${i} cleared and removed from local storage.`);
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

  // // Event listener for the Sign Button
  // const signButton = document.querySelector(`#signature-pad-${i} #sign`);
  // if (signButton) {
  //   signButton.addEventListener('click', function() {
  //     const pad = pads[i - 1];
  //     const dataURL = pad.toDataURL();
  //     localStorage.setItem(`signature-pad-${i}`, dataURL);
  //     console.log(`Signature ${i} saved to local storage.`);
  //   });
  // }
  // Event listener for the Sign Button
  const signButton = document.querySelector(`#signature-pad-${i} #sign`);
  if (signButton) {
    signButton.addEventListener('click', function() {
      const pad = pads[i - 1];
      
      // Check if the pad has any data
      if (!pad.isEmpty()) {
        const dataURL = pad.toDataURL();
        
        // Save the signature data URL to local storage
        localStorage.setItem(`signature-pad-${i}`, dataURL);
        console.log(`Signature ${i} saved to local storage.`);
        
        // Show success message using SweetAlert
        Swal.fire({
          icon: 'info',
          title: 'Signed!',
          text: 'Your signature has been saved.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded',
            confirmButton: 'roundedBtn'
          }
        });
      } else {
        // Show message if the pad is empty
        Swal.fire({
          icon: 'warning',
          title: 'No Signature!',
          text: 'Please add a signature before saving.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded',
            confirmButton: 'roundedBtn'
          }
        });
      }
    });
  }

}

// Function to load saved signatures
function loadSignatures() {
  pads.forEach((pad, index) => {
    const dataURL = localStorage.getItem(`signature-pad-${index + 1}`);
    if (dataURL) {
      const img = new Image();
      img.onload = () => {
        pad.clear(); // Clear the current pad
        pad.fromDataURL(dataURL); // Load the saved data
      };
      img.src = dataURL;
    }
  });
}

// Function to resize canvases and then load signatures
function resizeAndLoadSignatures() {
  canvases.forEach(canvas => resizeCanvas(canvas));
  loadSignatures(); // Load signatures after resizing
}

// Resize canvases and load signatures on page load
window.addEventListener('load', resizeAndLoadSignatures);

// Resize canvases on window resize
window.addEventListener('resize', () => {
  resizeAndLoadSignatures();
});
  
//

  // Fetch Data
const nameSelect = document.getElementById('name');
const name2Select = document.getElementById('name2');

// Function to populate the select elements with names
function populateNames() {
    fetch('get_names.php')
        .then(response => response.json())
        .then(data => {

            // // Clear existing options
            // nameSelect.innerHTML = '';
            // name2Select.innerHTML = '';

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

});

// URL API dan parameter
const apiUrl = 'https://libur.deno.dev/api';
// const countryCode = 'ID'; // Kode negara untuk Indonesia, periksa dokumentasi API
// const year = new Date().getFullYear(); // Tahun saat ini

// Mendapatkan tanggal merah dari API
async function fetchTanggalMerah() {
  try {
    const response = await fetch(`${apiUrl}`);
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
  const data = {
    from1Date: document.getElementById('from1').value,
    to1Date: document.getElementById('to1').value,
    frommod1Value: document.getElementById('frommod1').value,
    tomod1Value: document.getElementById('tomod1').value,
    from2Date: document.getElementById('from2').value,
    to2Date: document.getElementById('to2').value,
    frommod2Value: document.getElementById('frommod2').value,
    tomod2Value: document.getElementById('tomod2').value
  };

  for (const key in data) {
    localStorage.setItem(key, data[key]);
  }

  // Log the data being saved
  console.log('Data saved to localStorage:', data);
}


// Fungsi untuk memuat data dari localStorage
function loadFromLocalStorage() {
  const data = {
    from1Date: localStorage.getItem('from1Date') || '',
    to1Date: localStorage.getItem('to1Date') || '',
    frommod1Value: localStorage.getItem('frommod1Value') || '',
    tomod1Value: localStorage.getItem('tomod1Value') || '',
    from2Date: localStorage.getItem('from2Date') || '',
    to2Date: localStorage.getItem('to2Date') || '',
    frommod2Value: localStorage.getItem('frommod2Value') || '',
    tomod2Value: localStorage.getItem('tomod2Value') || ''
  };

  // Apply the loaded values to the form fields
  document.getElementById('from1').value = data.from1Date;
  document.getElementById('to1').value = data.to1Date;
  document.getElementById('frommod1').value = data.frommod1Value;
  document.getElementById('tomod1').value = data.tomod1Value;
  document.getElementById('from2').value = data.from2Date;
  document.getElementById('to2').value = data.to2Date;
  document.getElementById('frommod2').value = data.frommod2Value;
  document.getElementById('tomod2').value = data.tomod2Value;

  // Log the loaded data
  console.log('Data loaded from localStorage:', data);
}


async function fromOptions() {
  const from1Date = document.getElementById('from1').value;

  if (from1Date) {
    const tanggalMerah = await fetchTanggalMerah(); // Ambil tanggal merah dari API
    const from1Day = new Date(from1Date).getDay();

    let options = [];
    if (isTanggalMerah(new Date(from1Date), tanggalMerah)) {
      options = ['MOD1', 'MOD2'];
    } else if (from1Day === 0 || from1Day === 6) {
      options = ['MOD1', 'MOD2'];
    } else {
      options = ['MOD'];
    }

    populateSelect(document.getElementById('frommod1'), options);

    const fromMod1Value = localStorage.getItem('frommod1Value');
    if (fromMod1Value) {
      document.getElementById('frommod1').value = fromMod1Value;
    }
  } else {
    // Jika from1Date kosong, kosongkan opsi dari dropdown
    populateSelect(document.getElementById('frommod1'), []);
  }

  document.getElementById('to2').value = from1Date;
  syncSelectOptions('frommod1', 'tomod2');
  saveToLocalStorage();
}

async function toOptions() {
  const to1Date = document.getElementById('to1').value;

  if (to1Date) {
    const tanggalMerah = await fetchTanggalMerah(); // Ambil tanggal merah dari API
    const to1Day = new Date(to1Date).getDay();

    let options = [];
    if (isTanggalMerah(new Date(to1Date), tanggalMerah)) {
      options = ['MOD1', 'MOD2'];
    } else if (to1Day === 0 || to1Day === 6) {
      options = ['MOD1', 'MOD2'];
    } else {
      options = ['MOD'];
    }

    populateSelect(document.getElementById('tomod1'), options);

    const toMod1Value = localStorage.getItem('tomod1Value');
    if (toMod1Value) {
      document.getElementById('tomod1').value = toMod1Value;
    }
  } else {
    // Jika to1Date kosong, kosongkan opsi dari dropdown
    populateSelect(document.getElementById('tomod1'), []);
  }

  document.getElementById('from2').value = to1Date;
  syncSelectOptions('tomod1', 'frommod2');
  saveToLocalStorage();
}

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



// Fungsi untuk menyinkronkan opsi antara dropdown
function syncSelectOptions(sourceId, targetId) {
  const sourceSelect = document.getElementById(sourceId);
  const targetSelect = document.getElementById(targetId);

  // Only sync options if not already synced
  if (sourceSelect.innerHTML !== targetSelect.innerHTML) {
    // Copy options to source select to target select
    targetSelect.innerHTML = sourceSelect.innerHTML;
  }

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

window.addEventListener('DOMContentLoaded', async () => {
  loadFromLocalStorage(); // Load data from localStorage on page load

  // Tunggu sampai data di-load sebelum memanggil fungsi lainnya
  await fromOptions();
  await toOptions();
  
  updateDropdownsOnChange();
});
