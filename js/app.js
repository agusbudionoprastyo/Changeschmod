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
                  if (!pads[i - 1].isEmpty()) {
                      const dataURL = pads[i - 1].toDataURL();
                      console.log(`Signature ${i} data URL:`, dataURL);
                      // Handle the data URL (e.g., send it to a server or display it)
                  } else {
                      alert('Please provide a signature before submitting.');
                  }
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

  const dateInputs = {
      sch1: document.getElementById('sch1'),
      sch2: document.getElementById('sch2')
  };

  const selectElements = {
      mod: document.getElementById('mod'),
      mod2: document.getElementById('mod2')
  };

  function updateOptions(dateInputId, selectId) {
      const dateValue = dateInputs[dateInputId].value;
      const selectedDate = new Date(dateValue);
      const selectElement = selectElements[selectId];

      if (!dateValue) return; // Exit if no date is selected

      // Clear existing options
      selectElement.innerHTML = '';

      // Determine if the selected date is a weekend or weekday
      const dayOfWeek = selectedDate.getDay();
      let options;

      if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Weekend (Saturday or Sunday)
          options = [
              { value: 'MOD 1', text: 'MOD 1' },
              { value: 'MOD 2', text: 'MOD 2' }
          ];
      } else {
          // Weekday (Monday to Friday)
          options = [
              { value: 'MOD', text: 'MOD' }
          ];
      }

      // Add new options to the select element
      options.forEach(option => {
          const opt = document.createElement('option');
          opt.value = option.value;
          opt.textContent = option.text;
          selectElement.appendChild(opt);
      });
  }

  // Event listeners for each date input
  dateInputs.sch1.addEventListener('change', function() {
      updateOptions('sch1', 'mod');
  });

  dateInputs.sch2.addEventListener('change', function() {
      updateOptions('sch2', 'mod2');
  });

  // Initial calls to set the correct options based on current date
  updateOptions('sch1', 'mod');
  updateOptions('sch2', 'mod2');
});