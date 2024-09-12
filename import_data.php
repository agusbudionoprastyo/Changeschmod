<?php
// Konfigurasi database
$servername = "localhost";
$username = "dafm5634_ag";
$password = "Ag7us777__";
$dbname = "dafm5634_modschedule";

// Buat koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Periksa koneksi
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Ambil data JSON dari POST request
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    // Siapkan pernyataan SQL
    $stmt = $conn->prepare("INSERT INTO employees (name, dept) VALUES (?, ?)");
    
    if ($stmt === false) {
        die("Prepare failed: " . $conn->error);
    }

    foreach ($data as $row) {
        $col1 = $row[0];
        $col2 = $row[1];

        // Bind parameters and execute
        $stmt->bind_param("ss", $col1, $col2);

        if (!$stmt->execute()) {
            echo "Error: " . $stmt->error;
        }
    }
    
    // Tutup pernyataan
    $stmt->close();
}

// Tutup koneksi
$conn->close();
?>
