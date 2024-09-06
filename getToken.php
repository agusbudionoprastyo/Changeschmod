<?php
require_once 'helper/connection.php';

// Mendapatkan token_id dari input POST
$token_id = isset($_POST['token_id']) ? $_POST['token_id'] : '';

$query = mysqli_query($connection, "SELECT token_id FROM token_device WHERE token_id = '$token_id'");

if (mysqli_num_rows($query) > 0) {
    $row = mysqli_fetch_assoc($query);
    echo json_encode(['token_id' => $row["token_id"]]); // Mengirim data sebagai JSON
} else {
    echo json_encode(['error' => "No unpaired devices found"]);
}
$connection->close();
?>