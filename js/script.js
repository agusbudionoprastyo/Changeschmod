document.getElementById('save-btn').addEventListener('click', async function() {
        // Show loading alert
        const loadingAlert = Swal.fire({
            title: 'Please wait...',
            text: 'Processing your request...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    try {
        // Get form data
        const formData = new FormData(document.getElementById('imageForm'));

        // Get signature data
        const signature1 = getSignatureData('signature-pad-1');
        const signature2 = getSignatureData('signature-pad-2');
        const signature3 = getSignatureData('signature-pad-3');
        const signature4 = getSignatureData('signature-pad-4');

        // Load PDF file
        const url = 'modreqform/ScheduleChangeMOD.pdf'; // URL to your PDF file
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

        // Adding text and signatures
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        firstPage.drawText(`${formData.get('name') || ''}`, { x: 188, y: 260, size: 10 });
        firstPage.drawText(`${formData.get('dept') || ''}`, { x: 188, y: 240, size: 10 });
        firstPage.drawText(`${formData.get('pos') || ''}`, { x: 188, y: 220, size: 10 });
        firstPage.drawText(`${formData.get('from1') || ''}`, { x: 188, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('frommod1') || ''}`, { x: 260, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('to1') || ''}`, { x: 188, y: 140, size: 10 });
        firstPage.drawText(`${formData.get('tomod1') || ''}`, { x: 260, y: 140, size: 10 });

        firstPage.drawText(`${formData.get('name2') || ''}`, { x: 380, y: 260, size: 10 });
        firstPage.drawText(`${formData.get('dept2') || ''}`, { x: 380, y: 240, size: 10 });
        firstPage.drawText(`${formData.get('pos2') || ''}`, { x: 380, y: 220, size: 10 });
        firstPage.drawText(`${formData.get('from2') || ''}`, { x: 380, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('frommod2') || ''}`, { x: 442, y: 160, size: 10 });
        firstPage.drawText(`${formData.get('to2') || ''}`, { x: 380, y: 140, size: 10 });
        firstPage.drawText(`${formData.get('tomod2') || ''}`, { x: 442, y: 140, size: 10 });

        // Adding signature images
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
        uploadFormData.append('fileBlob', await blobToBase64(blob)); // Use base64 encoding for blob
        uploadFormData.append('fileName', `MODReqform_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`);
        
        // Add form fields
        formData.forEach((value, key) => {
            uploadFormData.append(key, value);
        });

        // Upload form data to Google Apps Script
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbytWiLuONk5Vb7hXmTl6ZMgWooFvz8uC_BbuavHnaGnmR_cndLMHVvfZlpXruEDxIC1zg/exec'; // Replace with your Google Apps Script URL
        try {
            const response = await fetch(scriptUrl, {
                method: 'POST',
                body: uploadFormData
            });

            const result = await response.text();
            loadingAlert.close();
            Swal.fire({
                title: 'Success!',
                text: result,
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Something went wrong.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Something went wrong.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});

function getSignatureData(canvasId) {
    const canvas = document.querySelector(`#${canvasId} canvas`);
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