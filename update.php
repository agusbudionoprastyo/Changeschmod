<?php
// Koneksi ke database dan ambil data
require_once 'helper/connection.php';

// Set header untuk SSE
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

// Ambil device_token dari data GET
$deviceToken = $_GET['device_token'] ?? 'default_token'; // Gunakan default token jika tidak ada yang dikirim

// Ambil last_id dari tabel device_token
$queryLastId = mysqli_query($connection, "SELECT regcard_id AS last_id FROM token_device WHERE token_id = '$deviceToken'");
if (!$queryLastId) {
    echo "Error: " . mysqli_error($connection) . "\n"; // Tampilkan error jika query gagal
}
$lastIdData = mysqli_fetch_assoc($queryLastId);
if ($lastIdData) {
    $lastId = $lastIdData['last_id'] ?? 0;
    echo "Fetched lastId from token_device: $lastId\n"; // Debug: Cetak lastId yang diambil
} else {
    echo "No data found for token_id: $deviceToken\n"; // Debug: Tidak ada data ditemukan
}

while (true) {
    // Ambil last_id dari tabel device_token setiap kali loop
    $queryLastId = mysqli_query($connection, "SELECT regcard_id AS last_id FROM token_device WHERE token_id = '$deviceToken'");
    $lastIdData = mysqli_fetch_assoc($queryLastId);
    $lastId = $lastIdData['last_id'] ?? 0;

    $query = mysqli_query($connection, "SELECT * FROM FOGUEST WHERE folio = '$lastId'");
    while ($row = mysqli_fetch_array($query)) {
        echo "data: " . json_encode($row) . "\n\n";
        flush(); // Pastikan data terkirim
        $lastId = $row['folio']; // Perbarui last_id dengan id terbaru yang dikirim
    }

    sleep(1); // Anda bisa sesuaikan waktu sesuai kebutuhan
}
?>