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
    foreach ($data as $row) {
        $id = $conn->real_escape_string($row[0]);
        $name = $conn->real_escape_string($row[1]);
        $position = $conn->real_escape_string($row[2]);
        $dept = $conn->real_escape_string($row[3]);

        // Periksa apakah ID sudah ada di database
        $checkQuery = "SELECT COUNT(*) FROM employees WHERE ID = ?";
        $stmt = $conn->prepare($checkQuery);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            // Jika ID sudah ada, lakukan UPDATE
            $updateQuery = "UPDATE employees SET Name = ?, Position = ?, Dept = ? WHERE ID = ?";
            $stmt = $conn->prepare($updateQuery);
            $stmt->bind_param("ssss", $name, $position, $dept, $id);
        } else {
            // Jika ID belum ada, lakukan INSERT
            $insertQuery = "INSERT INTO employees (ID, Name, Position, Dept) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($insertQuery);
            $stmt->bind_param("ssss", $id, $name, $position, $dept);
        }

        if (!$stmt->execute()) {
            echo "Error: " . $stmt->error;
        }

        // Tutup pernyataan
        $stmt->close();
    }
}

// Tutup koneksi
$conn->close();
?>
