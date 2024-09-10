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

    // // Fetch Data
    // const nameSelect = document.getElementById('name');
    // const name2Select = document.getElementById('name2');

    // function populateNames() {
    //     fetch('get_names.php')
    //         .then(response => response.json())
    //         .then(data => {
    //             data.forEach(person => {
    //                 const option = document.createElement('option');
    //                 option.value = person.id;
    //                 option.textContent = person.name;
    //                 nameSelect.appendChild(option);
    //                 name2Select.appendChild(option.cloneNode(true));
    //             });
    //         });
    // }

    // function updateDetails(selectElement, deptInput, posInput, nameInput) {
    //     selectElement.addEventListener('change', function () {
    //         const id = this.value;
    //         if (id) {
    //             fetch(`get_details.php?id=${id}`)
    //                 .then(response => response.json())
    //                 .then(data => {
    //                     deptInput.value = data.dept;
    //                     posInput.value = data.position;
    //                     nameInput.value = data.name;
    //                 });
    //         } else {
    //             deptInput.value = '';
    //             posInput.value = '';
    //             nameInput.value = '';
    //         }
    //     });
    // }

    // populateNames();
    // updateDetails(nameSelect, document.getElementById('dept'), document.getElementById('pos'), document.getElementById('nametext'));
    // updateDetails(name2Select, document.getElementById('dept2'), document.getElementById('pos2'), document.getElementById('nametext2'));
    // Fetch Data
    const nameSelect = document.getElementById('name');
    const name2Select = document.getElementById('name2');

    function populateNames() {
        fetch('get_names.php')
            .then(response => response.json())
            .then(data => {
                data.forEach(person => {
                    const option1 = document.createElement('option');
                    option1.value = person.id;
                    option1.textContent = person.name;
                    nameSelect.appendChild(option1);

                    const option2 = document.createElement('option');
                    option2.value = person.id;
                    option2.textContent = person.name;
                    name2Select.appendChild(option2);
                });
            });
    }

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

                        // Simpan data ke localStorage setelah update
                        localStorage.setItem(`${selectElement.id}-dept`, data.dept);
                        localStorage.setItem(`${selectElement.id}-pos`, data.position);
                        localStorage.setItem(`${selectElement.id}-name`, data.name);
                    });
            } else {
                deptInput.value = '';
                posInput.value = '';
                nameInput.value = '';
            }
        });
    }

    // Panggil fungsi populateNames
    populateNames();

    // Panggil fungsi updateDetails untuk kedua dropdown
    updateDetails(nameSelect, document.getElementById('dept'), document.getElementById('pos'), document.getElementById('nametext'));
    updateDetails(name2Select, document.getElementById('dept2'), document.getElementById('pos2'), document.getElementById('nametext2'));

  });

//   function updateOptions() {
//     const from1Date = document.getElementById('from1').value;
//     const to1Date = document.getElementById('to1').value;
//     const from1Day = new Date(from1Date).getDay();
//     const to1Day = new Date(to1Date).getDay();
    
//     const weekdaysOptions = ['MOD'];
//     const weekendsOptions = ['MOD 1', 'MOD 2'];

//     function populateSelect(selectElement, options) {
//         selectElement.innerHTML = ''; // Clear existing options
//         options.forEach(option => {
//             const opt = document.createElement('option');
//             opt.value = option;
//             opt.text = option;
//             selectElement.add(opt);
//         });
//         selectElement.disabled = false; // Enable the select element
//     }

//     // Update first set of selects
//     if (from1Date) {
//         populateSelect(document.getElementById('frommod1'), (from1Day === 0 || from1Day === 6) ? weekendsOptions : weekdaysOptions);
//     }
//     if (to1Date) {
//         populateSelect(document.getElementById('tomod1'), (to1Day === 0 || to1Day === 6) ? weekendsOptions : weekdaysOptions);
//     }

//     // Automatically fill second set of selects with same values as the first set
//     document.getElementById('from2').value = to1Date;
//     document.getElementById('to2').value = from1Date;

//     // Sync second set of selects with the same options
//     syncSelectOptions('frommod1', 'tomod2');
//     syncSelectOptions('tomod1', 'frommod2');
// }

// function syncSelectOptions(sourceId, targetId) {
//     const sourceSelect = document.getElementById(sourceId);
//     const targetSelect = document.getElementById(targetId);

//     // Copy options from source select to target select
//     targetSelect.innerHTML = sourceSelect.innerHTML;

//     // Set target select value to match source select value if it exists
//     if (sourceSelect.value) {
//         targetSelect.value = sourceSelect.value;
//     }
// }

// // Initial setup
// updateOptions();

document.addEventListener('DOMContentLoaded', () => {
  // Setup awal
  updateOptions();

  // Tambahkan event listener untuk menangani perubahan
  document.getElementById('frommod1').addEventListener('change', () => {
      syncSelectOptions('frommod1', 'tomod2');
  });

  document.getElementById('tomod1').addEventListener('change', () => {
      syncSelectOptions('tomod1', 'frommod2');
  });
});

function updateOptions() {
  const from1Date = document.getElementById('from1').value;
  const to1Date = document.getElementById('to1').value;

  // Otomatis isi set kedua select dengan nilai dari set pertama
  document.getElementById('from2').value = to1Date;
  document.getElementById('to2').value = from1Date;

  // Sinkronisasi opsi antara select
  syncSelectOptions('frommod1', 'tomod2');
  syncSelectOptions('tomod1', 'frommod2');
}

function syncSelectOptions(sourceId, targetId) {
  const sourceSelect = document.getElementById(sourceId);
  const targetSelect = document.getElementById(targetId);

  // Salin opsi dari select sumber ke select target
  targetSelect.innerHTML = sourceSelect.innerHTML;

  // Atur nilai select target agar sesuai dengan nilai select sumber jika ada
  if (sourceSelect.value) {
      targetSelect.value = sourceSelect.value;
  }
}
