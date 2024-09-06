<?php
require_once 'helper/connection.php';

if (isset($_POST['token_id']) && isset($_POST['regcard_id'])) {
    $token_id = $_POST['token_id'];
    $regcard_id = $_POST['regcard_id']; // Menerima status dari permintaan POST

    // Memperbarui query untuk menggunakan status yang diterima dari permintaan
    $query = mysqli_query($connection, "UPDATE token_device SET regcard_id = '$regcard_id' WHERE token_id = '$token_id'");

    if ($query) {
        echo "Status updated successfully";
    } else {
        echo "Failed to update status";
    }
} else {
    echo "Token ID or status not provided";
}
$connection->close();
?>