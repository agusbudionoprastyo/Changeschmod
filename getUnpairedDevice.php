<?php
require_once 'helper/connection.php';

$query = mysqli_query($connection, "SELECT token_id FROM token_device WHERE status = '0' LIMIT 1");

if (mysqli_num_rows($query) > 0) {
    $row = mysqli_fetch_assoc($query);
    echo json_encode(['token_id' => $row["token_id"]]); // Mengirim data sebagai JSON
} else {
    echo json_encode(['error' => "No unpaired devices found"]);
}
$connection->close();
?>