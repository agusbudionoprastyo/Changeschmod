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

//   // Fetch Data
//   const nameSelect = document.getElementById('name');
//   const name2Select = document.getElementById('name2');

//   function populateNames() {
//       fetch('get_names.php')
//           .then(response => response.json())
//           .then(data => {
//               data.forEach(person => {
//                   const option = document.createElement('option');
//                   option.value = person.id;
//                   option.textContent = person.name;
//                   nameSelect.appendChild(option);
//                   name2Select.appendChild(option.cloneNode(true));
//               });
//           });
//   }

//   function updateDetails(selectElement, deptInput, posInput, nameInput) {
//       selectElement.addEventListener('change', function () {
//           const id = this.value;
//           if (id) {
//               fetch(`get_details.php?id=${id}`)
//                   .then(response => response.json())
//                   .then(data => {
//                       deptInput.value = data.dept;
//                       posInput.value = data.position;
//                       nameInput.value = data.name;
//                   });
//           } else {
//               deptInput.value = '';
//               posInput.value = '';
//               nameInput.value = '';
//           }
//       });
//   }

//   populateNames();
//   updateDetails(nameSelect, document.getElementById('dept'), document.getElementById('pos'), document.getElementById('nametext'));
//   updateDetails(name2Select, document.getElementById('dept2'), document.getElementById('pos2'), document.getElementById('nametext2'));
});

document.addEventListener('DOMContentLoaded', function() {
  const selectElement = document.getElementById('name');
  const savedValue = localStorage.getItem('selectedEmployee');

  // Set nilai terpilih jika ada di localStorage
  if (savedValue) {
      selectElement.value = savedValue;
  }

  // Ambil data dari server
  fetch('get_names.php')
      .then(response => response.json())
      .then(data => {
          const options = data.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
          selectElement.innerHTML = options;

          // Pastikan nilai yang tersimpan di localStorage ada di opsi yang diambil dari server
          if (savedValue && !Array.from(selectElement.options).some(option => option.value === savedValue)) {
              selectElement.value = '';
          }
      })
      .catch(error => console.error('Error:', error));

  // Simpan nilai yang dipilih ke localStorage saat ada perubahan
  selectElement.addEventListener('change', function() {
      localStorage.setItem('selectedEmployee', selectElement.value);
  });
});

// document.addEventListener('DOMContentLoaded', function () {
//   const nameSelect = document.getElementById('name');
//   const name2Select = document.getElementById('name2');

//   function populateNames() {
//       fetch('get_names.php')
//           .then(response => response.json())
//           .then(data => {
//               data.forEach(person => {
//                   const option = document.createElement('option');
//                   option.value = person.id;
//                   option.textContent = person.name;
//                   nameSelect.appendChild(option);
//                   name2Select.appendChild(option.cloneNode(true));
//               });

//               // Restore selected values
//               restoreSelectedOption(nameSelect, 'selectedNameId');
//               restoreSelectedOption(name2Select, 'selectedName2Id');
//           });
//   }

//   // Simpan pilihan ke Local Storage
//   document.getElementById('employees').addEventListener('change', function() {
//     localStorage.setItem('selectedEmployee', this.value);
// });

//   function updateDetails(selectElement, deptInput, posInput, nameInput, storageKey) {
//       selectElement.addEventListener('change', function () {
//           const id = this.value;
//           if (id) {
//               fetch(`get_details.php?id=${id}`)
//                   .then(response => response.json())
//                   .then(data => {
//                       deptInput.value = data.dept;
//                       posInput.value = data.position;
//                       nameInput.value = data.name;

//                       // Save to localStorage
//                       const details = {
//                           id: id,
//                           dept: data.dept,
//                           position: data.position,
//                           name: data.name
//                       };
//                       localStorage.setItem(storageKey, JSON.stringify(details));
//                       localStorage.setItem(storageKey + 'Id', id); // Save the selected ID
//                   });
//           } else {
//               deptInput.value = '';
//               posInput.value = '';
//               nameInput.value = '';

//               // Remove from localStorage
//               localStorage.removeItem(storageKey);
//               localStorage.removeItem(storageKey + 'Id');
//           }
//       });

//       // Load from localStorage
//       const savedDetails = localStorage.getItem(storageKey);
//       if (savedDetails) {
//           const details = JSON.parse(savedDetails);
//           deptInput.value = details.dept;
//           posInput.value = details.position;
//           nameInput.value = details.name;
//           selectElement.value = details.id; // Set the select value based on saved ID
//       }
//   }

//   function restoreSelectedOption(selectElement, storageKey) {
//       const savedId = localStorage.getItem(storageKey);
//       if (savedId) {
//           selectElement.value = savedId;
//           if (savedId) {
//               // Trigger change event to update details based on restored selection
//               const event = new Event('change');
//               selectElement.dispatchEvent(event);
//           }
//       }
//   }

//   // Check localStorage for existing data
//   const nameSelectSavedId = localStorage.getItem('selectedNameId');
//   const name2SelectSavedId = localStorage.getItem('selectedName2Id');

//   if (!nameSelectSavedId && !name2SelectSavedId) {
//       // Only populate names if no IDs are saved
//       populateNames();
//   } else {
//       // Restore selected options from localStorage
//       restoreSelectedOption(nameSelect, 'selectedNameId');
//       restoreSelectedOption(name2Select, 'selectedName2Id');
//   }

//   updateDetails(nameSelect, document.getElementById('dept'), document.getElementById('pos'), document.getElementById('nametext'), 'detailsNameSelect');
//   updateDetails(name2Select, document.getElementById('dept2'), document.getElementById('pos2'), document.getElementById('nametext2'), 'detailsName2Select');
// });


// Fungsi untuk memperbarui dropdown berdasarkan tanggal
function fromOptions() {
  const from1Date = document.getElementById('from1').value;
  const from1Day = new Date(from1Date).getDay();

  const weekdaysOptions = ['MOD'];
  const weekendsOptions = ['MOD 1', 'MOD 2'];

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

  // Update first set of selects
  if (from1Date) {
      populateSelect(document.getElementById('frommod1'), (from1Day === 0 || from1Day === 6) ? weekendsOptions : weekdaysOptions);
  }

  // Automatically fill second set of selects with same values as the first set
  document.getElementById('to2').value = from1Date;

  // Sync second set of selects with the same options
  syncSelectOptions('frommod1', 'tomod2');
}

// Fungsi untuk memperbarui dropdown berdasarkan tanggal
function toOptions() {
  const to1Date = document.getElementById('to1').value;
  const to1Day = new Date(to1Date).getDay();

  const weekdaysOptions = ['MOD'];
  const weekendsOptions = ['MOD 1', 'MOD 2'];

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

  // Update first set of selects
  if (to1Date) {
      populateSelect(document.getElementById('tomod1'), (to1Day === 0 || to1Day === 6) ? weekendsOptions : weekdaysOptions);
  }
  // Automatically fill second set of selects with same values as the first set
  document.getElementById('from2').value = to1Date;

  // Sync second set of selects with the same options
  syncSelectOptions('tomod1', 'frommod2');
}

// Fungsi untuk menyinkronkan opsi antara dropdown
function syncSelectOptions(sourceId, targetId) {
  const sourceSelect = document.getElementById(sourceId);
  const targetSelect = document.getElementById(targetId);

  // Copy options from source select to target select
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
  });

  tomod1.addEventListener('change', () => {
      syncSelectOptions('tomod1', 'frommod2');
  });
}

// Initial setup
fromOptions();
toOptions();
updateDropdownsOnChange();

