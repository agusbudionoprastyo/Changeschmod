document.addEventListener('DOMContentLoaded', () => {
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
          clearButton.addEventListener('click', () => {
              pads[i - 1].clear();
          });
      }
  
      // Event listener for Save Button
      if (i === 4) { // Assuming the last pad has a submit button
          const saveButton = document.querySelector(`#signature-pad-${i} #save-btn`);
          if (saveButton) {
              saveButton.addEventListener('click', () => {
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
  window.addEventListener("resize", () => {
      canvases.forEach(canvas => resizeCanvas(canvas));
  });

  // Setup for select and input elements
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
              // Call loadFromLocalStorage after populating names
              loadFromLocalStorage();
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
  
                      console.log(`Details for ${selectElement.id} updated and saved to localStorage:`, {
                          dept: data.dept,
                          pos: data.position,
                          name: data.name
                      });
                  });
          } else {
              deptInput.value = '';
              posInput.value = '';
              nameInput.value = '';
          }
      });
  }

  function saveToLocalStorage(event) {
      const { id, value } = event.target;
      localStorage.setItem(id, value);
      console.log(`Saved ${id} to localStorage:`, value);
  }

  function loadFromLocalStorage() {
      inputsAndSelects.forEach(input => {
          const savedValue = localStorage.getItem(input.id);
          if (savedValue !== null) {
              if (input.tagName === 'SELECT') {
                  // Pastikan opsi ada di select sebelum mengatur nilai
                  const optionExists = Array.from(input.options).some(option => option.value === savedValue);
                  if (optionExists) {
                      input.value = savedValue;
                      input.dispatchEvent(new Event('change'));
                      console.log(`Loaded ${input.id} from localStorage:`, savedValue);
                  } else {
                      console.log(`Option with value ${savedValue} not found in ${input.id}`);
                  }
              } else {
                  input.value = savedValue;
                  console.log(`Loaded ${input.id} from localStorage:`, savedValue);
              }
          }
      });

      // Memuat data canvas dari localStorage
      canvases.forEach(canvas => {
          const dataURL = localStorage.getItem(canvas.id);
          if (dataURL) {
              const ctx = canvas.getContext("2d");
              const img = new Image();
              img.onload = function() {
                  ctx.drawImage(img, 0, 0);
              };
              img.src = dataURL;
              console.log(`Loaded canvas data for ${canvas.id} from localStorage.`);
          }
      });
  }

  // Panggil fungsi populateNames
  const nameSelect = document.getElementById('name');
  const name2Select = document.getElementById('name2');
  const inputsAndSelects = document.querySelectorAll("input, select");
  
  // Panggil fungsi populateNames dan updateDetails setelah DOM siap
  populateNames();
  updateDetails(nameSelect, document.getElementById('dept'), document.getElementById('pos'), document.getElementById('nametext'));
  updateDetails(name2Select, document.getElementById('dept2'), document.getElementById('pos2'), document.getElementById('nametext2'));
});
