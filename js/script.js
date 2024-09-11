document.getElementById('save-btn').addEventListener('click', async function() {
    try {
        // Validate the form before proceeding
        if (!validateForm()) {
            loadingAlert.close();
            return;
        }

        // Get form data
        const formData = new FormData(document.getElementById('imageForm'));

        // Get signature data
        const signature1 = getSignatureData('signature1');
        const signature2 = getSignatureData('signature2');
        const signature3 = getSignatureData('signature3');
        const signature4 = getSignatureData('signature4');

        // Load and manipulate PDF
        const url = 'modreqform/ScheduleChangeMOD.pdf'; // URL to your PDF file
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Add text and signatures to the PDF
        firstPage.drawText(`${formData.get('nametext') || ''}`, { x: 188, y: 260, size: 10 });
        firstPage.drawText(`${formData.get('dept') || ''}`, { x: 188, y: 240, size: 10 });
        firstPage.drawText(`${formData.get('pos') || ''}`, { x: 188, y: 220, size: 10 });
        firstPage.drawText(`${formData.get('from1') || ''}`, { x: 188, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('frommod1') || ''}`, { x: 260, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('to1') || ''}`, { x: 188, y: 140, size: 10 });
        firstPage.drawText(`${formData.get('tomod1') || ''}`, { x: 260, y: 140, size: 10 });

        firstPage.drawText(`${formData.get('nametext2') || ''}`, { x: 380, y: 260, size: 10 });
        firstPage.drawText(`${formData.get('dept2') || ''}`, { x: 380, y: 240, size: 10 });
        firstPage.drawText(`${formData.get('pos2') || ''}`, { x: 380, y: 220, size: 10 });
        firstPage.drawText(`${formData.get('to1') || ''}`, { x: 380, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('tomod1') || ''}`, { x: 442, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('from1') || ''}`, { x: 380, y: 140, size: 10 });
        firstPage.drawText(`${formData.get('frommod1') || ''}`, { x: 442, y: 140, size: 10 });

        // Embed and draw signature images
        const signatureImage1 = await pdfDoc.embedPng(signature1);
        const signatureImage2 = await pdfDoc.embedPng(signature2);
        const signatureImage3 = await pdfDoc.embedPng(signature3);
        const signatureImage4 = await pdfDoc.embedPng(signature4);

        firstPage.drawImage(signatureImage1, { x: 40, y: 50, width: 115, height: 50 });
        firstPage.drawImage(signatureImage2, { x: 180, y: 50, width: 115, height: 50 });
        firstPage.drawImage(signatureImage3, { x: 314, y: 50, width: 115, height: 50 });
        firstPage.drawImage(signatureImage4, { x: 450, y: 50, width: 115, height: 50 });

        // Save PDF as blob
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Prepare form data for submission
        const uploadFormData = new FormData();
        uploadFormData.append('fileBlob', await blobToBase64(blob)); // Base64 encoding for blob
        uploadFormData.append('fileName', `MODReqform_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`);

        // Add form fields
        formData.forEach((value, key) => {
            uploadFormData.append(key, value);
        });

        // Show loading alert
        const loadingAlert = Swal.fire({
            title: 'Please wait...',
            text: 'Processing your request...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            customClass: {
                popup: 'rounded',
                confirmButton: 'roundedBtn'
            },
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Upload form data to Google Apps Script
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbytWiLuONk5Vb7hXmTl6ZMgWooFvz8uC_BbuavHnaGnmR_cndLMHVvfZlpXruEDxIC1zg/exec'; // Replace with your Google Apps Script URL
        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: uploadFormData
        });

        const result = await response.text();
        loadingAlert.close();
        Swal.fire({
            icon: 'info',
            title: 'Success!',
            text: result,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'rounded',
                confirmButton: 'roundedBtn'
            }
        }).then(() => {
            // Clear local storage
            localStorage.clear();
            // Add a delay before reloading
            setTimeout(() => {
                window.location.reload();
            }, 1000); // Delay in milliseconds (1000ms = 1 seconds)
        });
    } catch (error) {
        console.error('Error:', error);
        loadingAlert.close();
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something went wrong.',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'rounded',
                confirmButton: 'roundedBtn'
            }
        }).then(() => {
            // Add a delay before reloading
            setTimeout(() => {
                window.location.reload();
            }, 1000); // Delay in milliseconds (1000ms = 1 seconds)
        });
    }
});

function getSignatureData(canvasId) {
    const canvas = document.getElementById(canvasId);
    return canvas ? canvas.toDataURL('image/png') : '';
}

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result.split(',')[1]); // Remove the data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function validateForm() {
    let valid = true;

    // Check required fields
    const fields = ['name', 'dept', 'from1', 'to1', 'name2', 'dept2', 'from2', 'to2'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value.trim() === '') {
            valid = false;
            field.style.borderColor = 'red';
        } else {
            field.style.borderColor = '';
        }
    });

    // Check if signature canvases are filled
    const signatureFields = ['signature1', 'signature2', 'signature3', 'signature4'];
    signatureFields.forEach(id => {
        if (isCanvasEmpty(id)) {
            valid = false;
            document.getElementById(id).style.borderColor = 'red';
        } else {
            document.getElementById(id).style.borderColor = '';
        }
    });

    if (!valid) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops!',
            text: 'Please fill in all required fields and provide all necessary signatures.',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'rounded',
                confirmButton: 'roundedBtn'
            }
        });
    }    

    return valid;
}

// Function to check if the canvas is empty
function isCanvasEmpty(canvasId) {
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0 || data[i + 3] !== 0) {
            return false;
        }
    }
    return true;
}

function openDatePicker(inputId) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.focus(); // Focus on the date input to open the calendar
    } else {
        console.error('Input element not found:', inputId);
    }
}